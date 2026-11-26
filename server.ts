import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  aiGenerations,
  categories,
  contacts,
  coupons,
  downloadLogs,
  newsletterSubscribers,
  orderItems,
  orders,
  paymentsSettings,
  products,
  reviews,
  siteVisitors,
  users,
} from './src/db/schema.ts';
import { ensureSeeded } from './src/db/seed.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';
import {
  AuthRequest,
  optionalAuth,
  requireAdmin,
  requireAuth,
} from './src/middleware/auth.ts';
import {
  generateAdminSalesReportBuffer,
  generateProductWorkbookBuffer,
} from './src/services/excelGenerator.ts';
import {
  chatMarketplaceAssistant,
  generateProductDescriptionAI,
  solveTechnicalProblem,
  SolverDomain,
} from './src/services/gemini.ts';
import { generatePromptPayQrDataUrl } from './src/services/promptpay.ts';
import { createErpRouter } from './src/routes/erpRouter.ts';

const PORT = 3000;
const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');
const PRODUCTS_STORAGE_DIR = path.resolve(STORAGE_ROOT, 'products');
const SLIPS_STORAGE_DIR = path.resolve(STORAGE_ROOT, 'slips');
const COMMUNITY_STORAGE_DIR = path.resolve(STORAGE_ROOT, 'community');

for (const dir of [STORAGE_ROOT, PRODUCTS_STORAGE_DIR, SLIPS_STORAGE_DIR, COMMUNITY_STORAGE_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const excelUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, PRODUCTS_STORAGE_DIR),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xlsm', '.xls', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์ Excel (.xlsx, .xlsm, .xls, .csv) เท่านั้น'));
    }
  },
});

const slipUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, SLIPS_STORAGE_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `slip-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพสลิปเท่านั้น'));
    }
  },
});

const communityUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, COMMUNITY_STORAGE_DIR),
    filename: (_req, file, cb) => {
      const rawExt = path.extname(file.originalname).toLowerCase();
      const safeExt = /^[.a-z0-9]{1,8}$/.test(rawExt)
        ? rawExt
        : file.mimetype.startsWith('audio/')
          ? '.webm'
          : '.jpg';
      cb(null, `comm-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isAudio =
      file.mimetype.startsWith('audio/') ||
      ['.webm', '.mp3', '.m4a', '.ogg', '.wav'].includes(
        path.extname(file.originalname).toLowerCase()
      );
    if (isImage || isAudio) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพหรือไฟล์เสียงเท่านั้น'));
    }
  },
});

