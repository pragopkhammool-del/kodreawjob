import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  erpAuditLogs,
  erpCompanies,
  erpInventoryProducts,
  erpModuleRecords,
  erpStockMovements,
} from '../db/schema.ts';

export const DEFAULT_PREFIX_CONFIG = {
  QT: 'QT-2026',
  SO: 'SO-2026',
  INV: 'INV-2026',
  RC: 'RC-2026',
  PR: 'PR-2026',
  PO: 'PO-2026',
  PAY: 'PAY-2026',
  PROD: 'PROD-2026',
  SHIP: 'SHIP-2026',
  AST: 'AST-2026',
};

export async function ensureCompanyErpSeeded(
  ownerUid: string,
  ownerName: string,
  ownerEmail: string
) {
  const existing = await db
    .select()
    .from(erpCompanies)
    .where(eq(erpCompanies.ownerUid, ownerUid))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const isDemo = ownerUid === 'showcase-demo';
  const [company] = await db
    .insert(erpCompanies)
    .values({
      ownerUid,
      companyName: isDemo
        ? 'บริษัท กดแล้วจบ โซลูชันส์ จำกัด (ตัวอย่าง SaaS)'
        : `บริษัท ${ownerName} จำกัด`,
      companyNameEn: isDemo ? 'Kodraewjob Business Solutions Co., Ltd.' : 'My Business Co., Ltd.',
      taxId: '0105567012345',
      branchName: 'สำนักงานใหญ่',
      address: '99/88 อาคารซอฟต์แวร์พาร์ค ถ.แจ้งวัฒนะ อ.ปากเกร็ด จ.นนทบุรี 11120',
      phone: '02-999-8899',
      email: ownerEmail || 'contact@kodraewjob.th',
      website: 'https://kodraewjob.th',
      logoUrl: '/assets/aistudio/810624000_983971044712451_6466500635178443708_n_81f9a476.jpg',
      vatRate: 7,
      whtRate: 3,
      currency: 'THB',
      prefixConfigJson: JSON.stringify(DEFAULT_PREFIX_CONFIG),
      bankInfoJson: JSON.stringify({
        bankName: 'ธนาคารกสิกรไทย (KBANK)',
        accountNo: '081-9-99888-8',
        accountName: isDemo ? 'บจก. กดแล้วจบ โซลูชันส์' : ownerName,
      }),
    })
    .returning();

  // Seed initial Stock Inventory items
  const stockSeed = [
    {
      sku: 'AUTO-BRK-001',
      barcode: '8859001000011',
      name: 'ชุดจานเบรกหน้า CNC Alloy 280mm',
      category: 'อะไหล่ยานยนต์',
      brand: 'KDJ Parts',
      unit: 'ชุด',
      warehouse: 'คลังหลัก (WH-01)',
      location: 'A1-02',
      supplier: 'บจก. สยามออโต้พาร์ท',
      costPrice: 1250,
      sellPrice: 2190,
      stockQty: 48,
      minStock: 10,
      maxStock: 150,
      reorderPoint: 15,
    },
    {
      sku: 'STL-COIL-304',
      barcode: '8859001000028',
      name: 'ม้วนเหล็กแผ่นรีดเย็น SPCC 1.2mm',
      category: 'วัตถุดิบโรงงาน',
      brand: 'ThaiSteel',
      unit: 'ม้วน',
      warehouse: 'คลังวัตถุดิบ (WH-RM)',
      location: 'B2-01',
      supplier: 'บมจ. เหล็กแผ่นไทย',
      costPrice: 8400,
      sellPrice: 10500,
      stockQty: 6,
      minStock: 8,
      maxStock: 40,
      reorderPoint: 10,
    },
    {
      sku: 'ELEC-PLC-24V',
      barcode: '8859001000035',
      name: 'ชุดควบคุม PLC Industrial 24VDC',
      category: 'อุปกรณ์ไฟฟ้าโรงงาน',
      brand: 'OmronTech',
      unit: 'เครื่อง',
      warehouse: 'คลังหลัก (WH-01)',
      location: 'C1-05',
      supplier: 'บจก. ออโตเมชั่นโปร',
      costPrice: 5200,
      sellPrice: 7900,
      stockQty: 14,
      minStock: 5,
      maxStock: 50,
      reorderPoint: 8,
    },
    {
      sku: 'CAFE-BEAN-1KG',
      barcode: '8859001000042',
      name: 'เมล็ดกาแฟคั่วกลาง Arabica ดอยช้าง 1kg',
      category: 'วัตถุดิบอาหารและเครื่องดื่ม',
      brand: 'DoiRoast',
      unit: 'ถุง',
      warehouse: 'คลังสาขา 1 (WH-02)',
      location: 'D1-01',
      supplier: 'ไร่กาแฟดอยช้าง',
      costPrice: 360,
      sellPrice: 650,
      stockQty: 0,
      minStock: 10,
      maxStock: 100,
      reorderPoint: 15,
    },
    {
      sku: 'POS-THERM-80',
      barcode: '8859001000059',
      name: 'กระดาษความร้อนพิมพ์ใบเสร็จ 80x80mm (แพ็ค 10)',
      category: 'วัสดุสำนักงาน',
      brand: 'PaperPro',
      unit: 'แพ็ค',
      warehouse: 'คลังหลัก (WH-01)',
      location: 'A3-04',
      supplier: 'บจก. ออฟฟิศซัพพลาย',
      costPrice: 210,
      sellPrice: 350,
      stockQty: 65,
      minStock: 15,
      maxStock: 200,
      reorderPoint: 20,
    },
  ];

  const insertedStock = await db
    .insert(erpInventoryProducts)
    .values(
      stockSeed.map((item) => ({
        companyId: company.id,
        ...item,
      }))
    )
    .returning();

  // Initial Stock Movements
  for (const prod of insertedStock) {
    if (prod.stockQty > 0) {
      await db.insert(erpStockMovements).values({
        companyId: company.id,
        productId: prod.id,
        type: 'IN',
        qty: prod.stockQty,
        unitCost: prod.costPrice,
        beforeQty: 0,
        afterQty: prod.stockQty,
        referenceNo: `GR-${prod.sku}`,
        warehouseTo: prod.warehouse,
        note: 'ยอดรับเข้าตั้งต้นระบบคลังสินค้า',
        createdBy: ownerName,
      });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10);

  // Seed representative live records across all ERP modules
  const moduleSeeds = [
    {
      moduleKey: 'pos',
      docNumber: 'RC-2026-000001',
      title: 'ขายหน้าร้าน #001 (ชุดจานเบรก CNC + กระดาษความร้อน)',
      partyName: 'ลูกค้าหน้าร้าน (Walk-in)',
      categoryOrDept: 'QR PromptPay',
      status: 'paid',
      amount: 2717.8,
      qty: 2,
      dateStr: today,
      payloadJson: JSON.stringify({
        paymentMethod: 'QR PromptPay',
        subtotal: 2540,
        vat: 177.8,
        discount: 0,
        cashier: ownerName,
        items: [
          { sku: 'AUTO-BRK-001', name: 'ชุดจานเบรกหน้า CNC Alloy 280mm', qty: 1, price: 2190 },
          { sku: 'POS-THERM-80', name: 'กระดาษความร้อนพิมพ์ใบเสร็จ 80x80mm', qty: 1, price: 350 },
        ],
      }),
    },
    {
      moduleKey: 'accounting',
      docNumber: 'ACC-2026-000001',
      title: 'รายรับค่าบริการวางระบบ ERP & ขายสินค้าหน้าร้าน',
      partyName: 'บจก. เอสเอ็มอี ไทยเจริญ',
      categoryOrDept: 'รายรับ (Income)',
      status: 'completed',
      amount: 48500,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        flow: 'income',
        account: 'ธนาคารกสิกรไทย (KBANK)',
        paymentMethod: 'Bank Transfer',
        note: 'รับชำระงวดที่ 1',
      }),
    },
    {
      moduleKey: 'accounting',
      docNumber: 'ACC-2026-000002',
      title: 'รายจ่ายค่าวัตถุดิบเหล็กแผ่นและอุปกรณ์ไฟฟ้า',
      partyName: 'บมจ. เหล็กแผ่นไทย',
      categoryOrDept: 'รายจ่าย (Expense)',
      status: 'completed',
      amount: 18400,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        flow: 'expense',
        account: 'ธนาคารกสิกรไทย (KBANK)',
        paymentMethod: 'Bank Transfer',
        note: 'ชำระตามใบวางบิล',
      }),
    },
    {
      moduleKey: 'hr_payroll',
      docNumber: 'PAY-2026-000001',
      title: 'เงินเดือนงวด พ.ย. 2026 — กิตติธนา วัฒนชัย',
      partyName: 'กิตติธนา วัฒนชัย (EMP-001)',
      categoryOrDept: 'วิศวกรรม & ผลิต',
      status: 'approved',
      amount: 34250,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        empCode: 'EMP-001',
        position: 'Senior Production Engineer',
        baseSalary: 32000,
        allowance: 2000,
        otPay: 2250,
        bonus: 0,
        sso: 750,
        tax: 650,
        pvd: 600,
        netPay: 34250,
        bankAccount: 'KBANK xxx-x-12345-x',
      }),
    },
    {
      moduleKey: 'attendance',
      docNumber: 'ATT-2026-000001',
      title: 'ลงเวลา & OT 1.5x (4 ชั่วโมง) — กิตติธนา วัฒนชัย',
      partyName: 'กิตติธนา วัฒนชัย',
      categoryOrDept: 'Shift A (08:00-17:00)',
      status: 'present',
      amount: 4,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        checkIn: '07:54',
        checkOut: '21:15',
        otMultiplier: '1.5',
        otHours: 4,
        source: 'Fingerprint Machine',
      }),
    },
    {
      moduleKey: 'leave',
      docNumber: 'LV-2026-000001',
      title: 'คำขอลาพักร้อนประจำปี (2 วัน) — ณัฐวดี สุขใจ',
      partyName: 'ณัฐวดี สุขใจ (EMP-004)',
      categoryOrDept: 'ลาพักร้อน',
      status: 'pending',
      amount: 2,
      qty: 2,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        leaveType: 'ลาพักร้อน',
        entitlement: 10,
        used: 2,
        workflowStage: 'Manager Review',
      }),
    },
    {
      moduleKey: 'purchasing',
      docNumber: 'PO-2026-000001',
      title: 'สั่งซื้อเมล็ดกาแฟ & ม้วนเหล็กแผ่น SPCC (PO เติมสต๊อก)',
      partyName: 'บมจ. เหล็กแผ่นไทย',
      categoryOrDept: 'จัดซื้อวัตถุดิบ',
      status: 'approved',
      amount: 42000,
      qty: 5,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        prNo: 'PR-2026-000012',
        sku: 'STL-COIL-304',
        receivedQty: 0,
        orderedQty: 5,
      }),
    },
    {
      moduleKey: 'sales_docs',
      docNumber: 'INV-2026-000001',
      title: 'ใบกำกับภาษี / ใบแจ้งหนี้ — ชุดควบคุม PLC & อะไหล่ CNC',
      partyName: 'บจก. สยามออโตเมชั่น แมนูแฟคเจอริ่ง',
      categoryOrDept: 'Tax Invoice (VAT 7%)',
      status: 'issued',
      amount: 34026,
      qty: 4,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        docType: 'Tax Invoice',
        customerTaxId: '0105561098765',
        customerAddress: '888 นิคมอุตสาหกรรมอมตะซิตี้ จ.ชลบุรี 20000',
        subtotal: 31800,
        vat: 2226,
        wht: 0,
        items: [
          { name: 'ชุดควบคุม PLC Industrial 24VDC', qty: 3, unitPrice: 7900 },
          { name: 'ชุดจานเบรกหน้า CNC Alloy 280mm', qty: 4, unitPrice: 2025 },
        ],
      }),
    },
    {
      moduleKey: 'ar_ap',
      docNumber: 'AR-2026-000001',
      title: 'ลูกหนี้การค้า Aging 1-30 วัน — บจก. สยามออโตเมชั่น',
      partyName: 'บจก. สยามออโตเมชั่น แมนูแฟคเจอริ่ง',
      categoryOrDept: 'AR (ลูกหนี้)',
      status: '1-30 วัน',
      amount: 34026,
      qty: 1,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        type: 'AR',
        agingBucket: '1-30',
        creditLimit: 200000,
        paidAmount: 0,
      }),
    },
    {
      moduleKey: 'rental',
      docNumber: 'RNT-2026-000001',
      title: 'ใบแจ้งหนี้ห้อง A-302 (ค่าเช่า + น้ำ + ไฟ)',
      partyName: 'คุณสมชาย ใจดี (ห้อง A-302)',
      categoryOrDept: 'อาคาร A',
      status: 'pending',
      amount: 5480,
      qty: 1,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        roomNo: 'A-302',
        rent: 4500,
        waterUnits: 12,
        waterCost: 216,
        electricUnits: 95,
        electricCost: 764,
      }),
    },
    {
      moduleKey: 'fleet',
      docNumber: 'FLT-2026-000001',
      title: 'จองรถกระบะตู้ทึบ 3ฒค-8899 ส่งชิ้นส่วนอมตะซิตี้',
      partyName: 'นายวีระชัย ขับดี (ขับรถ)',
      categoryOrDept: 'รถส่งสินค้า 4 ล้อ',
      status: 'in_use',
      amount: 1450,
      qty: 185,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        plate: '3ฒค-8899',
        mileage: 84520,
        fuelLiters: 42,
        insuranceExpiry: '2027-03-15',
      }),
    },
    {
      moduleKey: 'online_orders',
      docNumber: 'ONL-2026-000001',
      title: 'ออเดอร์ Shopee #SP26118899 — อะไหล่แต่ง CNC',
      partyName: 'คุณพีรพล (Shopee)',
      categoryOrDept: 'Shopee',
      status: 'Packing',
      amount: 1945,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        channel: 'Shopee',
        grossPrice: 2190,
        platformFee: 175,
        paymentFee: 70,
        netProfit: 695,
      }),
    },
    {
      moduleKey: 'food_cost',
      docNumber: 'FC-2026-000001',
      title: 'สูตรเมนู: ลาเต้เย็นอาราบิก้าพรีเมียม 16oz',
      partyName: 'สูตรมาตรฐานร้านคาเฟ่',
      categoryOrDept: 'เครื่องดื่มเย็น',
      status: 'optimal',
      amount: 26.5,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        ingredientCost: 19.5,
        packagingCost: 4.5,
        overheadCost: 2.5,
        totalCost: 26.5,
        sellingPrice: 75,
        foodCostPct: 26.0,
        grossProfit: 48.5,
      }),
    },
    {
      moduleKey: 'kpi',
      docNumber: 'KPI-2026-000001',
      title: 'ประเมิน KPI ไตรมาส 4 — ลดของเสียหน้าไลน์ Press < 1.5%',
      partyName: 'กิตติธนา วัฒนชัย',
      categoryOrDept: 'Production',
      status: 'Grade A',
      amount: 94.5,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        weightPct: 40,
        target: 98.5,
        actual: 99.1,
        score: 94.5,
        grade: 'A',
      }),
    },
    {
      moduleKey: 'assets',
      docNumber: 'AST-2026-000001',
      title: 'เครื่องปั๊มโลหะ Press 100T Hydraulic #M-100T',
      partyName: 'แผนกปั๊มขึ้นรูป (Press Shop)',
      categoryOrDept: 'เครื่องจักรโรงงาน',
      status: 'active',
      amount: 1450000,
      qty: 1,
      dateStr: '2025-01-15',
      payloadJson: JSON.stringify({
        serialNo: 'HYD-100T-2025-09',
        location: 'Line B - Bay 2',
        depreciationPerYear: 145000,
        qrTraceCode: 'AST-2026-000001',
      }),
    },
    {
      moduleKey: 'projects',
      docNumber: 'PRJ-2026-000001',
      title: 'โครงการติดตั้งระบบ Barcode คลังสินค้าอัจฉริยะ',
      partyName: 'ทีม IT & คลังสินค้า',
      categoryOrDept: 'In Progress',
      status: 'in_progress',
      amount: 75,
      qty: 1,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        progressPct: 75,
        priority: 'High',
        kanbanColumn: 'Doing',
        tasksCompleted: 9,
        tasksTotal: 12,
      }),
    },
    {
      moduleKey: 'manufacturing',
      docNumber: 'PROD-2026-000001',
      title: 'ใบสั่งผลิต Bracket ยึดกันชนหน้า (Press 100T + Robot Weld)',
      partyName: 'บจก. ไทยออโต้ แอสเซมบลี',
      categoryOrDept: 'Press 100T',
      status: 'QC Pass',
      amount: 1200,
      qty: 1188,
      dateStr: today,
      dueDateStr: nextMonth,
      payloadJson: JSON.stringify({
        partNo: 'BRK-FT-8801',
        machine: 'Press 100T + Robot Welding',
        planQty: 1200,
        goodQty: 1188,
        ngQty: 12,
        materialLot: 'COIL-304-LOT2611',
        operator: 'สมศักดิ์ ช่างกล',
        yieldPct: 99.0,
      }),
    },
    {
      moduleKey: 'logistics',
      docNumber: 'SHIP-2026-000001',
      title: 'จัดส่งสินค้า Lot #FG-8801 → นิคมอีสเทิร์นซีบอร์ด',
      partyName: 'บจก. ไทยออโต้ แอสเซมบลี',
      categoryOrDept: 'ขนส่งภายในบริษัท',
      status: 'In Transit',
      amount: 4200,
      qty: 140,
      dateStr: today,
      payloadJson: JSON.stringify({
        truck: '70-4455 ชลบุรี',
        driver: 'นายสุชาติ',
        distanceKm: 140,
        costPerKm: 30,
        forwarder: 'KDJ Fleet',
      }),
    },
    {
      moduleKey: 'school',
      docNumber: 'SCH-2026-000001',
      title: 'ผลการเรียน & ค่าเทอม 2/2026 — ด.ช. ปัญญา ฉลาดดี (ม.3/1)',
      partyName: 'ด.ช. ปัญญา ฉลาดดี',
      categoryOrDept: 'ม.3/1',
      status: 'paid',
      amount: 8500,
      qty: 1,
      dateStr: today,
      payloadJson: JSON.stringify({
        studentId: '6903101',
        gpa: 3.88,
        attendancePct: 98,
        tuitionPaid: 8500,
        grade: 'A',
      }),
    },
  ];

  await db.insert(erpModuleRecords).values(
    moduleSeeds.map((m) => ({
      companyId: company.id,
      ...m,
      dueDateStr: m.dueDateStr || null,
      createdBy: ownerName,
    }))
  );

  await db.insert(erpAuditLogs).values({
    companyId: company.id,
    userUid: ownerUid,
    userName: ownerName,
    moduleKey: 'company',
    action: 'CREATE',
    recordId: String(company.id),
    summary: `ลงทะเบียนองค์กร SaaS ERP "${company.companyName}" และสร้างฐานข้อมูลเริ่มต้นครบ 20 ระบบ`,
  });

  return company;
}

