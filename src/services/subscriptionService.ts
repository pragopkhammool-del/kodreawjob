import fs from 'node:fs';
import path from 'node:path';
import { and, asc, count, eq, isNull } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  erpAuditLogs,
  erpCompanyUsers,
  erpInventoryProducts,
  erpModuleRecords,
  erpPackages,
  erpPackages as erpPackagesTable,
  erpStockMovements,
  erpSubscriptions,
} from '../db/schema.ts';

export interface PackageSeedDef {
  code: string;
  name: string;
  badge: string;
  price: number;
  billingCycle: 'trial_30d' | 'monthly' | 'yearly';
  durationDays: number;
  maxStorageMb: number; // -1 = Unlimited
  maxUsers: number; // -1 = Unlimited
  maxRecords: number; // -1 = Unlimited
  features: string[];
  isPopular: boolean;
  sortOrder: number;
}

export const ERP_PACKAGES_CATALOG: PackageSeedDef[] = [
  {
    code: 'trial',
    name: 'FREE TRIAL (ทดลองใช้งาน 1 เดือน)',
    badge: 'ทดลองฟรี 30 วัน',
    price: 0,
    billingCycle: 'trial_30d',
    durationDays: 30,
    maxStorageMb: 30,
    maxUsers: 1,
    maxRecords: 99,
    features: [
      'ทดลองใช้งาน Web App ERP ครบทั้ง 20 ระบบ',
      'Storage 30 MB · 1 User · 99 Data Records',
      'Dashboard & รายงานวิเคราะห์แบบเรียลไทม์',
      'พิมพ์ใบเสร็จ ใบกำกับภาษี สลิปเงินเดือน พร้อมโลโก้บริษัท',
      'แจ้งเตือนอัตโนมัติก่อนหมดอายุ 7 วัน, 3 วัน และ 1 วัน',
    ],
    isPopular: false,
    sortOrder: 1,
  },
  {
    code: 'basic',
    name: 'BASIC',
    badge: 'เริ่มต้นใช้งานจริง',
    price: 250,
    billingCycle: 'monthly',
    durationDays: 30,
    maxStorageMb: 30,
    maxUsers: 1,
    maxRecords: 99,
    features: [
      'Storage 30 MB · 1 User Account · 99 Data Records',
      'Dashboard สรุปภาพรวมธุรกิจ & สต๊อกสินค้า',
      'Report & พิมพ์เอกสาร A4 / 80mm / สลิปเงินเดือน',
      'Export Excel (.xlsx) & CSV + Backup JSON',
      'Support มาตรฐานผ่าน LINE Official',
    ],
    isPopular: false,
    sortOrder: 2,
  },
  {
    code: 'standard',
    name: 'STANDARD',
    badge: 'ธุรกิจกำลังเติบโต',
    price: 350,
    billingCycle: 'monthly',
    durationDays: 30,
    maxStorageMb: 35,
    maxUsers: 2,
    maxRecords: 199,
    features: [
      'Storage 35 MB · 2 User Accounts · 199 Data Records',
      'Multi User ทำงานร่วมกันได้ 2 บัญชีผู้ใช้',
      'Dashboard, Report, Export Excel/CSV & Backup',
      'เชื่อมต่อ POS ตัดสต๊อกและบัญชีรายรับอัตโนมัติ',
      'Support มาตรฐานรวดเร็ว',
    ],
    isPopular: false,
    sortOrder: 3,
  },
  {
    code: 'professional',
    name: 'PROFESSIONAL',
    badge: '🔥 แพ็กเกจยอดนิยม',
    price: 550,
    billingCycle: 'monthly',
    durationDays: 30,
    maxStorageMb: 50,
    maxUsers: 5,
    maxRecords: 600,
    features: [
      'Storage 50 MB · 5 User Accounts · 600 Data Records',
      'Multi User + กำหนด Role & Permission แยกแผนก',
      'Dashboard & รายงานครบทั้ง 20 ระบบธุรกิจ',
      'ระบบสั่งซื้อ PO รับเข้าคลัง & เงินเดือนลงบัญชีอัตโนมัติ',
      'Priority Support กลุ่ม LINE & ฟอรั่ม',
    ],
    isPopular: true,
    sortOrder: 4,
  },
  {
    code: 'business',
    name: 'BUSINESS',
    badge: 'SME เต็มรูปแบบ',
    price: 990,
    billingCycle: 'monthly',
    durationDays: 30,
    maxStorageMb: 100,
    maxUsers: 10,
    maxRecords: 3000,
    features: [
      'Storage 100 MB · 10 User Accounts · 3,000 Data Records',
      'กำหนด Role & Permission ละเอียดระดับฝ่าย',
      'Advanced Report วิเคราะห์กำไร ต้นทุนผลิต และอายุหนี้',
      'ระบบเอกสารครบชุด + QR Asset + Export MySQL',
      'Priority Support ทีมพัฒนา',
    ],
    isPopular: false,
    sortOrder: 5,
  },
  {
    code: 'enterprise',
    name: 'ENTERPRISE',
    badge: 'องค์กรขนาดใหญ่',
    price: 1500,
    billingCycle: 'monthly',
    durationDays: 30,
    maxStorageMb: 500,
    maxUsers: -1,
    maxRecords: 15000,
    features: [
      'Storage 500 MB · User Unlimited · 15,000 Data Records',
      'User Management ไม่จำกัดผู้ใช้งานในองค์กร',
      'Role & Permission ครบทุกตำแหน่ง',
      'Advanced Report + API Integration + Backup ครบชุด',
      'Dedicated Support ดูแลใกล้ชิด',
    ],
    isPopular: false,
    sortOrder: 6,
  },
  {
    code: 'enterprise_annual_saver',
    name: 'ENTERPRISE รายปี (โปรประหยัด)',
    badge: 'ประหยัด 2,100 บ./ปี',
    price: 15900,
    billingCycle: 'yearly',
    durationDays: 365,
    maxStorageMb: 500,
    maxUsers: -1,
    maxRecords: 15000,
    features: [
      'จ่าย 15,900 บ./ปี (เฉลี่ย 1,325 บ./ด. จาก 18,000 บ.)',
      'Storage 500 MB · User Unlimited · 15,000 Data Records',
      'User Management + Role & Permission + Advanced Report',
      'API Integration + Priority Support ตลอด 12 เดือน',
    ],
    isPopular: false,
    sortOrder: 7,
  },
  {
    code: 'enterprise_yearly',
    name: 'ENTERPRISE YEARLY UNLIMITED',
    badge: '👑 Unlimited Package',
    price: 19000,
    billingCycle: 'yearly',
    durationDays: 365,
    maxStorageMb: -1,
    maxUsers: -1,
    maxRecords: -1,
    features: [
      'Storage Unlimited (ไม่จำกัดพื้นที่จัดเก็บ)',
      'User Unlimited (ไม่จำกัดจำนวนผู้ใช้)',
      'Data Records Unlimited (ไม่จำกัดรายการข้อมูล)',
      'Priority Support ระดับ VIP + Multi-Application Access',
      'Role & Permission + Advanced Report + API ครบทุกโมดูล',
    ],
    isPopular: false,
    sortOrder: 8,
  },
];