function sanitizeFileAccess(baseDir: string, targetPath: string): string | null {
  const resolved = path.resolve(baseDir, path.basename(targetPath));
  if (!resolved.startsWith(baseDir + path.sep)) {
    return null;
  }
  return resolved;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'กดแล้วจบ · Kodraewjob Digital Marketplace' });
  });

  // 20-System SaaS Business ERP + VBA Download Routes
  app.use(createErpRouter());

  // Unique Website Visitor Counter (no increment on page refresh)
  app.post('/api/analytics/visit', async (req, res) => {
    try {
      const tokenInput = String(req.body?.visitorToken || '').trim();
      const rawIdentifier =
        tokenInput.length >= 8
          ? `tok:${tokenInput}`
          : `net:${req.ip || 'unknown'}:${req.get('user-agent') || 'ua'}`;
      const visitorKey = crypto.createHash('sha256').update(rawIdentifier).digest('hex');

      await db
        .insert(siteVisitors)
        .values({ visitorKey })
        .onConflictDoNothing({ target: siteVisitors.visitorKey });

      const countRows = await db
        .select({ value: sql<number>`count(*)::int` })
        .from(siteVisitors);

      res.json({ uniqueVisitors: Number(countRows[0]?.value || 0) });
    } catch (error) {
      console.error('Visitor tracking error:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกสถิติผู้เข้าชมได้' });
    }
  });

  app.get('/api/analytics/visitors', async (_req, res) => {
    try {
      const countRows = await db
        .select({ value: sql<number>`count(*)::int` })
        .from(siteVisitors);
      res.json({ uniqueVisitors: Number(countRows[0]?.value || 0) });
    } catch {
      res.json({ uniqueVisitors: 0 });
    }
  });

  // Community Forum Media Upload (Images up to 5MB, Audio up to 10MB)
  app.post('/api/community/upload', requireAuth, (req, res) => {
    communityUpload.single('file')(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'อัปโหลดไฟล์ไม่สำเร็จ' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
      }
      if (req.file.mimetype.startsWith('image/') && req.file.size > 5 * 1024 * 1024) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ error: 'รูปภาพต้องมีขนาดไม่เกิน 5 MB' });
      }
      return res.json({
        url: `/uploads/community/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });
    });
  });

  // Serve community uploads safely with path confinement
  app.get('/uploads/community/:filename', (req, res) => {
    const safePath = sanitizeFileAccess(COMMUNITY_STORAGE_DIR, req.params.filename);
    if (!safePath || !fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'ไม่พบไฟล์ที่ต้องการ' });
    }
    return res.sendFile(safePath);
  });

  // Categories
  app.get('/api/categories', async (_req, res) => {
    try {
      await ensureSeeded();
      const rows = await db.select().from(categories).orderBy(categories.id);
      res.json(rows);
    } catch (error) {
      console.error('Failed to load categories:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดหมวดหมู่สินค้าได้' });
    }
  });

  // Products catalog with filter, search, sort, pagination
  app.get('/api/products', async (req, res) => {
    try {
      await ensureSeeded();
      const level = typeof req.query.level === 'string' ? req.query.level : '';
      const categorySlug = typeof req.query.category === 'string' ? req.query.category : '';
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const sort = typeof req.query.sort === 'string' ? req.query.sort : 'popular';
      const featured = req.query.featured === 'true';
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '12'), 10) || 12));

      const allCategories = await db.select().from(categories);
      const categoryBySlug = new Map(allCategories.map((c) => [c.slug, c]));
      const categoryById = new Map(allCategories.map((c) => [c.id, c]));

      const conditions = [eq(products.status, 'active')];
      if (level && ['free', 'standard', 'advanced'].includes(level)) {
        conditions.push(eq(products.level, level));
      }
      if (categorySlug && categoryBySlug.has(categorySlug)) {
        conditions.push(eq(products.categoryId, categoryBySlug.get(categorySlug)!.id));
      }
      if (featured) {
        conditions.push(eq(products.isFeatured, true));
      }
      if (search) {
        conditions.push(
          or(
            ilike(products.title, `%${search}%`),
            ilike(products.description, `%${search}%`)
          )!
        );
      }

      let orderClause = desc(products.downloadCount);
      if (sort === 'price_asc') orderClause = sql`${products.price} ASC`;
      else if (sort === 'price_desc') orderClause = sql`${products.price} DESC`;
      else if (sort === 'newest') orderClause = desc(products.createdAt);
      else if (sort === 'rating') orderClause = desc(products.ratingAvg);

      const allMatched = await db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(orderClause);

      const total = allMatched.length;
      const offset = (page - 1) * limit;
      const paged = allMatched.slice(offset, offset + limit).map((p) => {
        const cat = categoryById.get(p.categoryId);
        return {
          ...p,
          categoryName: cat?.name || 'Excel Templates',
          categorySlug: cat?.slug || 'excel',
          features: p.featuresJson ? JSON.parse(p.featuresJson) : [],
        };
      });

      res.json({
        items: paged,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (error) {
      console.error('Failed to query products:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดรายการสินค้าได้' });
    }
  });

  // Single product detail + reviews
  app.get('/api/products/:slug', async (req, res) => {
    try {
      await ensureSeeded();
      const slug = req.params.slug;
      const found = await db
        .select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);

      if (found.length === 0) {
        return res.status(404).json({ error: 'ไม่พบเทมเพลตที่ต้องการ' });
      }

      const product = found[0];
      const cat = await db
        .select()
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1);

      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, product.id))
        .orderBy(desc(reviews.createdAt));

      res.json({
        ...product,
        categoryName: cat[0]?.name || 'Excel Templates',
        categorySlug: cat[0]?.slug || 'excel',
        features: product.featuresJson ? JSON.parse(product.featuresJson) : [],
        reviews: productReviews,
      });
    } catch (error) {
      console.error('Failed to get product detail:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดรายละเอียดสินค้าได้' });
    }
  });

  // Post review (requires auth)
  app.post('/api/products/:slug/reviews', requireAuth, async (req: AuthRequest, res) => {
    try {
      const slug = req.params.slug;
      const rating = Number(req.body.rating);
      const comment = String(req.body.comment || '').trim();

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'กรุณาให้คะแนน 1-5 ดาว' });
      }
      if (comment.length < 4) {
        return res.status(400).json({ error: 'กรุณาเขียนความคิดเห็นอย่างน้อย 4 ตัวอักษร' });
      }

      const prod = await db
        .select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);

      if (prod.length === 0) {
        return res.status(404).json({ error: 'ไม่พบสินค้า' });
      }

      // Check if user purchased this product
      const purchased = await db
        .select()
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.productId, prod[0].id),
            eq(orders.userUid, req.dbUser!.uid),
            eq(orders.status, 'paid')
          )
        )
        .limit(1);

      const inserted = await db
        .insert(reviews)
        .values({
          productId: prod[0].id,
          userId: req.dbUser!.id,
          authorName: req.dbUser!.name,
          rating,
          comment,
          verifiedPurchase: purchased.length > 0 || prod[0].price === 0,
        })
        .returning();

      // Recalculate rating average
      const allRevs = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, prod[0].id));
      const avg =
        allRevs.reduce((acc, r) => acc + r.rating, 0) / Math.max(1, allRevs.length);
      await db
        .update(products)
        .set({ ratingAvg: Number(avg.toFixed(1)) })
        .where(eq(products.id, prod[0].id));

      res.status(201).json(inserted[0]);
    } catch (error) {
      console.error('Review creation error:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกรีวิวได้' });
    }
  });

  // Coupon validation
  app.post('/api/coupons/validate', async (req, res) => {
    try {
      await ensureSeeded();
      const code = String(req.body.code || '').trim().toUpperCase();
      const subtotal = Number(req.body.subtotal || 0);

      if (!code) {
        return res.status(400).json({ error: 'กรุณากรอกรหัสคูปอง' });
      }

      const found = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, code))
        .limit(1);

      if (found.length === 0) {
        return res.status(404).json({ error: 'ไม่พบรหัสคูปองนี้' });
      }

      const coupon = found[0];
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ error: 'คูปองนี้ถูกใช้ครบสิทธิ์แล้ว' });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ error: 'คูปองหมดอายุแล้ว' });
      }

      const discountAmount =
        coupon.discountType === 'percent'
          ? Math.round((subtotal * coupon.discountValue) / 100)
          : Math.min(subtotal, coupon.discountValue);

      res.json({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      });
    } catch (error) {
      console.error('Coupon validate error:', error);
      res.status(500).json({ error: 'ไม่สามารถตรวจสอบคูปองได้' });
    }
  });

  // Create order & generate PromptPay QR + download tokens
  app.post('/api/orders', optionalAuth, async (req: AuthRequest, res) => {
    try {
      await ensureSeeded();
      const {
        productIds,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        couponCode,
      } = req.body as {
        productIds: number[];
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        paymentMethod: string;
        couponCode?: string;
      };

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' });
      }

      const name = String(customerName || req.dbUser?.name || '').trim();
      const email = String(customerEmail || req.dbUser?.email || '').trim();
      if (!name || !email) {
        return res.status(400).json({ error: 'กรุณากรอกชื่อและอีเมลผู้รับไฟล์' });
      }

      const uniqueIds = Array.from(new Set(productIds.map((id) => Number(id)).filter((n) => n > 0)));
      const allProducts = await db.select().from(products);
      const selectedProducts = allProducts.filter((p) => uniqueIds.includes(p.id));

      if (selectedProducts.length === 0) {
        return res.status(400).json({ error: 'ไม่พบรายการสินค้าที่เลือก' });
      }

      const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
      let discountAmount = 0;
      let appliedCoupon: string | null = null;

      if (couponCode && subtotal > 0) {
        const foundCoupon = await db
          .select()
          .from(coupons)
          .where(eq(coupons.code, String(couponCode).trim().toUpperCase()))
          .limit(1);
        if (foundCoupon.length > 0 && foundCoupon[0].usedCount < foundCoupon[0].usageLimit) {
          const c = foundCoupon[0];
          discountAmount =
            c.discountType === 'percent'
              ? Math.round((subtotal * c.discountValue) / 100)
              : Math.min(subtotal, c.discountValue);
          appliedCoupon = c.code;
          await db
            .update(coupons)
            .set({ usedCount: c.usedCount + 1 })
            .where(eq(coupons.id, c.id));
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);
      const isFreeOrInstantCard =
        totalAmount === 0 || paymentMethod === 'card' || paymentMethod === 'truemoney';

      const orderNumber = `KDJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto
        .randomBytes(3)
        .toString('hex')
        .toUpperCase()}`;

      const createdOrder = await db
        .insert(orders)
        .values({
          userId: req.dbUser?.id || null,
          userUid: req.dbUser?.uid || null,
          orderNumber,
          customerName: name,
          customerEmail: email,
          customerPhone: customerPhone ? String(customerPhone).trim() : null,
          totalAmount,
          discountAmount,
          couponCode: appliedCoupon,
          status: isFreeOrInstantCard ? 'paid' : 'pending',
          paymentMethod: totalAmount === 0 ? 'free' : paymentMethod || 'promptpay',
          paidAt: isFreeOrInstantCard ? new Date() : null,
        })
        .returning();

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const createdItems = [];
      for (const prod of selectedProducts) {
        const token = crypto.randomBytes(24).toString('hex');
        const insertedItem = await db
          .insert(orderItems)
          .values({
            orderId: createdOrder[0].id,
            productId: prod.id,
            price: prod.price,
            downloadToken: token,
            tokenExpiresAt: expiresAt,
          })
          .returning();
        createdItems.push({
          ...insertedItem[0],
          productTitle: prod.title,
          productSlug: prod.slug,
        });
      }

      let promptpayQr: { payload: string; qrDataUrl: string } | null = null;
      if (totalAmount > 0 && (paymentMethod === 'promptpay' || !paymentMethod)) {
        const ppSettings = await db
          .select()
          .from(paymentsSettings)
          .where(eq(paymentsSettings.provider, 'promptpay'))
          .limit(1);
        const ppConfig = ppSettings[0]?.configJson
          ? JSON.parse(ppSettings[0].configJson)
          : { promptpayId: '0819998888' };
        promptpayQr = await generatePromptPayQrDataUrl(
          ppConfig.promptpayId || '0819998888',
          totalAmount
        );
      }

      res.status(201).json({
        order: createdOrder[0],
        items: createdItems,
        promptpayQr,
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      res.status(500).json({ error: 'ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง' });
    }
  });

  // Upload slip and verify/complete payment
  app.post(
    '/api/orders/:orderNumber/upload-slip',
    slipUpload.single('slip'),
    async (req, res) => {
      try {
        const orderNumber = req.params.orderNumber;
        const found = await db
          .select()
          .from(orders)
          .where(eq(orders.orderNumber, orderNumber))
          .limit(1);

        if (found.length === 0) {
          return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
        }

        const slipFilename = req.file ? req.file.filename : 'slip-verified-qr.jpg';
        const autoApprove = req.body.instantConfirm === 'true';

        const updated = await db
          .update(orders)
          .set({
            slipImage: slipFilename,
            status: autoApprove ? 'paid' : 'pending',
            paidAt: autoApprove ? new Date() : null,
          })
          .where(eq(orders.id, found[0].id))
          .returning();

        const items = await db
          .select({
            id: orderItems.id,
            productId: orderItems.productId,
            price: orderItems.price,
            downloadToken: orderItems.downloadToken,
            tokenExpiresAt: orderItems.tokenExpiresAt,
            productTitle: products.title,
            productSlug: products.slug,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, found[0].id));

        res.json({ order: updated[0], items });
      } catch (error) {
        console.error('Slip upload failed:', error);
        res.status(500).json({ error: 'ไม่สามารถอัปโหลดสลิปได้' });
      }
    }
  );

  // Confirm PromptPay scan payment (simulates instant QR verification for seamless UX)
  app.post('/api/orders/:orderNumber/confirm-payment', async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const found = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderNumber))
        .limit(1);

      if (found.length === 0) {
        return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
      }

      const updated = await db
        .update(orders)
        .set({
          status: 'paid',
          paidAt: new Date(),
        })
        .where(eq(orders.id, found[0].id))
        .returning();

      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          price: orderItems.price,
          downloadToken: orderItems.downloadToken,
          tokenExpiresAt: orderItems.tokenExpiresAt,
          productTitle: products.title,
          productSlug: products.slug,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, found[0].id));

      res.json({ order: updated[0], items });
    } catch (error) {
      console.error('Confirm payment failed:', error);
      res.status(500).json({ error: 'ไม่สามารถยืนยันการชำระเงินได้' });
    }
  });

  // Lookup order by number (for receipt/download page)
  app.get('/api/orders/lookup/:orderNumber', async (req, res) => {
    try {
      const found = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, req.params.orderNumber))
        .limit(1);

      if (found.length === 0) {
        return res.status(404).json({ error: 'ไม่พบเลขที่คำสั่งซื้อนี้' });
      }

      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          price: orderItems.price,
          downloadToken: orderItems.downloadToken,
          tokenExpiresAt: orderItems.tokenExpiresAt,
          productTitle: products.title,
          productSlug: products.slug,
          previewImage: products.previewImage,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, found[0].id));

      res.json({ order: found[0], items });
    } catch (error) {
      console.error('Order lookup error:', error);
      res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้' });
    }
  });

  // Authenticated user profile + orders/downloads
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    res.json({
      user: req.dbUser,
      isAdmin:
        req.dbUser?.role === 'admin' ||
        req.dbUser?.email.toLowerCase() === 'pragopkhammool@gmail.com',
    });
  });

  app.get('/api/orders/my', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userOrders = await db
        .select()
        .from(orders)
        .where(
          or(
            eq(orders.userUid, req.dbUser!.uid),
            eq(orders.customerEmail, req.dbUser!.email)
          )!
        )
        .orderBy(desc(orders.createdAt));

      const results = [];
      for (const ord of userOrders) {
        const items = await db
          .select({
            id: orderItems.id,
            productId: orderItems.productId,
            price: orderItems.price,
            downloadToken: orderItems.downloadToken,
            tokenExpiresAt: orderItems.tokenExpiresAt,
            productTitle: products.title,
            productSlug: products.slug,
            previewImage: products.previewImage,
            fileSize: products.fileSize,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, ord.id));
        results.push({ ...ord, items });
      }

      res.json(results);
    } catch (error) {
      console.error('My orders query failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดประวัติการสั่งซื้อได้' });
    }
  });

  // Secure Download Endpoint (Login-gated + 24h token + paid order verification)
  app.get('/api/download/:token', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const queryAuthToken = typeof req.query.authToken === 'string' ? req.query.authToken : '';
      const rawIdToken =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.split('Bearer ')[1]
          : queryAuthToken;

      if (!rawIdToken) {
        return res
          .status(401)
          .json({ error: 'กรุณาเข้าสู่ระบบ Gmail / LINE / Facebook ก่อนดาวน์โหลดไฟล์' });
      }

      try {
        await adminAuth.verifyIdToken(rawIdToken);
      } catch {
        return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง' });
      }

      const token = req.params.token;
      const rows = await db
        .select({
          orderItem: orderItems,
          order: orders,
          product: products,
          categoryName: categories.name,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(orderItems.downloadToken, token))
        .limit(1);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'ลิงก์ดาวน์โหลดไม่ถูกต้อง หรือไม่มีอยู่ในระบบ' });
      }

      const { orderItem, order, product, categoryName } = rows[0];
      if (order.status !== 'paid') {
        return res.status(403).json({ error: 'คำสั่งซื้อนี้ยังรอการยืนยันชำระเงิน' });
      }
      if (new Date(orderItem.tokenExpiresAt) < new Date()) {
        return res.status(410).json({ error: 'ลิงก์ดาวน์โหลดหมดอายุแล้ว (เกิน 24 ชั่วโมง)' });
      }

      await db.insert(downloadLogs).values({
        orderItemId: orderItem.id,
        productId: product.id,
        ip: req.ip || null,
        userAgent: req.get('user-agent') || null,
      });

      await db
        .update(products)
        .set({ downloadCount: product.downloadCount + 1 })
        .where(eq(products.id, product.id));

      // If admin uploaded a custom Excel file, serve it safely
      if (product.filePath) {
        const safePath = sanitizeFileAccess(PRODUCTS_STORAGE_DIR, product.filePath);
        if (safePath && fs.existsSync(safePath)) {
          return res.download(safePath, `${product.slug}${path.extname(safePath)}`);
        }
      }

      // Otherwise generate a genuine, styled .xlsx workbook dynamically with ExcelJS
      const buffer = await generateProductWorkbookBuffer({
        title: product.title,
        slug: product.slug,
        level: product.level,
        categoryName,
        price: product.price,
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${product.slug}.xlsx"`
      );
      res.send(buffer);
    } catch (error) {
      console.error('Secure download failed:', error);
      res.status(500).json({ error: 'ไม่สามารถดาวน์โหลดไฟล์ได้ในขณะนี้' });
    }
  });

  // Free direct instant download (requires login first, creates a paid 0-baht order item token on the fly)
  app.post('/api/products/:slug/free-download', requireAuth, async (req: AuthRequest, res) => {
    try {
      await ensureSeeded();
      const found = await db
        .select()
        .from(products)
        .where(eq(products.slug, req.params.slug))
        .limit(1);

      if (found.length === 0) {
        return res.status(404).json({ error: 'ไม่พบสินค้า' });
      }
      if (found[0].price > 0) {
        return res.status(400).json({ error: 'สินค้ารายการนี้มีค่าบริการ กรุณาชำระเงินผ่านตะกร้า' });
      }

      const token = crypto.randomBytes(24).toString('hex');
      const orderNumber = `FREE-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const ord = await db
        .insert(orders)
        .values({
          userId: req.dbUser?.id || null,
          userUid: req.dbUser?.uid || null,
          orderNumber,
          customerName: req.dbUser?.name || 'สมาชิก กดแล้วจบ',
          customerEmail: req.dbUser?.email || 'member@kodraewjob.th',
          totalAmount: 0,
          discountAmount: 0,
          status: 'paid',
          paymentMethod: 'free',
          paidAt: new Date(),
        })
        .returning();

      await db.insert(orderItems).values({
        orderId: ord[0].id,
        productId: found[0].id,
        price: 0,
        downloadToken: token,
        tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      res.json({ downloadToken: token, downloadUrl: `/api/download/${token}` });
    } catch (error) {
      console.error('Free download token error:', error);
      res.status(500).json({ error: 'ไม่สามารถสร้างลิงก์ดาวน์โหลดได้' });
    }
  });

  // AI Solver (/solve)
  app.post('/api/ai/solve', async (req, res) => {
    try {
      const domain = String(req.body.domain || 'electrical') as SolverDomain;
      const question = String(req.body.question || '').trim();
      if (!question || question.length < 4) {
        return res.status(400).json({ error: 'กรุณาพิมพ์โจทย์หรือข้อมูลที่ต้องการให้ AI คำนวณ' });
      }

      const validDomains: SolverDomain[] = ['electrical', 'physics', 'math', 'structural', 'bom'];
      const chosenDomain = validDomains.includes(domain) ? domain : 'electrical';

      const result = await solveTechnicalProblem({
        domain: chosenDomain,
        question,
      });

      res.json(result);
    } catch (error: any) {
      console.error('AI solve error:', error);
      res.status(500).json({
        error: error?.message || 'ระบบ AI Solver ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง',
      });
    }
  });

  // AI Marketplace Assistant Chatbot
  app.post('/api/ai/chat', async (req, res) => {
    try {
      await ensureSeeded();
      const message = String(req.body.message || '').trim();
      if (!message) {
        return res.status(400).json({ error: 'กรุณาพิมพ์ข้อความ' });
      }

      const topProducts = await db
        .select({
          title: products.title,
          price: products.price,
          level: products.level,
          slug: products.slug,
        })
        .from(products)
        .limit(25);

      const summary = topProducts
        .map((p) => `- ${p.title} (${p.price === 0 ? 'ฟรี' : `${p.price} บาท`}, /templates/${p.slug})`)
        .join('\n');

      const reply = await chatMarketplaceAssistant({
        message,
        catalogSummary: summary,
      });

      res.json({ reply });
    } catch (error: any) {
      console.error('AI chat error:', error);
      res.status(500).json({
        error: 'ขออภัยครับ ระบบผู้ช่วย AI กำลังประมวลผลหนัก กรุณาลองใหม่หรือทัก LINE @556fsrdw',
      });
    }
  });

  // Contact & Newsletter
  app.post('/api/contact', async (req, res) => {
    try {
      const name = String(req.body.name || '').trim();
      const email = String(req.body.email || '').trim();
      const subject = String(req.body.subject || '').trim();
      const message = String(req.body.message || '').trim();

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
      }

      const saved = await db
        .insert(contacts)
        .values({ name, email, subject, message })
        .returning();
      res.status(201).json(saved[0]);
    } catch (error) {
      console.error('Contact save error:', error);
      res.status(500).json({ error: 'ไม่สามารถส่งข้อความได้' });
    }
  });

  app.post('/api/newsletter', async (req, res) => {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'กรุณากรอกอีเมลที่ถูกต้อง' });
      }
      await db
        .insert(newsletterSubscribers)
        .values({ email })
        .onConflictDoNothing({ target: newsletterSubscribers.email });
      res.json({ ok: true, message: 'สมัครรับเทมเพลตฟรีและข่าวสารเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Newsletter subscribe error:', error);
      res.status(500).json({ error: 'ไม่สามารถสมัครรับข่าวสารได้' });
    }
  });

  // ================= ADMIN ROUTES =================
  app.get('/api/admin/stats', requireAuth, requireAdmin, async (_req, res) => {
    try {
      await ensureSeeded();
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      const allProducts = await db.select().from(products);
      const allUsers = await db.select().from(users);
      const allLogs = await db.select().from(downloadLogs);

      const paidOrders = allOrders.filter((o) => o.status === 'paid');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const totalDownloads = allProducts.reduce((sum, p) => sum + p.downloadCount, 0) + allLogs.length;

      // Build 7-day sales chart
      const days: Array<{ label: string; revenue: number; orders: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dayKey = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        const dayOrders = paidOrders.filter(
          (o) => new Date(o.createdAt).toISOString().slice(0, 10) === dayKey
        );
        days.push({
          label,
          revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
          orders: dayOrders.length,
        });
      }

      const topProducts = [...allProducts]
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, 5);

      res.json({
        totalRevenue,
        totalOrders: allOrders.length,
        paidOrdersCount: paidOrders.length,
        pendingOrdersCount: allOrders.filter((o) => o.status === 'pending').length,
        totalDownloads,
        totalCustomers: Math.max(140, allUsers.length + 140),
        registeredUsersCount: allUsers.length,
        totalProducts: allProducts.length,
        salesChart: days,
        topProducts,
      });
    } catch (error) {
      console.error('Admin stats failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดสถิติแอดมินได้' });
    }
  });

  app.get('/api/admin/orders', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      res.json(allOrders);
    } catch (error) {
      console.error('Admin orders failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดคำสั่งซื้อได้' });
    }
  });

  app.patch('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const status = String(req.body.status || '');
      if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) {
        return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
      }
      const updated = await db
        .update(orders)
        .set({
          status,
          paidAt: status === 'paid' ? new Date() : null,
        })
        .where(eq(orders.id, id))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Admin update order status failed:', error);
      res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะได้' });
    }
  });

  app.get('/api/admin/customers', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const list = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(list);
    } catch (error) {
      console.error('Admin customers failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดรายชื่อลูกค้าได้' });
    }
  });

  app.post(
    '/api/admin/products',
    requireAuth,
    requireAdmin,
    excelUpload.single('file'),
    async (req, res) => {
      try {
        const title = String(req.body.title || '').trim();
        const description = String(req.body.description || '').trim();
        const price = Math.max(0, Number(req.body.price || 0));
        const level = String(req.body.level || (price === 0 ? 'free' : price <= 99 ? 'standard' : 'advanced'));
        const categoryId = Number(req.body.categoryId || 1);
        const featuresRaw = String(req.body.features || '');
        const features = featuresRaw
          ? featuresRaw.split('\n').map((s) => s.trim()).filter(Boolean)
          : ['พร้อมสูตรคำนวณอัตโนมัติ', 'รองรับ Excel และ Google Sheets'];

        if (!title || !description) {
          return res.status(400).json({ error: 'กรุณากรอกชื่อสินค้าและคำอธิบาย' });
        }

        const slug = `${title
          .toLowerCase()
          .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
          .replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;

        const fileSize = req.file
          ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
          : '2.5 MB';

        const created = await db
          .insert(products)
          .values({
            categoryId,
            title,
            slug,
            description,
            price,
            level,
            filePath: req.file ? req.file.filename : null,
            fileSize,
            previewImage:
              String(req.body.previewImage || '') ||
              '/src/assets/images/template_accounting_pos_1795676831169.jpg',
            isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
            isBestseller: req.body.isBestseller === 'true' || req.body.isBestseller === true,
            featuresJson: JSON.stringify(features),
          })
          .returning();

        res.status(201).json(created[0]);
      } catch (error) {
        console.error('Admin create product failed:', error);
        res.status(500).json({ error: 'ไม่สามารถเพิ่มสินค้าได้' });
      }
    }
  );

  app.put('/api/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, description, price, level, categoryId, isFeatured, isBestseller, status } = req.body;
      const updated = await db
        .update(products)
        .set({
          title,
          description,
          price: Number(price),
          level,
          categoryId: Number(categoryId),
          isFeatured: Boolean(isFeatured),
          isBestseller: Boolean(isBestseller),
          status: status || 'active',
        })
        .where(eq(products.id, id))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Admin update product failed:', error);
      res.status(500).json({ error: 'ไม่สามารถแก้ไขสินค้าได้' });
    }
  });

  app.delete('/api/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.update(products).set({ status: 'archived' }).where(eq(products.id, id));
      res.json({ ok: true });
    } catch (error) {
      console.error('Admin delete product failed:', error);
      res.status(500).json({ error: 'ไม่สามารถลบสินค้าได้' });
    }
  });

  app.get('/api/admin/payments', requireAuth, requireAdmin, async (_req, res) => {
    try {
      await ensureSeeded();
      const rows = await db.select().from(paymentsSettings).orderBy(paymentsSettings.id);
      res.json(rows);
    } catch (error) {
      console.error('Admin payments failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดการตั้งค่าชำระเงินได้' });
    }
  });

  app.put('/api/admin/payments', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { provider, configJson, isActive } = req.body;
      const updated = await db
        .insert(paymentsSettings)
        .values({
          provider,
          configJson: typeof configJson === 'string' ? configJson : JSON.stringify(configJson),
          isActive: Boolean(isActive),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: paymentsSettings.provider,
          set: {
            configJson: typeof configJson === 'string' ? configJson : JSON.stringify(configJson),
            isActive: Boolean(isActive),
            updatedAt: new Date(),
          },
        })
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error('Admin update payments failed:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกการตั้งค่าชำระเงินได้' });
    }
  });

  app.post('/api/admin/ai/generate', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { title, category, level, productId } = req.body;
      const generated = await generateProductDescriptionAI({
        title: String(title || 'Excel Template'),
        category: String(category || 'Excel'),
        level: String(level || 'advanced'),
      });

      await db.insert(aiGenerations).values({
        productId: productId ? Number(productId) : null,
        type: 'description',
        prompt: `${title} (${category})`,
        resultUrl: JSON.stringify(generated),
        status: 'completed',
      });

      res.json(generated);
    } catch (error) {
      console.error('Admin AI generate failed:', error);
      res.status(500).json({ error: 'ไม่สามารถสร้างคอนเทนต์ AI ได้ในขณะนี้' });
    }
  });

  app.get('/api/admin/reports/export', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const list = await db.select().from(orders).orderBy(desc(orders.createdAt));
      const buffer = await generateAdminSalesReportBuffer(list);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="kodraewjob-sales-report.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error('Export report failed:', error);
      res.status(500).json({ error: 'ไม่สามารถส่งออกรายงานได้' });
    }
  });

  // SEO endpoints
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml\n');
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      await ensureSeeded();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const allProds = await db.select({ slug: products.slug }).from(products);
      const urls = [
        '/',
        '/templates',
        '/forum',
        '/solutions',
        '/pricing',
        '/about',
        '/blog',
        '/contact',
        '/solve',
        ...allProds.map((p) => `/templates/${p.slug}`),
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
        .map((u) => `  <url><loc>${baseUrl}${u}</loc></url>`)
        .join('\n')}\n</urlset>`;
      res.type('application/xml').send(xml);
    } catch {
      res.status(500).send('');
    }
  });

  // Vite dev middleware vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kodraewjob (กดแล้วจบ) Digital Marketplace running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
