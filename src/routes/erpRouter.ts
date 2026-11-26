import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { and, asc, desc, eq, ilike, isNull, or } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  erpAuditLogs,
  erpCompanies,
  erpCompanyUsers,
  erpInventoryProducts,
  erpModuleRecords,
  erpStockMovements,
} from '../db/schema.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';
import {
  DEFAULT_PREFIX_CONFIG,
  ensureCompanyErpSeeded,
  generateMysqlErpSchemaSql,
} from '../services/erpSeeder.ts';
import {
  generateErpInventoryExcelBuffer,
  generateErpModuleExcelBuffer,
  generateVbaMacroPackWorkbook,
} from '../services/erpExcel.ts';
import {
  assertCanAddRecords,
  assertCanAddUser,
  assertCanUploadStorage,
  computeCompanyUsage,
  ensureCompanySubscription,
  listErpPackages,
  QuotaLimitError,
  upgradeCompanyPackage,
} from '../services/subscriptionService.ts';

const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');
const COMPANY_LOGOS_DIR = path.resolve(STORAGE_ROOT, 'company-logos');

if (!fs.existsSync(COMPANY_LOGOS_DIR)) {
  fs.mkdirSync(COMPANY_LOGOS_DIR, { recursive: true });
}

function sanitizeFileAccess(baseDir: string, targetPath: string): string | null {
  const resolved = path.resolve(baseDir, path.basename(targetPath));
  if (!resolved.startsWith(baseDir + path.sep)) {
    return null;
  }
  return resolved;
}