export type ExpiryAlertWindow = '7d' | '3d' | '1d' | 'expired' | null;
export type StorageHealth = 'ok' | 'warning' | 'critical' | 'blocked';

export interface CompanyUsageSummary {
  packageCode: string;
  packageName: string;
  packageBadge: string;
  price: number;
  billingCycle: string;
  status: string;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expiryAlert: ExpiryAlertWindow;
  trialStartAt: string;
  trialEndAt: string;
  expiresAt: string;
  recordsUsed: number;
  recordsLimit: number; // -1 = Unlimited
  recordsPct: number;
  usersUsed: number;
  usersLimit: number; // -1 = Unlimited
  usersPct: number;
  storageUsedBytes: number;
  storageUsedMb: number;
  storageLimitMb: number; // -1 = Unlimited
  storagePct: number;
  storageHealth: StorageHealth;
}

let packagesSeeded = false;

export async function ensureErpPackagesSeeded() {
  if (packagesSeeded) return;
  for (const pkg of ERP_PACKAGES_CATALOG) {
    const existing = await db
      .select()
      .from(erpPackages)
      .where(eq(erpPackages.code, pkg.code))
      .limit(1);
    const featuresJson = JSON.stringify(pkg.features);
    if (existing.length === 0) {
      await db.insert(erpPackages).values({
        code: pkg.code,
        name: pkg.name,
        badge: pkg.badge,
        price: pkg.price,
        billingCycle: pkg.billingCycle,
        durationDays: pkg.durationDays,
        maxStorageMb: pkg.maxStorageMb,
        maxUsers: pkg.maxUsers,
        maxRecords: pkg.maxRecords,
        featuresJson,
        isPopular: pkg.isPopular,
        sortOrder: pkg.sortOrder,
      });
    } else {
      await db
        .update(erpPackages)
        .set({
          name: pkg.name,
          badge: pkg.badge,
          price: pkg.price,
          billingCycle: pkg.billingCycle,
          durationDays: pkg.durationDays,
          maxStorageMb: pkg.maxStorageMb,
          maxUsers: pkg.maxUsers,
          maxRecords: pkg.maxRecords,
          featuresJson,
          isPopular: pkg.isPopular,
          sortOrder: pkg.sortOrder,
        })
        .where(eq(erpPackages.code, pkg.code));
    }
  }
  packagesSeeded = true;
}