export function generateMysqlErpSchemaSql(): string {
  return `-- ============================================================================
-- Kodraewjob All-in-One Business ERP (20 Systems) — MySQL 8+ / MariaDB Schema
-- Encoding: utf8mb4_unicode_ci (Full Thai Language Support)
-- Import directly via phpMyAdmin
-- © 2027 Kodraewjob Digital Marketplace. สงวนลิขสิทธิ์ทุกประการ
-- ============================================================================

CREATE DATABASE IF NOT EXISTS \`kodraewjob_erp\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`kodraewjob_erp\`;

CREATE TABLE IF NOT EXISTS \`companies\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`company_name\` VARCHAR(255) NOT NULL,
  \`company_name_en\` VARCHAR(255) NULL,
  \`tax_id\` VARCHAR(32) NOT NULL,
  \`branch_name\` VARCHAR(120) NOT NULL DEFAULT 'สำนักงานใหญ่',
  \`address\` TEXT NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL,
  \`logo_url\` VARCHAR(500) NULL,
  \`vat_rate\` DECIMAL(5,2) NOT NULL DEFAULT 7.00,
  \`wht_rate\` DECIMAL(5,2) NOT NULL DEFAULT 3.00,
  \`prefix_config_json\` JSON NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`company_id\` INT UNSIGNED NOT NULL,
  \`username\` VARCHAR(100) NOT NULL UNIQUE,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('super_admin','admin','manager','hr','accounting','purchasing','sales','warehouse','production','logistics','employee','viewer') NOT NULL DEFAULT 'employee',
  \`must_change_password\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`inventory_products\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`company_id\` INT UNSIGNED NOT NULL,
  \`sku\` VARCHAR(64) NOT NULL,
  \`barcode\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(120) NOT NULL,
  \`unit\` VARCHAR(50) NOT NULL DEFAULT 'ชิ้น',
  \`warehouse\` VARCHAR(120) NOT NULL,
  \`location\` VARCHAR(80) NOT NULL,
  \`supplier\` VARCHAR(150) NOT NULL,
  \`cost_price\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`sell_price\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`stock_qty\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`min_stock\` DECIMAL(12,2) NOT NULL DEFAULT 5.00,
  \`max_stock\` DECIMAL(12,2) NOT NULL DEFAULT 200.00,
  \`reorder_point\` DECIMAL(12,2) NOT NULL DEFAULT 10.00,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL,
  UNIQUE KEY \`uq_company_sku\` (\`company_id\`, \`sku\`),
  FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`stock_movements\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`company_id\` INT UNSIGNED NOT NULL,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`type\` ENUM('IN','OUT','TRANSFER','ADJUST','COUNT','RETURN','DAMAGE','SCRAP','POS_SALE') NOT NULL,
  \`qty\` DECIMAL(12,2) NOT NULL,
  \`unit_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`before_qty\` DECIMAL(12,2) NOT NULL,
  \`after_qty\` DECIMAL(12,2) NOT NULL,
  \`reference_no\` VARCHAR(80) NOT NULL,
  \`note\` TEXT NULL,
  \`created_by\` VARCHAR(120) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`),
  FOREIGN KEY (\`product_id\`) REFERENCES \`inventory_products\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`erp_module_records\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`company_id\` INT UNSIGNED NOT NULL,
  \`module_key\` VARCHAR(40) NOT NULL,
  \`doc_number\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`party_name\` VARCHAR(255) NOT NULL,
  \`category_or_dept\` VARCHAR(120) NOT NULL,
  \`status\` VARCHAR(50) NOT NULL,
  \`amount\` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  \`qty\` DECIMAL(12,2) NOT NULL DEFAULT 1.00,
  \`date_str\` DATE NOT NULL,
  \`due_date_str\` DATE NULL,
  \`payload_json\` JSON NOT NULL,
  \`created_by\` VARCHAR(120) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL,
  INDEX \`idx_module_company\` (\`company_id\`, \`module_key\`),
  FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`audit_logs\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`company_id\` INT UNSIGNED NOT NULL,
  \`user_name\` VARCHAR(120) NOT NULL,
  \`module_key\` VARCHAR(40) NOT NULL,
  \`action\` VARCHAR(30) NOT NULL,
  \`record_id\` VARCHAR(64) NULL,
  \`summary\` TEXT NOT NULL,
  \`ip_address\` VARCHAR(64) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;
}