function escapeCsvCell(val: unknown): string {
  let str = String(val ?? '');
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, COMPANY_LOGOS_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.png';
      cb(null, `logo-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) && ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพโลโก้ (.png, .jpg, .webp) ขนาดไม่เกิน 3 MB'));
    }
  },
});

const VALID_MODULE_KEYS = new Set([
  'pos',
  'accounting',
  'hr_payroll',
  'attendance',
  'leave',
  'purchasing',
  'sales_docs',
  'ar_ap',
  'rental',
  'fleet',
  'online_orders',
  'food_cost',
  'kpi',
  'assets',
  'projects',
  'manufacturing',
  'logistics',
  'school',
]);

const MODULE_PREFIX_MAP: Record<string, keyof typeof DEFAULT_PREFIX_CONFIG> = {
  pos: 'RC',
  accounting: 'RC',
  hr_payroll: 'PAY',
  purchasing: 'PO',
  sales_docs: 'INV',
  assets: 'AST',
  manufacturing: 'PROD',
  logistics: 'SHIP',
};

async function buildWorkspacePayload(
  companyId: number,
  isDemo: boolean,
  ownerUid: string,
  ownerName: string,
  ownerEmail: string
) {
  const [company] = await db
    .select()
    .from(erpCompanies)
    .where(eq(erpCompanies.id, companyId))
    .limit(1);

  const sub = await ensureCompanySubscription(companyId, ownerUid, ownerName, ownerEmail);
  const usage = await computeCompanyUsage(companyId, company?.logoUrl, sub);

  const inventory = await db
    .select()
    .from(erpInventoryProducts)
    .where(and(eq(erpInventoryProducts.companyId, companyId), eq(erpInventoryProducts.status, 'active')))
    .orderBy(desc(erpInventoryProducts.updatedAt));

  const movements = await db
    .select()
    .from(erpStockMovements)
    .where(eq(erpStockMovements.companyId, companyId))
    .orderBy(desc(erpStockMovements.createdAt))
    .limit(100);

  const records = await db
    .select()
    .from(erpModuleRecords)
    .where(and(eq(erpModuleRecords.companyId, companyId), isNull(erpModuleRecords.deletedAt)))
    .orderBy(desc(erpModuleRecords.createdAt));

  const auditLogs = await db
    .select()
    .from(erpAuditLogs)
    .where(eq(erpAuditLogs.companyId, companyId))
    .orderBy(desc(erpAuditLogs.createdAt))
    .limit(100);

  const team = await db
    .select()
    .from(erpCompanyUsers)
    .where(eq(erpCompanyUsers.companyId, companyId))
    .orderBy(asc(erpCompanyUsers.createdAt));

  return {
    isDemo,
    company,
    subscription: sub,
    usage,
    team,
    inventory,
    movements,
    records,
    auditLogs,
  };
}

function handleQuotaError(res: any, error: any): boolean {
  if (error instanceof QuotaLimitError) {
    res.status(403).json({
      error: error.message,
      code: error.code,
      upgradeRequired: true,
      usage: error.usage,
    });
    return true;
  }
  return false;
}

export function createErpRouter() {
  const router = Router();

  // Serve uploaded company logos safely with path confinement
  router.get('/uploads/company/:filename', (req, res) => {
    const safePath = sanitizeFileAccess(COMPANY_LOGOS_DIR, req.params.filename);
    if (!safePath || !fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'ไม่พบไฟล์โลโก้บริษัท' });
    }
    return res.sendFile(safePath);
  });

  // Public Web App Subscription Packages
  router.get('/api/erp/packages', async (_req, res) => {
    try {
      const pkgs = await listErpPackages();
      res.json({ packages: pkgs });
    } catch (error) {
      console.error('List packages failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลแพ็กเกจได้' });
    }
  });

  // Public interactive showcase demo workspace (read-only preview)
  router.get('/api/erp/showcase', async (_req, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        'showcase-demo',
        'ผู้เยี่ยมชมตัวอย่าง',
        'demo@kodraewjob.th'
      );
      const payload = await buildWorkspacePayload(
        company.id,
        true,
        'showcase-demo',
        'ผู้เยี่ยมชมตัวอย่าง',
        'demo@kodraewjob.th'
      );
      res.json(payload);
    } catch (error) {
      console.error('ERP showcase load failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดตัวอย่างระบบ ERP ได้' });
    }
  });

  // Authenticated user SaaS workspace
  router.get('/api/erp/workspace', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const payload = await buildWorkspacePayload(
        company.id,
        false,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      res.json(payload);
    } catch (error) {
      console.error('ERP workspace load failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูลบริษัท SaaS ERP ได้' });
    }
  });

  // Get current Subscription & Usage
  router.get('/api/erp/subscription', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const sub = await ensureCompanySubscription(
        company.id,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const usage = await computeCompanyUsage(company.id, company.logoUrl, sub);
      const packages = await listErpPackages();
      res.json({ subscription: sub, usage, packages });
    } catch (error) {
      console.error('Subscription fetch failed:', error);
      res.status(500).json({ error: 'ไม่สามารถตรวจสอบสิทธิ์แพ็กเกจได้' });
    }
  });

  // Upgrade or Renew Subscription Package (PromptPay / Package Activation)
  router.post('/api/erp/subscription/upgrade', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const packageCode = String(req.body.packageCode || '').trim();
      const promptpayRef = req.body.promptpayRef ? String(req.body.promptpayRef).trim().slice(0, 64) : undefined;
      if (!packageCode) {
        return res.status(400).json({ error: 'กรุณาเลือกแพ็กเกจที่ต้องการอัปเกรด' });
      }
      const { subscription, pkg } = await upgradeCompanyPackage(
        company.id,
        req.dbUser!.uid,
        req.dbUser!.name,
        packageCode,
        promptpayRef
      );
      const usage = await computeCompanyUsage(company.id, company.logoUrl, subscription);
      res.json({ ok: true, subscription, package: pkg, usage });
    } catch (error: any) {
      if (error?.message === 'INVALID_PACKAGE') {
        return res.status(400).json({ error: 'ไม่พบแพ็กเกจที่เลือก' });
      }
      console.error('Subscription upgrade failed:', error);
      res.status(500).json({ error: 'ไม่สามารถอัปเกรดแพ็กเกจได้' });
    }
  });

  // Team / Multi-User Management (Enforces maxUsers quota)
  router.get('/api/erp/team', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      await ensureCompanySubscription(company.id, req.dbUser!.uid, req.dbUser!.name, req.dbUser!.email);
      const team = await db
        .select()
        .from(erpCompanyUsers)
        .where(eq(erpCompanyUsers.companyId, company.id))
        .orderBy(asc(erpCompanyUsers.createdAt));
      res.json({ team });
    } catch (error) {
      console.error('Team fetch failed:', error);
      res.status(500).json({ error: 'ไม่สามารถโหลดรายชื่อผู้ใช้งานได้' });
    }
  });

  router.post('/api/erp/team', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const sub = await ensureCompanySubscription(
        company.id,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      await assertCanAddUser(company.id, company.logoUrl, sub);

      const memberName = String(req.body.memberName || '').trim();
      const memberEmail = String(req.body.memberEmail || '').trim().toLowerCase();
      const allowedRoles = new Set(['admin', 'manager', 'hr', 'accounting', 'sales', 'warehouse', 'employee', 'viewer']);
      const role = allowedRoles.has(String(req.body.role || '')) ? String(req.body.role) : 'employee';

      if (!memberName || !memberEmail || !memberEmail.includes('@')) {
        return res.status(400).json({ error: 'กรุณาระบุชื่อและอีเมลผู้ใช้งานให้ถูกต้อง' });
      }

      const [member] = await db
        .insert(erpCompanyUsers)
        .values({
          companyId: company.id,
          memberName,
          memberEmail,
          role,
          status: 'active',
        })
        .returning();

      await db.insert(erpAuditLogs).values({
        companyId: company.id,
        userUid: req.dbUser!.uid,
        userName: req.dbUser!.name,
        moduleKey: 'team',
        action: 'ADD_USER',
        recordId: String(member.id),
        summary: `เพิ่มผู้ใช้งาน "${memberName}" (${memberEmail}) บทบาท ${role}`,
        ip: req.ip || null,
      });

      const usage = await computeCompanyUsage(company.id, company.logoUrl, sub);
      res.status(201).json({ member, usage });
    } catch (error) {
      if (handleQuotaError(res, error)) return;
      console.error('Add team member failed:', error);
      res.status(500).json({ error: 'ไม่สามารถเพิ่มผู้ใช้งานในบริษัทได้' });
    }
  });

  router.delete('/api/erp/team/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'รหัสผู้ใช้งานไม่ถูกต้อง' });
      }
      const rows = await db
        .select()
        .from(erpCompanyUsers)
        .where(eq(erpCompanyUsers.companyId, company.id))
        .orderBy(asc(erpCompanyUsers.createdAt));

      if (rows.length <= 1 || rows[0]?.id === id) {
        return res.status(400).json({ error: 'ไม่สามารถลบบัญชีผู้ดูแลหลักของบริษัทได้' });
      }

      await db
        .delete(erpCompanyUsers)
        .where(and(eq(erpCompanyUsers.id, id), eq(erpCompanyUsers.companyId, company.id)));

      res.json({ ok: true });
    } catch (error) {
      console.error('Delete team member failed:', error);
      res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
    }
  });

  // Register / update Company profile & document header settings
  router.put('/api/erp/company', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );

      const companyName = String(req.body.companyName || '').trim();
      const taxId = String(req.body.taxId || '').trim();
      const address = String(req.body.address || '').trim();
      const phone = String(req.body.phone || '').trim();
      const email = String(req.body.email || '').trim();

      if (!companyName || !taxId || !address) {
        return res.status(400).json({ error: 'กรุณากรอกชื่อบริษัท เลขประจำตัวผู้เสียภาษี และที่อยู่ให้ครบถ้วน' });
      }

      const vatRate = Math.min(30, Math.max(0, Number(req.body.vatRate ?? company.vatRate)));
      const whtRate = Math.min(30, Math.max(0, Number(req.body.whtRate ?? company.whtRate)));

      const prefixConfig = req.body.prefixConfig
        ? JSON.stringify(req.body.prefixConfig)
        : typeof req.body.prefixConfigJson === 'string'
          ? req.body.prefixConfigJson
          : company.prefixConfigJson;

      const bankInfo = req.body.bankInfo
        ? JSON.stringify(req.body.bankInfo)
        : typeof req.body.bankInfoJson === 'string'
          ? req.body.bankInfoJson
          : company.bankInfoJson;

      const [updated] = await db
        .update(erpCompanies)
        .set({
          companyName,
          companyNameEn: req.body.companyNameEn ? String(req.body.companyNameEn).trim() : company.companyNameEn,
          taxId,
          branchName: String(req.body.branchName || company.branchName).trim(),
          address,
          phone: phone || company.phone,
          email: email || company.email,
          website: req.body.website !== undefined ? String(req.body.website).trim() : company.website,
          vatRate,
          whtRate,
          prefixConfigJson: prefixConfig,
          bankInfoJson: bankInfo,
          updatedAt: new Date(),
        })
        .where(and(eq(erpCompanies.id, company.id), eq(erpCompanies.ownerUid, req.dbUser!.uid)))
        .returning();

      await db.insert(erpAuditLogs).values({
        companyId: company.id,
        userUid: req.dbUser!.uid,
        userName: req.dbUser!.name,
        moduleKey: 'company',
        action: 'UPDATE',
        recordId: String(company.id),
        summary: `อัปเดตข้อมูลบริษัท "${updated.companyName}" และหัวเอกสารธุรกิจ (VAT ${vatRate}% / WHT ${whtRate}%)`,
        ip: req.ip || null,
      });

      res.json(updated);
    } catch (error) {
      console.error('Company update failed:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลบริษัทได้' });
    }
  });

  // Upload Company Logo for dynamic document headers (Enforces Storage MB quota)
  router.post('/api/erp/company/logo', requireAuth, (req: AuthRequest, res) => {
    logoUpload.single('logo')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'อัปโหลดโลโก้ไม่สำเร็จ' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'กรุณาเลือกไฟล์รูปภาพโลโก้' });
      }
      try {
        const company = await ensureCompanyErpSeeded(
          req.dbUser!.uid,
          req.dbUser!.name,
          req.dbUser!.email
        );
        const sub = await ensureCompanySubscription(
          company.id,
          req.dbUser!.uid,
          req.dbUser!.name,
          req.dbUser!.email
        );
        await assertCanUploadStorage(company.id, company.logoUrl, sub, req.file.size);

        const logoUrl = `/uploads/company/${req.file.filename}`;

        const [updated] = await db
          .update(erpCompanies)
          .set({ logoUrl, updatedAt: new Date() })
          .where(and(eq(erpCompanies.id, company.id), eq(erpCompanies.ownerUid, req.dbUser!.uid)))
          .returning();

        await db.insert(erpAuditLogs).values({
          companyId: company.id,
          userUid: req.dbUser!.uid,
          userName: req.dbUser!.name,
          moduleKey: 'company',
          action: 'UPLOAD_LOGO',
          recordId: String(company.id),
          summary: `อัปโหลดโลโก้บริษัทใหม่สำหรับแสดงบนหัวเอกสารใบเสร็จ/ใบกำกับภาษี/สลิปเงินเดือน`,
          ip: req.ip || null,
        });

        res.json({ logoUrl, company: updated });
      } catch (e) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlink(req.file.path, () => {});
        }
        if (handleQuotaError(res, e)) return;
        console.error('Logo save failed:', e);
        res.status(500).json({ error: 'ไม่สามารถบันทึกโลโก้ได้' });
      }
    });
  });

  // Add Stock Product (Enforces Record & Storage limits)
  router.post('/api/erp/inventory/products', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const sub = await ensureCompanySubscription(
        company.id,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      await assertCanAddRecords(company.id, company.logoUrl, sub, 1, 1024);

      const sku = String(req.body.sku || '').trim().toUpperCase();
      const name = String(req.body.name || '').trim();
      if (!sku || !name) {
        return res.status(400).json({ error: 'กรุณากรอกรหัส SKU และชื่อสินค้า' });
      }

      const barcode = String(req.body.barcode || '').trim() || `8859${Date.now().toString().slice(-9)}`;
      const stockQty = Math.max(0, Number(req.body.stockQty || 0));
      const costPrice = Math.max(0, Number(req.body.costPrice || 0));
      const sellPrice = Math.max(0, Number(req.body.sellPrice || 0));
      const minStock = Math.max(0, Number(req.body.minStock ?? 5));
      const maxStock = Math.max(minStock, Number(req.body.maxStock ?? 200));
      const reorderPoint = Math.max(0, Number(req.body.reorderPoint ?? 10));

      const created = await db.transaction(async (tx) => {
        const [prod] = await tx
          .insert(erpInventoryProducts)
          .values({
            companyId: company.id,
            sku,
            barcode,
            name,
            category: String(req.body.category || 'สินค้าทั่วไป').trim(),
            brand: String(req.body.brand || '-').trim(),
            unit: String(req.body.unit || 'ชิ้น').trim(),
            warehouse: String(req.body.warehouse || 'คลังหลัก (WH-01)').trim(),
            location: String(req.body.location || 'A1-01').trim(),
            supplier: String(req.body.supplier || 'ซัพพลายเออร์ทั่วไป').trim(),
            costPrice,
            sellPrice,
            stockQty,
            minStock,
            maxStock,
            reorderPoint,
          })
          .returning();

        if (stockQty > 0) {
          await tx.insert(erpStockMovements).values({
            companyId: company.id,
            productId: prod.id,
            type: 'IN',
            qty: stockQty,
            unitCost: costPrice,
            beforeQty: 0,
            afterQty: stockQty,
            referenceNo: `INIT-${sku}`,
            warehouseTo: prod.warehouse,
            note: 'เพิ่มสินค้าใหม่พร้อมสต๊อกตั้งต้น',
            createdBy: req.dbUser!.name,
          });
        }

        await tx.insert(erpAuditLogs).values({
          companyId: company.id,
          userUid: req.dbUser!.uid,
          userName: req.dbUser!.name,
          moduleKey: 'stock',
          action: 'CREATE',
          recordId: String(prod.id),
          summary: `เพิ่มสินค้า "${name}" (SKU: ${sku}) จำนวนตั้งต้น ${stockQty} ${prod.unit}`,
          ip: req.ip || null,
        });

        return prod;
      });

      res.status(201).json(created);
    } catch (error) {
      if (handleQuotaError(res, error)) return;
      console.error('Add inventory product failed:', error);
      res.status(500).json({ error: 'ไม่สามารถเพิ่มรายการสินค้าได้' });
    }
  });

  // Update Stock Product
  router.put('/api/erp/inventory/products/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'รหัสสินค้าไม่ถูกต้อง' });
      }

      const [existing] = await db
        .select()
        .from(erpInventoryProducts)
        .where(and(eq(erpInventoryProducts.id, id), eq(erpInventoryProducts.companyId, company.id)))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: 'ไม่พบสินค้าในบริษัทของคุณ' });
      }

      const [updated] = await db
        .update(erpInventoryProducts)
        .set({
          sku: String(req.body.sku || existing.sku).trim().toUpperCase(),
          barcode: String(req.body.barcode || existing.barcode).trim(),
          name: String(req.body.name || existing.name).trim(),
          category: String(req.body.category || existing.category).trim(),
          brand: String(req.body.brand || existing.brand).trim(),
          unit: String(req.body.unit || existing.unit).trim(),
          warehouse: String(req.body.warehouse || existing.warehouse).trim(),
          location: String(req.body.location || existing.location).trim(),
          supplier: String(req.body.supplier || existing.supplier).trim(),
          costPrice: Math.max(0, Number(req.body.costPrice ?? existing.costPrice)),
          sellPrice: Math.max(0, Number(req.body.sellPrice ?? existing.sellPrice)),
          minStock: Math.max(0, Number(req.body.minStock ?? existing.minStock)),
          maxStock: Math.max(0, Number(req.body.maxStock ?? existing.maxStock)),
          reorderPoint: Math.max(0, Number(req.body.reorderPoint ?? existing.reorderPoint)),
          updatedAt: new Date(),
        })
        .where(and(eq(erpInventoryProducts.id, id), eq(erpInventoryProducts.companyId, company.id)))
        .returning();

      await db.insert(erpAuditLogs).values({
        companyId: company.id,
        userUid: req.dbUser!.uid,
        userName: req.dbUser!.name,
        moduleKey: 'stock',
        action: 'UPDATE',
        recordId: String(id),
        summary: `แก้ไขข้อมูลสินค้า "${updated.name}" (${updated.sku})`,
        ip: req.ip || null,
      });

      res.json(updated);
    } catch (error) {
      console.error('Update inventory product failed:', error);
      res.status(500).json({ error: 'ไม่สามารถอัปเดตสินค้าได้' });
    }
  });

  // Soft delete Stock Product
  router.delete('/api/erp/inventory/products/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const id = Number(req.params.id);
      const [existing] = await db
        .select()
        .from(erpInventoryProducts)
        .where(and(eq(erpInventoryProducts.id, id), eq(erpInventoryProducts.companyId, company.id)))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: 'ไม่พบสินค้าในบริษัทของคุณ' });
      }

      await db
        .update(erpInventoryProducts)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(and(eq(erpInventoryProducts.id, id), eq(erpInventoryProducts.companyId, company.id)));

      await db.insert(erpAuditLogs).values({
        companyId: company.id,
        userUid: req.dbUser!.uid,
        userName: req.dbUser!.name,
        moduleKey: 'stock',
        action: 'DELETE',
        recordId: String(id),
        summary: `ลบสินค้า "${existing.name}" (${existing.sku}) ออกจากรายการคลัง`,
        ip: req.ip || null,
      });

      res.json({ ok: true });
    } catch (error) {
      console.error('Delete inventory product failed:', error);
      res.status(500).json({ error: 'ไม่สามารถลบสินค้าได้' });
    }
  });

  // Record Stock Movement (IN / OUT / TRANSFER / ADJUST / COUNT / RETURN / DAMAGE / SCRAP)
  router.post('/api/erp/inventory/movements', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );

      const productId = Number(req.body.productId);
      const type = String(req.body.type || '').toUpperCase();
      const qty = Number(req.body.qty || 0);
      const allowedTypes = ['IN', 'OUT', 'TRANSFER', 'ADJUST', 'COUNT', 'RETURN', 'DAMAGE', 'SCRAP'];

      if (!productId || !allowedTypes.includes(type) || !Number.isFinite(qty) || qty < 0) {
        return res.status(400).json({ error: 'ข้อมูลรายการเคลื่อนไหวสต๊อกไม่ถูกต้อง' });
      }

      const result = await db.transaction(async (tx) => {
        const [prod] = await tx
          .select()
          .from(erpInventoryProducts)
          .where(and(eq(erpInventoryProducts.id, productId), eq(erpInventoryProducts.companyId, company.id)))
          .limit(1);

        if (!prod) {
          throw new Error('NOT_FOUND');
        }

        const beforeQty = Number(prod.stockQty);
        let afterQty = beforeQty;
        let nextCostPrice = Number(prod.costPrice);
        const unitCost = req.body.unitCost !== undefined ? Math.max(0, Number(req.body.unitCost)) : nextCostPrice;

        if (type === 'IN' || type === 'RETURN') {
          afterQty = beforeQty + qty;
          if (type === 'IN' && afterQty > 0 && unitCost > 0) {
            nextCostPrice = Number(
              ((beforeQty * nextCostPrice + qty * unitCost) / afterQty).toFixed(2)
            );
          }
        } else if (type === 'OUT' || type === 'DAMAGE' || type === 'SCRAP') {
          if (beforeQty < qty) {
            throw new Error('INSUFFICIENT_STOCK');
          }
          afterQty = beforeQty - qty;
        } else if (type === 'ADJUST' || type === 'COUNT') {
          afterQty = qty;
        } else if (type === 'TRANSFER') {
          afterQty = beforeQty;
        }

        const nextWarehouse =
          type === 'TRANSFER' && req.body.warehouseTo
            ? String(req.body.warehouseTo).trim()
            : prod.warehouse;

        const [updatedProd] = await tx
          .update(erpInventoryProducts)
          .set({
            stockQty: afterQty,
            costPrice: nextCostPrice,
            warehouse: nextWarehouse,
            updatedAt: new Date(),
          })
          .where(eq(erpInventoryProducts.id, prod.id))
          .returning();

        const refNo =
          String(req.body.referenceNo || '').trim() ||
          `MV-${type}-${Date.now().toString().slice(-6)}`;

        const [movement] = await tx
          .insert(erpStockMovements)
          .values({
            companyId: company.id,
            productId: prod.id,
            type,
            qty,
            unitCost,
            beforeQty,
            afterQty,
            referenceNo: refNo,
            warehouseFrom: prod.warehouse,
            warehouseTo: req.body.warehouseTo ? String(req.body.warehouseTo).trim() : null,
            note: req.body.note ? String(req.body.note).trim() : null,
            createdBy: req.dbUser!.name,
          })
          .returning();

        await tx.insert(erpAuditLogs).values({
          companyId: company.id,
          userUid: req.dbUser!.uid,
          userName: req.dbUser!.name,
          moduleKey: 'stock',
          action: type,
          recordId: String(prod.id),
          summary: `${type} สินค้า "${prod.name}" (${beforeQty} -> ${afterQty} ${prod.unit}) อ้างอิง ${refNo}`,
          ip: req.ip || null,
        });

        return { product: updatedProd, movement };
      });

      res.status(201).json(result);
    } catch (error: any) {
      if (error?.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'ไม่พบสินค้าในคลัง' });
      }
      if (error?.message === 'INSUFFICIENT_STOCK') {
        return res.status(400).json({ error: 'จำนวนคงเหลือในสต๊อกไม่เพียงพอต่อการเบิกจ่าย' });
      }
      console.error('Stock movement error:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกรายการเคลื่อนไหวสต๊อกได้' });
    }
  });

  // POS Checkout (Atomic Transaction: Enforce Quota + Deduct Stock + Insert POS Receipt + Insert Accounting Income)
  router.post('/api/erp/pos/checkout', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const sub = await ensureCompanySubscription(
        company.id,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      await assertCanAddRecords(company.id, company.logoUrl, sub, 2, 2048);

      const items = Array.isArray(req.body.items) ? req.body.items : [];
      if (items.length === 0) {
        return res.status(400).json({ error: 'กรุณาเลือกสินค้าในตะกร้า POS อย่างน้อย 1 รายการ' });
      }

      const discount = Math.max(0, Number(req.body.discount || 0));
      const paymentMethod = String(req.body.paymentMethod || 'QR PromptPay').trim();
      const customerName = String(req.body.customerName || 'ลูกค้าหน้าร้าน (Walk-in)').trim();
      const includeVat = req.body.includeVat !== false;

      const result = await db.transaction(async (tx) => {
        let subtotal = 0;
        let totalQty = 0;
        const lineItems: Array<{
          productId: number;
          sku: string;
          name: string;
          unit: string;
          qty: number;
          price: number;
          lineTotal: number;
        }> = [];

        for (const reqItem of items) {
          const productId = Number(reqItem.productId);
          const qty = Number(reqItem.qty);
          if (!productId || !Number.isFinite(qty) || qty <= 0) {
            throw new Error('INVALID_ITEM');
          }

          const [prod] = await tx
            .select()
            .from(erpInventoryProducts)
            .where(
              and(eq(erpInventoryProducts.id, productId), eq(erpInventoryProducts.companyId, company.id))
            )
            .limit(1);

          if (!prod) throw new Error('PRODUCT_NOT_FOUND');
          if (prod.stockQty < qty) {
            throw new Error(`LOW_STOCK:${prod.name}`);
          }

          const lineTotal = Number((prod.sellPrice * qty).toFixed(2));
          subtotal += lineTotal;
          totalQty += qty;

          const beforeQty = Number(prod.stockQty);
          const afterQty = beforeQty - qty;

          await tx
            .update(erpInventoryProducts)
            .set({ stockQty: afterQty, updatedAt: new Date() })
            .where(eq(erpInventoryProducts.id, prod.id));

          const refSuffix = Date.now().toString().slice(-6);
          await tx.insert(erpStockMovements).values({
            companyId: company.id,
            productId: prod.id,
            type: 'POS_SALE',
            qty,
            unitCost: prod.costPrice,
            beforeQty,
            afterQty,
            referenceNo: `POS-${refSuffix}`,
            warehouseFrom: prod.warehouse,
            note: `ตัดสต๊อกอัตโนมัติจากการขาย POS (${customerName})`,
            createdBy: req.dbUser!.name,
          });

          lineItems.push({
            productId: prod.id,
            sku: prod.sku,
            name: prod.name,
            unit: prod.unit,
            qty,
            price: prod.sellPrice,
            lineTotal,
          });
        }

        const afterDiscount = Math.max(0, subtotal - discount);
        const vat = includeVat ? Number(((afterDiscount * company.vatRate) / 100).toFixed(2)) : 0;
        const grandTotal = Number((afterDiscount + vat).toFixed(2));
        const today = new Date().toISOString().slice(0, 10);

        let prefixes = DEFAULT_PREFIX_CONFIG;
        try {
          prefixes = { ...DEFAULT_PREFIX_CONFIG, ...JSON.parse(company.prefixConfigJson) };
        } catch {
          // keep default
        }
        const docNumber = `${prefixes.RC}-${Date.now().toString().slice(-6)}`;

        const [posRecord] = await tx
          .insert(erpModuleRecords)
          .values({
            companyId: company.id,
            moduleKey: 'pos',
            docNumber,
            title: `ขายหน้าร้าน ${lineItems.map((i) => `${i.name} x${i.qty}`).join(', ')}`.slice(0, 220),
            partyName: customerName,
            categoryOrDept: paymentMethod,
            status: 'paid',
            amount: grandTotal,
            qty: totalQty,
            dateStr: today,
            payloadJson: JSON.stringify({
              paymentMethod,
              subtotal,
              discount,
              vat,
              grandTotal,
              cashier: req.dbUser!.name,
              items: lineItems,
            }),
            createdBy: req.dbUser!.name,
          })
          .returning();

        // Automatically post income to Accounting ledger
        await tx.insert(erpModuleRecords).values({
          companyId: company.id,
          moduleKey: 'accounting',
          docNumber: `ACC-${Date.now().toString().slice(-6)}`,
          title: `รายรับขาย POS (${docNumber})`,
          partyName: customerName,
          categoryOrDept: 'รายรับ (Income)',
          status: 'completed',
          amount: grandTotal,
          qty: 1,
          dateStr: today,
          payloadJson: JSON.stringify({
            flow: 'income',
            account: paymentMethod,
            paymentMethod,
            sourcePosDoc: docNumber,
            note: 'บันทึกบัญชีอัตโนมัติจากหน้า POS',
          }),
          createdBy: req.dbUser!.name,
        });

        await tx.insert(erpAuditLogs).values({
          companyId: company.id,
          userUid: req.dbUser!.uid,
          userName: req.dbUser!.name,
          moduleKey: 'pos',
          action: 'POS_CHECKOUT',
          recordId: String(posRecord.id),
          summary: `ปิดบิล POS ${docNumber} ยอดสุทธิ ฿${grandTotal.toLocaleString()} (ตัดสต๊อก ${totalQty} ชิ้น + ลงบัญชีรายรับอัตโนมัติ)`,
          ip: req.ip || null,
        });

        return { posRecord };
      });

      res.status(201).json(result);
    } catch (error: any) {
      if (handleQuotaError(res, error)) return;
      if (error?.message?.startsWith('LOW_STOCK:')) {
        const prodName = error.message.replace('LOW_STOCK:', '');
        return res.status(400).json({ error: `สินค้า "${prodName}" คงเหลือในสต๊อกไม่เพียงพอ` });
      }
      if (error?.message === 'INVALID_ITEM' || error?.message === 'PRODUCT_NOT_FOUND') {
        return res.status(400).json({ error: 'รายการสินค้าในบิล POS ไม่ถูกต้อง' });
      }
      console.error('POS checkout failed:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกการขาย POS ได้' });
    }
  });

  // Global Search across Inventory & All 20 ERP Modules
  router.get('/api/erp/search', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const q = String(req.query.q || '').trim();
      if (!q) {
        return res.json({ products: [], records: [] });
      }

      const matchedProducts = await db
        .select()
        .from(erpInventoryProducts)
        .where(
          and(
            eq(erpInventoryProducts.companyId, company.id),
            eq(erpInventoryProducts.status, 'active'),
            or(
              ilike(erpInventoryProducts.sku, `%${q}%`),
              ilike(erpInventoryProducts.barcode, `%${q}%`),
              ilike(erpInventoryProducts.name, `%${q}%`),
              ilike(erpInventoryProducts.category, `%${q}%`)
            )!
          )
        )
        .limit(15);

      const matchedRecords = await db
        .select()
        .from(erpModuleRecords)
        .where(
          and(
            eq(erpModuleRecords.companyId, company.id),
            isNull(erpModuleRecords.deletedAt),
            or(
              ilike(erpModuleRecords.docNumber, `%${q}%`),
              ilike(erpModuleRecords.title, `%${q}%`),
              ilike(erpModuleRecords.partyName, `%${q}%`),
              ilike(erpModuleRecords.categoryOrDept, `%${q}%`)
            )!
          )
        )
        .limit(20);

      res.json({ products: matchedProducts, records: matchedRecords });
    } catch (error) {
      console.error('Global ERP search failed:', error);
      res.status(500).json({ error: 'ไม่สามารถค้นหาข้อมูล ERP ได้' });
    }
  });

  // Create Module Record (Covers all remaining business modules & enforces quota)
  router.post('/api/erp/records/:moduleKey', requireAuth, async (req: AuthRequest, res) => {
    try {
      const moduleKey = req.params.moduleKey;
      if (!VALID_MODULE_KEYS.has(moduleKey)) {
        return res.status(400).json({ error: 'รหัสโมดูล ERP ไม่ถูกต้อง' });
      }

      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const sub = await ensureCompanySubscription(
        company.id,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      await assertCanAddRecords(company.id, company.logoUrl, sub, 1, 1024);

      const title = String(req.body.title || '').trim();
      if (!title) {
        return res.status(400).json({ error: 'กรุณาระบุชื่อรายการ / หัวข้อเอกสาร' });
      }

      let prefixes = DEFAULT_PREFIX_CONFIG;
      try {
        prefixes = { ...DEFAULT_PREFIX_CONFIG, ...JSON.parse(company.prefixConfigJson) };
      } catch {
        // default
      }

      const prefixKey = MODULE_PREFIX_MAP[moduleKey];
      const prefixStr = prefixKey ? prefixes[prefixKey] : moduleKey.toUpperCase().slice(0, 4);
      const docNumber =
        String(req.body.docNumber || '').trim() ||
        `${prefixStr}-${Date.now().toString().slice(-6)}`;

      const amount = Number(req.body.amount || 0);
      const qty = Number(req.body.qty ?? 1);
      const dateStr = String(req.body.dateStr || new Date().toISOString().slice(0, 10));
      const dueDateStr = req.body.dueDateStr ? String(req.body.dueDateStr) : null;
      const partyName = String(req.body.partyName || '-').trim();
      const categoryOrDept = String(req.body.categoryOrDept || '-').trim();
      const status = String(req.body.status || 'active').trim();
      const payloadJson =
        typeof req.body.payload === 'object' && req.body.payload !== null
          ? JSON.stringify(req.body.payload)
          : typeof req.body.payloadJson === 'string'
            ? req.body.payloadJson
            : JSON.stringify({});

      const [created] = await db
        .insert(erpModuleRecords)
        .values({
          companyId: company.id,
          moduleKey,
          docNumber,
          title,
          partyName,
          categoryOrDept,
          status,
          amount,
          qty,
          dateStr,
          dueDateStr,
          payloadJson,
          createdBy: req.dbUser!.name,
        })
        .returning();

      await db.insert(erpAuditLogs).values({
        companyId: company.id,
        userUid: req.dbUser!.uid,
        userName: req.dbUser!.name,
        moduleKey,
        action: 'CREATE',
        recordId: String(created.id),
        summary: `สร้างรายการ ${docNumber}: ${title} (มูลค่า ${amount.toLocaleString()})`,
        ip: req.ip || null,
      });

      res.status(201).json(created);
    } catch (error) {
      if (handleQuotaError(res, error)) return;
      console.error('Create ERP module record failed:', error);
      res.status(500).json({ error: 'ไม่สามารถบันทึกรายการได้' });
    }
  });

  // Update or Workflow-Approve Module Record (with PO Receive -> Stock IN & Payroll Approve -> Accounting)
  router.patch('/api/erp/records/:moduleKey/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const moduleKey = req.params.moduleKey;
      const id = Number(req.params.id);
      if (!VALID_MODULE_KEYS.has(moduleKey) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'พารามิเตอร์ไม่ถูกต้อง' });
      }

      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );

      const updated = await db.transaction(async (tx) => {
        const [existing] = await tx
          .select()
          .from(erpModuleRecords)
          .where(
            and(
              eq(erpModuleRecords.id, id),
              eq(erpModuleRecords.companyId, company.id),
              eq(erpModuleRecords.moduleKey, moduleKey),
              isNull(erpModuleRecords.deletedAt)
            )
          )
          .limit(1);

        if (!existing) {
          throw new Error('NOT_FOUND');
        }

        const nextStatus = req.body.status !== undefined ? String(req.body.status) : existing.status;
        const nextTitle = req.body.title !== undefined ? String(req.body.title).trim() : existing.title;
        const nextParty =
          req.body.partyName !== undefined ? String(req.body.partyName).trim() : existing.partyName;
        const nextCat =
          req.body.categoryOrDept !== undefined
            ? String(req.body.categoryOrDept).trim()
            : existing.categoryOrDept;
        const nextAmount = req.body.amount !== undefined ? Number(req.body.amount) : existing.amount;
        const nextQty = req.body.qty !== undefined ? Number(req.body.qty) : existing.qty;
        const nextDate = req.body.dateStr !== undefined ? String(req.body.dateStr) : existing.dateStr;
        const nextDue =
          req.body.dueDateStr !== undefined
            ? req.body.dueDateStr
              ? String(req.body.dueDateStr)
              : null
            : existing.dueDateStr;

        let nextPayload = existing.payloadJson;
        if (req.body.payload && typeof req.body.payload === 'object') {
          nextPayload = JSON.stringify(req.body.payload);
        } else if (typeof req.body.payloadJson === 'string') {
          nextPayload = req.body.payloadJson;
        }

        const [saved] = await tx
          .update(erpModuleRecords)
          .set({
            title: nextTitle,
            partyName: nextParty,
            categoryOrDept: nextCat,
            status: nextStatus,
            amount: nextAmount,
            qty: nextQty,
            dateStr: nextDate,
            dueDateStr: nextDue,
            payloadJson: nextPayload,
            updatedAt: new Date(),
          })
          .where(eq(erpModuleRecords.id, existing.id))
          .returning();

        // Purchasing workflow: Receiving PO adds stock automatically if SKU matches
        if (moduleKey === 'purchasing' && nextStatus === 'received' && existing.status !== 'received') {
          let parsed: any = {};
          try {
            parsed = JSON.parse(nextPayload);
          } catch {
            // ignore
          }
          const sku = String(parsed.sku || '').trim();
          if (sku) {
            const [prod] = await tx
              .select()
              .from(erpInventoryProducts)
              .where(
                and(eq(erpInventoryProducts.companyId, company.id), eq(erpInventoryProducts.sku, sku))
              )
              .limit(1);
            if (prod) {
              const beforeQty = Number(prod.stockQty);
              const afterQty = beforeQty + Number(nextQty || 0);
              await tx
                .update(erpInventoryProducts)
                .set({ stockQty: afterQty, updatedAt: new Date() })
                .where(eq(erpInventoryProducts.id, prod.id));

              await tx.insert(erpStockMovements).values({
                companyId: company.id,
                productId: prod.id,
                type: 'IN',
                qty: Number(nextQty || 0),
                unitCost: prod.costPrice,
                beforeQty,
                afterQty,
                referenceNo: existing.docNumber,
                warehouseTo: prod.warehouse,
                note: `รับสินค้าเข้าคลังอัตโนมัติจากใบสั่งซื้อ ${existing.docNumber}`,
                createdBy: req.dbUser!.name,
              });
            }
          }
        }

        // Payroll workflow: Approving & paying salary posts expense to Accounting
        if (moduleKey === 'hr_payroll' && nextStatus === 'paid' && existing.status !== 'paid') {
          await tx.insert(erpModuleRecords).values({
            companyId: company.id,
            moduleKey: 'accounting',
            docNumber: `ACC-${Date.now().toString().slice(-6)}`,
            title: `จ่ายเงินเดือน (${existing.docNumber}) — ${nextParty}`,
            partyName: nextParty,
            categoryOrDept: 'รายจ่าย (Expense)',
            status: 'completed',
            amount: nextAmount,
            qty: 1,
            dateStr: new Date().toISOString().slice(0, 10),
            payloadJson: JSON.stringify({
              flow: 'expense',
              account: 'ธนาคารกสิกรไทย (KBANK)',
              paymentMethod: 'Payroll Transfer',
              sourcePayrollDoc: existing.docNumber,
            }),
            createdBy: req.dbUser!.name,
          });
        }

        await tx.insert(erpAuditLogs).values({
          companyId: company.id,
          userUid: req.dbUser!.uid,
          userName: req.dbUser!.name,
          moduleKey,
          action: nextStatus !== existing.status ? 'STATUS_CHANGE' : 'UPDATE',
          recordId: String(existing.id),
          summary: `อัปเดต ${existing.docNumber}: สถานะ "${nextStatus}"`,
          ip: req.ip || null,
        });

        return saved;
      });

      res.json(updated);
    } catch (error: any) {
      if (error?.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'ไม่พบรายการที่ต้องการแก้ไข' });
      }
      console.error('Patch ERP record failed:', error);
      res.status(500).json({ error: 'ไม่สามารถอัปเดตรายการได้' });
    }
  });

  // Soft Delete Module Record
  router.delete('/api/erp/records/:moduleKey/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const moduleKey = req.params.moduleKey;
      const id = Number(req.params.id);
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );

      const [existing] = await db
        .select()
        .from(erpModuleRecords)
        .where(
          and(
            eq(erpModuleRecords.id, id),
            eq(erpModuleRecords.companyId, company.id),
            eq(erpModuleRecords.moduleKey, moduleKey),
            isNull(erpModuleRecords.deletedAt)
          )
        )
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: 'ไม่พบรายการที่ต้องการลบ' });
      }

      await db
        .update(erpModuleRecords)
        .set({ deletedAt: new Date() })
        .where(eq(erpModuleRecords.id, existing.id));

      await db.insert(erpAuditLogs).values({
        companyId: company.id,
        userUid: req.dbUser!.uid,
        userName: req.dbUser!.name,
        moduleKey,
        action: 'DELETE',
        recordId: String(existing.id),
        summary: `ลบรายการ ${existing.docNumber} (${existing.title})`,
        ip: req.ip || null,
      });

      res.json({ ok: true });
    } catch (error) {
      console.error('Delete ERP record failed:', error);
      res.status(500).json({ error: 'ไม่สามารถลบรายการได้' });
    }
  });

  // Export Excel (.xlsx) with formulas
  router.get('/api/erp/export/xlsx', requireAuth, async (req: AuthRequest, res) => {
    try {
      const moduleKey = String(req.query.module || 'stock');
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );

      if (moduleKey === 'stock') {
        const items = await db
          .select()
          .from(erpInventoryProducts)
          .where(and(eq(erpInventoryProducts.companyId, company.id), eq(erpInventoryProducts.status, 'active')));
        const buffer = await generateErpInventoryExcelBuffer(company.companyName, items);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename="erp-stock-balance.xlsx"');
        return res.send(buffer);
      }

      const rows = await db
        .select()
        .from(erpModuleRecords)
        .where(
          and(
            eq(erpModuleRecords.companyId, company.id),
            eq(erpModuleRecords.moduleKey, moduleKey),
            isNull(erpModuleRecords.deletedAt)
          )
        )
        .orderBy(desc(erpModuleRecords.createdAt));

      const buffer = await generateErpModuleExcelBuffer(company.companyName, moduleKey.toUpperCase(), rows);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="erp-${moduleKey}.xlsx"`);
      return res.send(buffer);
    } catch (error) {
      console.error('Export ERP xlsx failed:', error);
      res.status(500).json({ error: 'ไม่สามารถส่งออกไฟล์ Excel ได้' });
    }
  });

  // Export CSV (UTF-8 BOM + Formula Injection Protection)
  router.get('/api/erp/export/csv', requireAuth, async (req: AuthRequest, res) => {
    try {
      const moduleKey = String(req.query.module || 'stock');
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );

      let csv = '\uFEFF';
      if (moduleKey === 'stock') {
        const items = await db
          .select()
          .from(erpInventoryProducts)
          .where(and(eq(erpInventoryProducts.companyId, company.id), eq(erpInventoryProducts.status, 'active')));
        csv += ['SKU', 'Barcode', 'Name', 'Category', 'Unit', 'Warehouse', 'Cost', 'SellPrice', 'StockQty', 'ReorderPoint']
          .map(escapeCsvCell)
          .join(',') + '\n';
        for (const p of items) {
          csv += [p.sku, p.barcode, p.name, p.category, p.unit, p.warehouse, p.costPrice, p.sellPrice, p.stockQty, p.reorderPoint]
            .map(escapeCsvCell)
            .join(',') + '\n';
        }
      } else {
        const rows = await db
          .select()
          .from(erpModuleRecords)
          .where(
            and(
              eq(erpModuleRecords.companyId, company.id),
              eq(erpModuleRecords.moduleKey, moduleKey),
              isNull(erpModuleRecords.deletedAt)
            )
          );
        csv += ['DocNumber', 'Title', 'Party', 'CategoryOrDept', 'Status', 'Qty', 'Amount', 'Date']
          .map(escapeCsvCell)
          .join(',') + '\n';
        for (const r of rows) {
          csv += [r.docNumber, r.title, r.partyName, r.categoryOrDept, r.status, r.qty, r.amount, r.dateStr]
            .map(escapeCsvCell)
            .join(',') + '\n';
        }
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="erp-${moduleKey}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Export ERP csv failed:', error);
      res.status(500).json({ error: 'ไม่สามารถส่งออกไฟล์ CSV ได้' });
    }
  });

  // Download MySQL 8+ phpMyAdmin database.sql schema
  router.get('/api/erp/export/mysql-sql', (_req, res) => {
    const sqlText = generateMysqlErpSchemaSql();
    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="kodraewjob_erp_mysql8.sql"');
    res.send(sqlText);
  });

  // Backup full company ERP JSON snapshot
  router.get('/api/erp/backup', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const snapshot = await buildWorkspacePayload(
        company.id,
        false,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="kodraewjob-erp-backup-${new Date().toISOString().slice(0, 10)}.json"`
      );
      res.send(JSON.stringify({ exportedAt: new Date().toISOString(), ...snapshot }, null, 2));
    } catch (error) {
      console.error('Backup ERP failed:', error);
      res.status(500).json({ error: 'ไม่สามารถสำรองข้อมูลฐานข้อมูลได้' });
    }
  });

  // Restore ERP JSON snapshot safely scoped to current user's company (Enforces Record & Storage quotas)
  router.post('/api/erp/restore', requireAuth, async (req: AuthRequest, res) => {
    try {
      const company = await ensureCompanyErpSeeded(
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const sub = await ensureCompanySubscription(
        company.id,
        req.dbUser!.uid,
        req.dbUser!.name,
        req.dbUser!.email
      );
      const data = req.body;
      if (!data || typeof data !== 'object' || !Array.isArray(data.records)) {
        return res.status(400).json({ error: 'รูปแบบไฟล์ Backup JSON ไม่ถูกต้อง' });
      }

      const validImportRecords = data.records
        .slice(0, 150)
        .filter((rec: any) => rec && VALID_MODULE_KEYS.has(rec.moduleKey) && rec.title && rec.docNumber);

      await assertCanAddRecords(
        company.id,
        company.logoUrl,
        sub,
        validImportRecords.length,
        Buffer.byteLength(JSON.stringify(validImportRecords), 'utf8')
      );

      await db.transaction(async (tx) => {
        if (data.company && typeof data.company === 'object' && data.company.companyName) {
          await tx
            .update(erpCompanies)
            .set({
              companyName: String(data.company.companyName).slice(0, 200),
              taxId: String(data.company.taxId || company.taxId).slice(0, 32),
              address: String(data.company.address || company.address).slice(0, 500),
              phone: String(data.company.phone || company.phone).slice(0, 50),
              email: String(data.company.email || company.email).slice(0, 150),
              updatedAt: new Date(),
            })
            .where(eq(erpCompanies.id, company.id));
        }

        // Insert missing backup module records without wiping audit history
        let restoredCount = 0;
        for (const rec of validImportRecords) {
          await tx.insert(erpModuleRecords).values({
            companyId: company.id,
            moduleKey: rec.moduleKey,
            docNumber: `${String(rec.docNumber).slice(0, 40)}-R`,
            title: String(rec.title).slice(0, 220),
            partyName: String(rec.partyName || '-').slice(0, 200),
            categoryOrDept: String(rec.categoryOrDept || '-').slice(0, 120),
            status: String(rec.status || 'active').slice(0, 40),
            amount: Number(rec.amount || 0),
            qty: Number(rec.qty ?? 1),
            dateStr: String(rec.dateStr || new Date().toISOString().slice(0, 10)).slice(0, 20),
            dueDateStr: rec.dueDateStr ? String(rec.dueDateStr).slice(0, 20) : null,
            payloadJson:
              typeof rec.payloadJson === 'string' ? rec.payloadJson : JSON.stringify({}),
            createdBy: req.dbUser!.name,
          });
          restoredCount++;
        }

        await tx.insert(erpAuditLogs).values({
          companyId: company.id,
          userUid: req.dbUser!.uid,
          userName: req.dbUser!.name,
          moduleKey: 'settings',
          action: 'RESTORE',
          recordId: String(company.id),
          summary: `กู้คืนข้อมูลจากไฟล์ Backup JSON สำเร็จ (${restoredCount} รายการ)`,
          ip: req.ip || null,
        });
      });

      res.json({ ok: true, message: 'กู้คืนข้อมูลเรียบร้อยแล้ว' });
    } catch (error) {
      if (handleQuotaError(res, error)) return;
      console.error('Restore ERP failed:', error);
      res.status(500).json({ error: 'ไม่สามารถกู้คืนข้อมูลจากไฟล์สำรองได้' });
    }
  });

  // Login-gated VBA Automation Standard Pack Download (.xlsx workbook or .bas module)
  router.get('/api/vba/download/:type', requireAuth, async (req: AuthRequest, res) => {
    try {
      const type = req.params.type === 'payroll-payslip' ? 'payroll-payslip' : 'tax-invoice';
      const format = req.query.format === 'bas' ? 'bas' : 'xlsx';
      const pack = await generateVbaMacroPackWorkbook(type);

      if (format === 'bas') {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="kodraewjob-vba-${type}.bas"`);
        return res.send(pack.basCode);
      }

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="kodraewjob-vba-${type}.xlsx"`);
      return res.send(pack.xlsxBuffer);
    } catch (error) {
      console.error('VBA download failed:', error);
      res.status(500).json({ error: 'ไม่สามารถดาวน์โหลดชุดไฟล์ VBA ได้' });
    }
  });

  return router;
}