export async function listErpPackages() {
  await ensureErpPackagesSeeded();
  const rows = await db.select().from(erpPackagesTable).orderBy(asc(erpPackagesTable.sortOrder));
  return rows.map((r) => {
    let features: string[] = [];
    try {
      features = JSON.parse(r.featuresJson);
    } catch {
      features = [];
    }
    return { ...r, features };
  });
}

export async function ensureCompanySubscription(
  companyId: number,
  ownerUid: string,
  ownerName: string,
  ownerEmail: string
) {
  await ensureErpPackagesSeeded();

  // Ensure owner exists as primary Admin member in erp_company_users
  const existingUsers = await db
    .select({ value: count() })
    .from(erpCompanyUsers)
    .where(eq(erpCompanyUsers.companyId, companyId));

  if (existingUsers[0].value === 0) {
    await db.insert(erpCompanyUsers).values({
      companyId,
      memberName: ownerName || 'ผู้ดูแลระบบหลัก',
      memberEmail: ownerEmail || 'admin@kodraewjob.th',
      role: 'admin',
      status: 'active',
    });
  }

  let [sub] = await db
    .select()
    .from(erpSubscriptions)
    .where(eq(erpSubscriptions.companyId, companyId))
    .limit(1);

  if (!sub) {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const [created] = await db
      .insert(erpSubscriptions)
      .values({
        companyId,
        ownerUid,
        applicationKey: 'erp-20-suite',
        packageCode: 'trial',
        status: 'Trial',
        isTrial: true,
        trialStartAt: now,
        trialEndAt: trialEnd,
        startAt: now,
        expiresAt: trialEnd,
      })
      .returning();
    sub = created;
  }

  // Evaluate live status transitions (Trial / Active / Expiring Soon / Expired)
  if (sub.status !== 'Suspended' && sub.status !== 'Cancelled') {
    const nowMs = Date.now();
    const expiresMs = new Date(sub.expiresAt).getTime();
    const daysRemaining = Math.ceil((expiresMs - nowMs) / (24 * 60 * 60 * 1000));
    let computedStatus = sub.isTrial ? 'Trial' : 'Active';
    if (daysRemaining <= 0) {
      computedStatus = 'Expired';
    } else if (daysRemaining <= 7) {
      computedStatus = 'Expiring Soon';
    }
    if (computedStatus !== sub.status) {
      const [updated] = await db
        .update(erpSubscriptions)
        .set({ status: computedStatus, updatedAt: new Date() })
        .where(eq(erpSubscriptions.id, sub.id))
        .returning();
      sub = updated;
    }
  }

  return sub;
}

