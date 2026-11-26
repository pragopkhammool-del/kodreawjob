import { count, eq, sql } from 'drizzle-orm';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../data/catalogSeed.ts';
import { db } from './index.ts';
import {
  categories,
  coupons,
  paymentsSettings,
  products,
  qrCodes,
  reviews,
  siteSettings,
} from './schema.ts';

async function ensureDefaultSiteAssets(): Promise<void> {
  await db
    .insert(siteSettings)
    .values({
      key: 'theme_config',
      valueJson: JSON.stringify({
        presetId: 'orange-pastel',
        name: 'Orange Light พาสเทล (ค่าเริ่มต้น)',
        primaryColor: '#F97316',
        primaryHover: '#EA580C',
        bgLight: '#FFF7ED',
        surfaceLight: '#FFEDD5',
        darkAccent: '#231915',
      }),
    })
    .onConflictDoNothing({ target: siteSettings.key });

  const defaultQrs = [
    {
      code: 'promptpay',
      title: 'Thai QR Payment (PromptPay หลัก)',
      description: 'สแกนชำระเงินทุกธนาคาร ไม่มีค่าธรรมเนียม',
      imageUrl: '/assets/aistudio/Untitled_e84a513c.jpg',
      isActive: true,
    },
    {
      code: 'line',
      title: 'LINE Official Group (@556fsrdw)',
      description: 'สแกนเข้ากลุ่มลูกค้า และติดต่อสอบถามแอดมินโดยตรง',
      imageUrl: '/assets/aistudio/L_556fsrdw_GW_6a59b22f.png',
      isActive: true,
    },
  ];
  for (const qr of defaultQrs) {
    await db
      .insert(qrCodes)
      .values(qr)
      .onConflictDoNothing({ target: qrCodes.code });
  }
}

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const existingCatCount = await db.select({ value: count() }).from(categories);
  const existingProdCount = await db.select({ value: count() }).from(products);

  if (existingCatCount[0].value > 0 && existingProdCount[0].value >= 50) {
    // Sync updated unique product preview images & Kodraewjob brand settings on existing DB
    for (const item of SEED_PRODUCTS) {
      await db
        .update(products)
        .set({ previewImage: item.previewImage })
        .where(eq(products.slug, item.slug));
    }
    await db
      .insert(coupons)
      .values({ code: 'KODRAEWJOB10', discountType: 'percent', discountValue: 10, usageLimit: 500 })
      .onConflictDoNothing({ target: coupons.code });
    await db
      .insert(paymentsSettings)
      .values({
        provider: 'promptpay',
        configJson: JSON.stringify({
          promptpayId: '0819998888',
          accountName: 'กดแล้วจบ (Kodraewjob Digital Marketplace)',
          qrImageUrl: '/assets/aistudio/Untitled_e84a513c.jpg',
        }),
        isActive: true,
      })
      .onConflictDoNothing({ target: paymentsSettings.provider });
    await ensureDefaultSiteAssets();
    // One-time sync: replace historical sample download_count with real counts from download_logs
    const syncMarker = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'real_download_counts_synced'))
      .limit(1);
    if (syncMarker.length === 0) {
      await db.execute(
        sql`UPDATE products SET download_count = COALESCE((SELECT count(*)::int FROM download_logs WHERE download_logs.product_id = products.id), 0)`
      );
      await db
        .insert(siteSettings)
        .values({ key: 'real_download_counts_synced', valueJson: 'true' })
        .onConflictDoNothing({ target: siteSettings.key });
    }
    return;
  }

  // Upsert categories
  const categoryMap = new Map<string, number>();
  for (const cat of SEED_CATEGORIES) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1);

    if (existing.length > 0) {
      categoryMap.set(cat.slug, existing[0].id);
    } else {
      const inserted = await db
        .insert(categories)
        .values({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
        })
        .returning();
      categoryMap.set(cat.slug, inserted[0].id);
    }
  }

  // Insert products idempotently
  for (const item of SEED_PRODUCTS) {
    const categoryId = categoryMap.get(item.categorySlug) || Array.from(categoryMap.values())[0];
    const existingProd = await db
      .select()
      .from(products)
      .where(eq(products.slug, item.slug))
      .limit(1);

    if (existingProd.length === 0) {
      await db.insert(products).values({
        categoryId,
        title: item.title,
        slug: item.slug,
        description: item.description,
        price: item.price,
        level: item.level,
        fileSize: item.level === 'free' ? '1.2 MB' : item.level === 'standard' ? '2.8 MB' : '4.5 MB',
        previewImage: item.previewImage,
        aiVideoUrl: item.isFeatured ? 'showcase-demo' : null,
        downloadCount: 0,
        ratingAvg: item.ratingAvg,
        isFeatured: Boolean(item.isFeatured),
        isBestseller: Boolean(item.isBestseller),
        status: 'active',
        featuresJson: JSON.stringify(item.features),
      });
    }
  }

  // Seed coupons
  const defaultCoupons = [
    { code: 'KODRAEWJOB10', discountType: 'percent', discountValue: 10, usageLimit: 500 },
    { code: 'SUTSAMRET10', discountType: 'percent', discountValue: 10, usageLimit: 500 },
    { code: 'LAUNCH50', discountType: 'fixed', discountValue: 50, usageLimit: 200 },
    { code: 'SME2026', discountType: 'percent', discountValue: 20, usageLimit: 300 },
  ];
  for (const c of defaultCoupons) {
    await db
      .insert(coupons)
      .values(c)
      .onConflictDoNothing({ target: coupons.code });
  }

  // Seed payment settings
  const defaultPayments = [
    {
      provider: 'promptpay',
      configJson: JSON.stringify({
        promptpayId: '0819998888',
        accountName: 'กดแล้วจบ (Kodraewjob Digital Marketplace)',
        qrImageUrl: '/assets/aistudio/Untitled_e84a513c.jpg',
      }),
      isActive: true,
    },
    {
      provider: 'bank_transfer',
      configJson: JSON.stringify({
        banks: [
          { code: 'KBANK', name: 'ธนาคารกสิกรไทย', accountNo: '099-3-88844-2', accountName: 'กดแล้วจบ Digital Marketplace' },
          { code: 'SCB', name: 'ธนาคารไทยพาณิชย์', accountNo: '408-2-19921-5', accountName: 'กดแล้วจบ Digital Marketplace' },
          { code: 'BBL', name: 'ธนาคารกรุงเทพ', accountNo: '147-4-66210-9', accountName: 'กดแล้วจบ Digital Marketplace' },
          { code: 'KTB', name: 'ธนาคารกรุงไทย', accountNo: '679-0-33412-1', accountName: 'กดแล้วจบ Digital Marketplace' },
        ],
      }),
      isActive: true,
    },
    {
      provider: 'card',
      configJson: JSON.stringify({ gateway: 'Stripe / Omise', feePercent: 0 }),
      isActive: true,
    },
    {
      provider: 'truemoney',
      configJson: JSON.stringify({ walletNumber: '081-999-8888' }),
      isActive: true,
    },
  ];
  for (const p of defaultPayments) {
    await db
      .insert(paymentsSettings)
      .values(p)
      .onConflictDoNothing({ target: paymentsSettings.provider });
  }

  // Seed initial verified reviews if none exist
  const reviewCount = await db.select({ value: count() }).from(reviews);
  if (reviewCount[0].value === 0) {
    const sampleProducts = await db.select().from(products).limit(6);
    const sampleReviews = [
      {
        authorName: 'คุณกิตติพงษ์ วรรณศิริ (บจก. สยามเฟอร์นิเจอร์)',
        rating: 5,
        comment: 'ไฟล์สต๊อกและ BOM ช่วยลดเวลาเช็กของในโกดังจากครึ่งวันเหลือแค่ 15 นาที สูตรทำงานแม่นยำมากครับ',
      },
      {
        authorName: 'คุณณัฐวดี เจริญสุข (ร้านอาหารบ้านสวน)',
        rating: 5,
        comment: 'ใช้เทมเพลตคำนวณต้นทุนเมนูอาหาร + GP เดลิเวอรี ทำให้ปรับราคาขายได้กำไรชัดเจนขึ้นมาก แนะนำเลยค่ะ',
      },
      {
        authorName: 'คุณธนากร สุขสวัสดิ์ (HR Manager)',
        rating: 5,
        comment: 'ระบบเงินเดือนและสลิป VBA กดปุ่มเดียวออกสลิป PDF ให้พนักงานทั้ง 45 คน ประหยัดเวลาปิดงวดทุกสิ้นเดือน',
      },
      {
        authorName: 'คุณศิริพร อัครเดชา (เจ้าของหอพักสุขใจ)',
        rating: 5,
        comment: 'ไฟล์หอพักใช้งานง่ายมาก กรอกมิเตอร์น้ำไฟแล้วพิมพ์ใบแจ้งหนี้ให้ลูกบ้านได้เลย ไม่ต้องจ้างโปรแกรมรายเดือนแพงๆ',
      },
    ];

    for (let i = 0; i < sampleProducts.length; i++) {
      const r = sampleReviews[i % sampleReviews.length];
      await db.insert(reviews).values({
        productId: sampleProducts[i].id,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
        verifiedPurchase: true,
      });
    }
  }

  await ensureDefaultSiteAssets();
  await db
    .insert(siteSettings)
    .values({ key: 'real_download_counts_synced', valueJson: 'true' })
    .onConflictDoNothing({ target: siteSettings.key });
}