export async function computeCompanyUsage(
  companyId: number,
  companyLogoUrl: string | null | undefined,
  sub: typeof erpSubscriptions.$inferSelect
): Promise<CompanyUsageSummary> {
  await ensureErpPackagesSeeded();
  const [pkg] = await db
    .select()
    .from(erpPackages)
    .where(eq(erpPackages.code, sub.packageCode))
    .limit(1);

  const fallbackPkg = ERP_PACKAGES_CATALOG[0];
  const packageName = pkg?.name || fallbackPkg.name;
  const packageBadge = pkg?.badge || fallbackPkg.badge;
  const price = pkg?.price ?? fallbackPkg.price;
  const billingCycle = pkg?.billingCycle || fallbackPkg.billingCycle;
  const maxStorageMb = pkg?.maxStorageMb ?? fallbackPkg.maxStorageMb;
  const maxUsers = pkg?.maxUsers ?? fallbackPkg.maxUsers;
  const maxRecords = pkg?.maxRecords ?? fallbackPkg.maxRecords;

  const invRows = await db
    .select()
    .from(erpInventoryProducts)
    .where(and(eq(erpInventoryProducts.companyId, companyId), eq(erpInventoryProducts.status, 'active')));

  const recRows = await db
    .select()
    .from(erpModuleRecords)
    .where(and(eq(erpModuleRecords.companyId, companyId), isNull(erpModuleRecords.deletedAt)));

  const moveRows = await db
    .select()
    .from(erpStockMovements)
    .where(eq(erpStockMovements.companyId, companyId));

  const userRows = await db
    .select()
    .from(erpCompanyUsers)
    .where(eq(erpCompanyUsers.companyId, companyId));

  // Real data byte footprint (records JSON + movements + uploaded logo size)
  let dataBytes = 0;
  for (const row of invRows) dataBytes += Buffer.byteLength(JSON.stringify(row), 'utf8');
  for (const row of recRows) dataBytes += Buffer.byteLength(JSON.stringify(row), 'utf8');
  for (const row of moveRows) dataBytes += Buffer.byteLength(JSON.stringify(row), 'utf8');

  if (companyLogoUrl && companyLogoUrl.startsWith('/uploads/company/')) {
    const logoDir = path.resolve(process.cwd(), 'storage', 'company-logos');
    const target = path.resolve(logoDir, path.basename(companyLogoUrl));
    if (target.startsWith(logoDir + path.sep) && fs.existsSync(target)) {
      try {
        dataBytes += fs.statSync(target).size;
      } catch {
        // ignore stat errors
      }
    }
  }

  const storageUsedMb = Number((dataBytes / (1024 * 1024)).toFixed(2));
  const recordsUsed = invRows.length + recRows.length;
  const usersUsed = userRows.length;

  const recordsPct =
    maxRecords === -1 ? 0 : Math.min(100, Math.round((recordsUsed / Math.max(1, maxRecords)) * 100));
  const usersPct =
    maxUsers === -1 ? 0 : Math.min(100, Math.round((usersUsed / Math.max(1, maxUsers)) * 100));
  const storagePct =
    maxStorageMb === -1
      ? 0
      : Math.min(100, Math.round((storageUsedMb / Math.max(0.01, maxStorageMb)) * 100));

  let storageHealth: StorageHealth = 'ok';
  if (maxStorageMb !== -1) {
    if (storagePct >= 100) storageHealth = 'blocked';
    else if (storagePct >= 95) storageHealth = 'critical';
    else if (storagePct >= 80) storageHealth = 'warning';
  }

  const nowMs = Date.now();
  const expiresMs = new Date(sub.expiresAt).getTime();
  const daysRemaining = Math.max(0, Math.ceil((expiresMs - nowMs) / (24 * 60 * 60 * 1000)));
  const isExpired =
    sub.status === 'Expired' || sub.status === 'Suspended' || sub.status === 'Cancelled' || expiresMs <= nowMs;

  let expiryAlert: ExpiryAlertWindow = null;
  if (isExpired) expiryAlert = 'expired';
  else if (daysRemaining <= 1) expiryAlert = '1d';
  else if (daysRemaining <= 3) expiryAlert = '3d';
  else if (daysRemaining <= 7) expiryAlert = '7d';

  return {
    packageCode: sub.packageCode,
    packageName,
    packageBadge,
    price,
    billingCycle,
    status: sub.status,
    isTrial: sub.isTrial,
    isExpired,
    daysRemaining,
    expiryAlert,
    trialStartAt: new Date(sub.trialStartAt).toISOString(),
    trialEndAt: new Date(sub.trialEndAt).toISOString(),
    expiresAt: new Date(sub.expiresAt).toISOString(),
    recordsUsed,
    recordsLimit: maxRecords,
    recordsPct,
    usersUsed,
    usersLimit: maxUsers,
    usersPct,
    storageUsedBytes: dataBytes,
    storageUsedMb,
    storageLimitMb: maxStorageMb,
    storagePct,
    storageHealth,
  };
}

export class QuotaLimitError extends Error {
  statusCode = 403;
  code: string;
  usage: CompanyUsageSummary;
  constructor(code: string, message: string, usage: CompanyUsageSummary) {
    super(message);
    this.code = code;
    this.usage = usage;
  }
}

export async function assertCanAddRecords(
  companyId: number,
  companyLogoUrl: string | null | undefined,
  sub: typeof erpSubscriptions.$inferSelect,
  incomingCount = 1,
  incomingBytes = 1024
) {
  const usage = await computeCompanyUsage(companyId, companyLogoUrl, sub);
  if (usage.isExpired) {
    throw new QuotaLimitError(
      'SUBSCRIPTION_EXPIRED',
      'แพ็กเกจทดลอง/สมาชิกของคุณหมดอายุแล้ว กรุณาเลือกแพ็กเกจและชำระเงินเพื่อดำเนินการต่อ',
      usage
    );
  }
  if (usage.recordsLimit !== -1 && usage.recordsUsed + incomingCount > usage.recordsLimit) {
    throw new QuotaLimitError(
      'RECORD_LIMIT_REACHED',
      'คุณใช้ข้อมูลครบตามจำนวนที่แพ็กเกจกำหนดแล้ว กรุณา Upgrade Package',
      usage
    );
  }
  if (
    usage.storageLimitMb !== -1 &&
    usage.storageUsedBytes + incomingBytes > usage.storageLimitMb * 1024 * 1024
  ) {
    throw new QuotaLimitError(
      'STORAGE_LIMIT_REACHED',
      'พื้นที่จัดเก็บข้อมูล (Storage) เต็มตามแพ็กเกจแล้ว กรุณา Upgrade Package',
      usage
    );
  }
  return usage;
}

export async function assertCanUploadStorage(
  companyId: number,
  companyLogoUrl: string | null | undefined,
  sub: typeof erpSubscriptions.$inferSelect,
  incomingBytes: number
) {
  const usage = await computeCompanyUsage(companyId, companyLogoUrl, sub);
  if (usage.isExpired) {
    throw new QuotaLimitError(
      'SUBSCRIPTION_EXPIRED',
      'แพ็กเกจของคุณหมดอายุแล้ว กรุณา Upgrade Package ก่อนอัปโหลดไฟล์',
      usage
    );
  }
  if (
    usage.storageLimitMb !== -1 &&
    usage.storageUsedBytes + incomingBytes > usage.storageLimitMb * 1024 * 1024
  ) {
    throw new QuotaLimitError(
      'STORAGE_LIMIT_REACHED',
      `พื้นที่ Storage ไม่เพียงพอ (ใช้ไป ${usage.storageUsedMb} / ${usage.storageLimitMb} MB) กรุณา Upgrade Package`,
      usage
    );
  }
  return usage;
}

export async function assertCanAddUser(
  companyId: number,
  companyLogoUrl: string | null | undefined,
  sub: typeof erpSubscriptions.$inferSelect
) {
  const usage = await computeCompanyUsage(companyId, companyLogoUrl, sub);
  if (usage.isExpired) {
    throw new QuotaLimitError(
      'SUBSCRIPTION_EXPIRED',
      'แพ็กเกจของคุณหมดอายุแล้ว กรุณา Upgrade Package เพื่อเพิ่มผู้ใช้งาน',
      usage
    );
  }
  if (usage.usersLimit !== -1 && usage.usersUsed + 1 > usage.usersLimit) {
    throw new QuotaLimitError(
      'USER_LIMIT_REACHED',
      `จำนวนผู้ใช้งานครบตามสิทธิ์แพ็กเกจแล้ว (${usage.usersUsed}/${usage.usersLimit} User) กรุณา Upgrade Package`,
      usage
    );
  }
  return usage;
}

export async function upgradeCompanyPackage(
  companyId: number,
  ownerUid: string,
  ownerName: string,
  packageCode: string,
  promptpayRef?: string
) {
  await ensureErpPackagesSeeded();
  const [pkg] = await db
    .select()
    .from(erpPackages)
    .where(eq(erpPackages.code, packageCode))
    .limit(1);

  if (!pkg || pkg.code === 'trial') {
    throw new Error('INVALID_PACKAGE');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

  const [existing] = await db
    .select()
    .from(erpSubscriptions)
    .where(eq(erpSubscriptions.companyId, companyId))
    .limit(1);

  let updatedSub;
  if (existing) {
    const [row] = await db
      .update(erpSubscriptions)
      .set({
        packageCode: pkg.code,
        status: 'Active',
        isTrial: false,
        startAt: now,
        expiresAt,
        promptpayRef: promptpayRef || `PP-${Date.now().toString().slice(-6)}`,
        updatedAt: now,
      })
      .where(eq(erpSubscriptions.id, existing.id))
      .returning();
    updatedSub = row;
  } else {
    const [row] = await db
      .insert(erpSubscriptions)
      .values({
        companyId,
        ownerUid,
        applicationKey: 'erp-20-suite',
        packageCode: pkg.code,
        status: 'Active',
        isTrial: false,
        trialStartAt: now,
        trialEndAt: now,
        startAt: now,
        expiresAt,
        promptpayRef: promptpayRef || `PP-${Date.now().toString().slice(-6)}`,
      })
      .returning();
    updatedSub = row;
  }

  await db.insert(erpAuditLogs).values({
    companyId,
    userUid: ownerUid,
    userName: ownerName,
    moduleKey: 'subscription',
    action: 'UPGRADE_PACKAGE',
    recordId: pkg.code,
    summary: `อัปเกรดแพ็กเกจเป็น ${pkg.name} (฿${pkg.price.toLocaleString()}) สำเร็จ · ใช้งานได้ถึง ${expiresAt.toLocaleDateString('th-TH')}`,
  });

  return { subscription: updatedSub, pkg };
}
