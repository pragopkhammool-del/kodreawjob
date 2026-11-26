import { count, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  categories,
  coupons,
  paymentsSettings,
  products,
  reviews,
} from './schema.ts';

const IMG_ACCOUNTING = '/src/assets/images/template_accounting_pos_1795676831169.jpg';
const IMG_MANUFACTURING = '/src/assets/images/template_manufacturing_bom_1795676829666.jpg';
const IMG_ENGINEERING = '/src/assets/images/template_engineering_solver_1795676831708.jpg';
const IMG_HERO = '/src/assets/images/hero_excel_workstation_1795676830070.jpg';
const IMG_HR_PAYROLL = '/src/assets/images/product_hr_payroll_thai_1795678104397.jpg';
const IMG_POS_RETAIL = '/src/assets/images/product_pos_retail_thai_1795678105057.jpg';
const IMG_VBA_STANDARD = '/src/assets/images/vba_automation_excel_1795679554655.jpg';
const IMG_GSHEETS_CLOUD = '/src/assets/images/google_sheets_cloud_1795679554880.jpg';
const IMG_APPSHEET_MOBILE = '/src/assets/images/appsheet_nocode_mobile_1795679555658.jpg';
const IMG_ERP_SAAS = '/src/assets/images/erp_saas_suite_preview_1795679556912.jpg';
const IMG_FOODCOST = '/src/assets/images/template_restaurant_foodcost_1795680575049.jpg';
const IMG_CONSTRUCTION_BOQ = '/src/assets/images/template_construction_boq_1795680575810.jpg';
const IMG_DORMITORY = '/src/assets/images/template_dormitory_rental_1795680575996.jpg';
const IMG_ECOMMERCE = '/src/assets/images/template_online_ecommerce_1795680577250.jpg';
const IMG_LOGISTICS_FLEET = '/src/assets/images/template_logistics_fleet_1795680578621.jpg';
const IMG_EDUCATION = '/src/assets/images/template_education_grading_1795680578102.jpg';

const SEED_CATEGORIES = [
  {
    name: 'Excel Templates',
    slug: 'excel',
    icon: 'FileSpreadsheet',
    description: 'เทมเพลต Excel สำเร็จรูป สูตรอัตโนมัติ ใช้งานได้ทันที ไม่ต้องเขียนโค้ด',
  },
  {
    name: 'Web App & Dashboard',
    slug: 'web-app',
    icon: 'LayoutDashboard',
    description: 'เว็บแอปจัดการธุรกิจและ Dashboard วิเคราะห์ผลแบบเรียลไทม์',
  },
  {
    name: 'VBA Automation',
    slug: 'vba',
    icon: 'Terminal',
    description: 'ไฟล์ Excel Macro & VBA กดปุ่มเดียวออกใบกำกับภาษี/สลิป/รายงานอัตโนมัติ',
  },
  {
    name: 'Google Sheets',
    slug: 'google-sheets',
    icon: 'TableProperties',
    description: 'สเปรดชีตออนไลน์ทำงานร่วมกันหลายคนแบบ Cloud Sync ดูผ่านมือถือได้',
  },
  {
    name: 'AppSheet No-Code',
    slug: 'appsheet',
    icon: 'Smartphone',
    description: 'แอปมือถือเชื่อม Google Sheets สำหรับบันทึกสต๊อก ขายหน้าร้าน และตรวจงาน',
  },
  {
    name: 'โจทย์คำนวณ & วิศวกรรม',
    slug: 'ai-solver',
    icon: 'Calculator',
    description: 'เครื่องมือคำนวณไฟฟ้า ฟิสิกส์ คณิต โครงสร้าง BOQ และ BOM อุตสาหกรรม',
  },
];

interface SeedProductDef {
  title: string;
  slug: string;
  price: number;
  level: 'free' | 'standard' | 'advanced';
  categorySlug: string;
  previewImage: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  downloadCount: number;
  ratingAvg: number;
  description: string;
  features: string[];
}

const SEED_PRODUCTS: SeedProductDef[] = [
  // ================= FREE (0 บาท) — 19 ไฟล์ =================
  {
    title: 'ตาราง Excel รายรับ-รายจ่ายรายเดือน',
    slug: 'free-monthly-income-expense',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    isFeatured: true,
    downloadCount: 412,
    ratingAvg: 4.9,
    description: 'บันทึกการเงินส่วนบุคคลและธุรกิจขนาดเล็ก สรุปยอดคงเหลืออัตโนมัติรายเดือน พร้อมกราฟวิเคราะห์สัดส่วนค่าใช้จ่าย',
    features: ['สรุปยอดรับ-จ่าย 12 เดือนอัตโนมัติ', 'กราฟเปรียบเทียบรายหมวดหมู่', 'รองรับ Excel 2016 ขึ้นไป และ Google Sheets'],
  },
  {
    title: 'คำนวณภาษีเงินได้บุคคลธรรมดา',
    slug: 'free-personal-income-tax',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 365,
    ratingAvg: 4.9,
    description: 'วางแผนภาษี ภ.ง.ด.90/91 คำนวณค่าลดหย่อนครบทุกหมวดหมู่ อัปเดตขั้นบันไดภาษีล่าสุด พร้อมเปรียบเทียบการลดหย่อน',
    features: ['คำนวณขั้นบันไดภาษีอัตโนมัติ', 'รองรับค่าลดหย่อน RMF/SSF/ประกัน', 'สรุปภาษีที่ต้องจ่ายหรือขอคืนทันที'],
  },
  {
    title: 'วางแผนเกษียณ + ดอกเบี้ยทบต้น',
    slug: 'free-retirement-compound-interest',
    price: 0,
    level: 'free',
    categorySlug: 'google-sheets',
    previewImage: IMG_HERO,
    downloadCount: 248,
    ratingAvg: 4.8,
    description: 'จำลองพอร์ตการออมและการลงทุนระยะยาว คำนวณเป้าหมายเงินเกษียณโดยคิดรวมอัตราเงินเฟ้อและผลตอบแทนทบต้น',
    features: ['จำลองเงินเฟ้อและอัตราผลตอบแทน', 'กราฟการเติบโตของเงินต้น 30 ปี', 'ปรับเป้าหมายรายเดือนได้แบบเรียลไทม์'],
  },
  {
    title: 'คำนวณผ่อนบ้าน/รถ/สินเชื่อ',
    slug: 'free-loan-amortization',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 289,
    ratingAvg: 4.9,
    description: 'ตารางผ่อนชำระแบบลดต้นลดดอก แสดงค่างวด เงินต้น ดอกเบี้ย และผลลัพธ์เมื่อโปะค่างวดเพิ่มรายเดือน',
    features: ['คำนวณลดต้นลดดอกแม่นยำ', 'จำลองการโปะปิดยอดเร็วขึ้นกี่ปี', 'เปรียบเทียบอัตราดอกเบี้ย 3 ธนาคาร'],
  },
  {
    title: 'Excel สต๊อกสินค้า ฉบับเริ่มต้น',
    slug: 'free-inventory-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_MANUFACTURING,
    downloadCount: 510,
    ratingAvg: 4.8,
    description: 'เริ่มต้นจัดการคลังสินค้าอย่างเป็นระบบ บันทึกรับเข้า-เบิกออก แจ้งเตือนสีแดงเมื่อสินค้าคงเหลือต่ำกว่าเกณฑ์',
    features: ['แจ้งเตือนจุดสั่งซื้อซ้ำ (Reorder Point)', 'สรุปจำนวนคงเหลือราย SKU', 'ใช้งานง่ายแม้ไม่เก่ง Excel'],
  },
  {
    title: 'สรุปวันลาพนักงาน ฉบับเริ่มต้น',
    slug: 'free-employee-leave-starter',
    price: 0,
    level: 'free',
    categorySlug: 'google-sheets',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 194,
    ratingAvg: 4.8,
    description: 'เก็บประวัติการลาป่วย ลากิจ ลาพักร้อน ของพนักงานในทีม สรุปวันลาคงเหลือรายบุคคลอัตโนมัติ',
    features: ['แยกลาป่วย ลากิจ พักร้อน', 'ปฏิทินภาพรวมวันลาทั้งปี', 'รองรับพนักงานสูงสุด 50 คน'],
  },
  {
    title: 'เช็คหนี้ทุกก้อน ฉบับเริ่มต้น',
    slug: 'free-debt-tracker-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 221,
    ratingAvg: 4.9,
    description: 'รวมรายการหนี้สินทั้งหมดไว้ในหน้าเดียว เห็นยอดคงเหลือ ดอกเบี้ย และวันครบกำหนดชำระชัดเจน',
    features: ['เรียงลำดับหนี้ตามอัตราดอกเบี้ย', 'เตือนวันครบกำหนดชำระ', 'คำนวณยอดชำระขั้นต่ำรวมต่อเดือน'],
  },
  {
    title: 'สรุปค่าผ่อนทั้งหมด ฉบับเริ่มต้น',
    slug: 'free-installment-summary-starter',
    price: 0,
    level: 'free',
    categorySlug: 'google-sheets',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 176,
    ratingAvg: 4.8,
    description: 'ติดตามรายการผ่อนสินค้า บัตรเครดิต 0% และสินเชื่อรายเดือน รู้ทันทีว่าเหลือกี่งวดจึงจะผ่อนหมด',
    features: ['นับงวดที่ผ่อนแล้วและงวดคงเหลือ', 'สรุปภาระผูกพันรายเดือนล่วงหน้า', 'เปิดดูและอัปเดตผ่านมือถือได้'],
  },
  {
    title: 'สรุปยอดขายหน้าร้านรายวัน ฉบับเริ่มต้น',
    slug: 'free-daily-pos-sales-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_POS_RETAIL,
    downloadCount: 342,
    ratingAvg: 4.9,
    description: 'ปิดยอดขายรายวันสำหรับร้านค้าปลีก คาเฟ่ และร้านอาหาร แยกเงินสด โอนเงิน พร้อมสรุปรายเดือน',
    features: ['แยกช่องทางรับเงิน เงินสด/PromptPay', 'คำนวณยอดขายเฉลี่ยต่อวัน', 'รองรับการกรอกข้อมูลภายใน 2 นาที'],
  },
  {
    title: 'ใบเสนอราคา ฉบับเริ่มต้น',
    slug: 'free-quotation-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 418,
    ratingAvg: 4.9,
    description: 'ฟอร์มใบเสนอราคาขนาด A4 สวยงามเป็นทางการ พร้อมคำนวณยอดรวม ส่วนลด และภาษีมูลค่าเพิ่ม 7% อัตโนมัติ',
    features: ['จัดหน้าพร้อมพิมพ์ A4 ทันที', 'ใส่โลโก้และเงื่อนไขบริษัทได้', 'แปลงยอดเงินเป็นตัวอักษรภาษาไทย BAHTTEXT'],
  },
  {
    title: 'บัญชีรายรับ-รายจ่ายร้านค้า ฉบับเริ่มต้น',
    slug: 'free-shop-ledger-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 295,
    ratingAvg: 4.8,
    description: 'สมุดบัญชีร้านค้าสำหรับ SME แยกต้นทุนสินค้า ค่าใช้จ่ายร้าน และกำไรเบื้องต้นอย่างเป็นระเบียบ',
    features: ['แยกหมวดต้นทุนขายและค่าใช้จ่าย', 'สรุปกระแสเงินสดรายสัปดาห์', 'พร้อมส่งต่อให้นักบัญชีตรวจสอบ'],
  },
  {
    title: 'ประเมินผลงานพนักงาน ฉบับเริ่มต้น',
    slug: 'free-employee-evaluation-starter',
    price: 0,
    level: 'free',
    categorySlug: 'google-sheets',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 162,
    ratingAvg: 4.8,
    description: 'แบบฟอร์มประเมิน KPI และพฤติกรรมการทำงานประจำปี พร้อมเกณฑ์คำนวณคะแนนรวมอัตโนมัติ',
    features: ['กำหนดค่าน้ำหนักแต่ละหัวข้อได้', 'ตัดเกรด A-F อัตโนมัติ', 'มีช่องบันทึกข้อเสนอแนะหัวหน้างาน'],
  },
  {
    title: 'ติดตามใบสั่งซื้อ (PO) ฉบับเริ่มต้น',
    slug: 'free-po-tracker-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_MANUFACTURING,
    downloadCount: 188,
    ratingAvg: 4.8,
    description: 'ติดตามสถานะการสั่งซื้อสินค้ากับซัพพลายเออร์ บันทึกวันส่งมอบ และสถานะการรับของครบถ้วน',
    features: ['สถานะ รอส่ง / ส่งบางส่วน / ครบแล้ว', 'สรุปยอดสั่งซื้อแยกตามผู้ขาย', 'ค้นหาเลข PO ได้อย่างรวดเร็ว'],
  },
  {
    title: 'หอพัก/ห้องเช่า ฉบับเริ่มต้น',
    slug: 'free-dormitory-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_DORMITORY,
    downloadCount: 274,
    ratingAvg: 4.9,
    description: 'คำนวณค่าเช่า ค่าน้ำ ค่าไฟ ตามมิเตอร์ และค่าส่วนกลางสำหรับหอพักขนาดเล็กและห้องเช่า',
    features: ['คำนวณหน่วยน้ำ-ไฟจากเลขมิเตอร์ล่าสุด', 'สรุปยอดชำระรายห้องใน 1 หน้า', 'ติดตามสถานะการจ่ายค่าเช่า'],
  },
  {
    title: 'คำนวณเงินเดือน + ประกันสังคม ฉบับเริ่มต้น',
    slug: 'free-payroll-sso-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 336,
    ratingAvg: 4.9,
    description: 'ตารางทำเงินเดือนพื้นฐาน คำนวณประกันสังคม 5% (เพดาน 750 บาท) และยอดสุทธิโอนจ่ายพนักงาน',
    features: ['หักประกันสังคมตามฐานค่าจ้างอัตโนมัติ', 'รองรับเบี้ยขยันและค่าล่วงเวลาเบื้องต้น', 'สรุปยอดโอนจ่ายทั้งองค์กร'],
  },
  {
    title: 'บันทึกคะแนน + ตัดเกรด ฉบับเริ่มต้น',
    slug: 'free-student-grading-starter',
    price: 0,
    level: 'free',
    categorySlug: 'google-sheets',
    previewImage: IMG_EDUCATION,
    downloadCount: 210,
    ratingAvg: 4.9,
    description: 'สำหรับครูและอาจารย์ บันทึกคะแนนเก็บ สอบกลางภาค ปลายภาค พร้อมตัดเกรด 0-4.00 อัตโนมัติ',
    features: ['ตัดเกรด 8 ระดับ (0 ถึง 4)', 'คำนวณค่าเฉลี่ยและสูงสุด-ต่ำสุดของห้อง', 'ใช้งานผ่าน Google Sheets ได้ทันที'],
  },
  {
    title: 'ออเดอร์แม่ค้าออนไลน์ ฉบับเริ่มต้น',
    slug: 'free-online-seller-orders-starter',
    price: 0,
    level: 'free',
    categorySlug: 'google-sheets',
    previewImage: IMG_ECOMMERCE,
    downloadCount: 389,
    ratingAvg: 4.9,
    description: 'จดออเดอร์ลูกค้าจาก Facebook, LINE, TikTok พร้อมเลขพัสดุและสถานะโอนเงิน/COD',
    features: ['แยกสถานะ โอนแล้ว / เก็บปลายทาง', 'บันทึกเลข Tracking พัสดุ', 'สรุปยอดขายและจำนวนกล่องต่อวัน'],
  },
  {
    title: 'คำนวณต้นทุนเมนูอาหาร ฉบับเริ่มต้น',
    slug: 'free-food-cost-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_FOODCOST,
    downloadCount: 315,
    ratingAvg: 4.9,
    description: 'คำนวณต้นทุนวัตถุดิบต่อจาน หาเปอร์เซ็นต์ Food Cost และแนะนำราคาขายเบื้องต้นสำหรับร้านอาหารและคาเฟ่',
    features: ['แปลงหน่วยกรัม/มิลลิลิตรเป็นต้นทุนต่อหน่วย', 'คำนวณ % Food Cost อัตโนมัติ', 'เปรียบเทียบกำไรต่อจาน'],
  },
  {
    title: 'ค่าจ้างพาร์ทไทม์รายชั่วโมง ฉบับเริ่มต้น',
    slug: 'free-parttime-wage-starter',
    price: 0,
    level: 'free',
    categorySlug: 'excel',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 168,
    ratingAvg: 4.8,
    description: 'คำนวณค่าแรงพนักงานพาร์ทไทม์จากเวลาเข้า-ออกงานรายวัน รวมชั่วโมงทำงานและยอดจ่ายสุทธิ',
    features: ['คำนวณชั่วโมงทำงานจากเวลาเข้า-ออก', 'สรุปค่าจ้างรายสัปดาห์/รายเดือน', 'ปรับอัตราค่าแรงรายบุคคลได้'],
  },

  // ================= มาตรฐาน (99 บาท) — 10 ไฟล์ =================
  {
    title: 'สรุปค่าผ่อนทั้งหมด (มือถือ/รถ/บ้าน/บัตรเครดิต)',
    slug: 'std-all-installment-manager',
    price: 99,
    level: 'standard',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    isFeatured: true,
    downloadCount: 184,
    ratingAvg: 4.9,
    description: 'ระบบบริหารจัดการภาระผ่อนชำระครบวงจร แสดง Timeline วันที่ผ่อนหมดแต่ละรายการ พร้อม Dashboard กระแสเงินสดรายเดือน',
    features: ['แยกหมวด บ้าน รถ บัตรเครดิต สินเชื่อ', 'กราฟภาระหนี้ลดลงรายเดือนใน 12 เดือนข้างหน้า', 'แจ้งเตือนงวดสุดท้ายและยอดปิดบัญชี'],
  },
  {
    title: 'แผนปลดหนี้หลายก้อน (Snowball vs Avalanche)',
    slug: 'std-debt-payoff-snowball-avalanche',
    price: 99,
    level: 'standard',
    categorySlug: 'excel',
    previewImage: IMG_HERO,
    isBestseller: true,
    downloadCount: 236,
    ratingAvg: 5.0,
    description: 'เปรียบเทียบกลยุทธ์ปลดหนี้ Snowball (ปิดก้อนเล็กก่อน) vs Avalanche (ปิดดอกเบี้ยสูงก่อน) เห็นส่วนต่างดอกเบี้ยที่ประหยัดได้ชัดเจน',
    features: ['เปรียบเทียบ 2 กลยุทธ์แบบ Side-by-Side', 'คำนวณวันที่เป็นไทจากหนี้ (Debt-Free Date)', 'จำลองงบโปะหนี้เพิ่มต่อเดือน'],
  },
  {
    title: 'บันทึกคะแนน + ตัดเกรดนักเรียนอัตโนมัติ',
    slug: 'std-student-grading-pro',
    price: 99,
    level: 'standard',
    categorySlug: 'google-sheets',
    previewImage: IMG_EDUCATION,
    downloadCount: 152,
    ratingAvg: 4.9,
    description: 'ระบบจัดการคะแนนสำหรับคุณครูยุคใหม่ ออกรายงานผลการเรียนรายบุคคล กราฟการกระจายเกรด และ Export PDF ส่งผู้ปกครองได้ทันที',
    features: ['กราฟสรุปสัดส่วนเกรดทั้งห้อง', 'ใบรายงานผลการเรียนรายคนพร้อมพิมพ์', 'แจ้งเตือนนักเรียนที่คะแนนต่ำกว่าเกณฑ์'],
  },
  {
    title: 'แผนงานโปรเจกต์ Gantt Chart',
    slug: 'std-project-gantt-chart',
    price: 99,
    level: 'standard',
    categorySlug: 'excel',
    previewImage: IMG_CONSTRUCTION_BOQ,
    isFeatured: true,
    downloadCount: 267,
    ratingAvg: 4.9,
    description: 'ตารางวางแผนโครงการแบบ Gantt Chart อัตโนมัติ แถบสีเปลี่ยนตาม % ความคืบหน้า รองรับทั้งมุมมองรายวันและรายสัปดาห์',
    features: ['แถบ Gantt วาดอัตโนมัติจากวันเริ่ม-สิ้นสุด', 'แสดงเส้น Today Line และ Milestone', 'ติดตามสถานะผู้รับผิดชอบแต่ละงาน'],
  },
  {
    title: 'วางแผนงานแต่ง: งบประมาณ + แขก + ซอง',
    slug: 'std-wedding-planner-complete',
    price: 99,
    level: 'standard',
    categorySlug: 'google-sheets',
    previewImage: IMG_GSHEETS_CLOUD,
    downloadCount: 145,
    ratingAvg: 5.0,
    description: 'คู่มือและระบบจัดการงานแต่งครบทุกขั้นตอน ตั้งงบเทียบจ่ายจริง เช็กลิสต์งาน 12 เดือน รายชื่อแขก-โต๊ะจีน และสรุปยอดซอง',
    features: ['เทียบงบประมาณตั้งไว้ vs จ่ายจริง', 'จัดการรายชื่อแขกและผังที่นั่ง', 'Checklist เตรียมงานตั้งแต่ 6 เดือนล่วงหน้า'],
  },
  {
    title: 'บันทึกทรัพย์สิน-หนี้สิน (Net Worth)',
    slug: 'std-net-worth-tracker',
    price: 99,
    level: 'standard',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 178,
    ratingAvg: 4.9,
    description: 'งบดุลส่วนบุคคลติดตามความมั่งคั่งสุทธิ (Net Worth) รวมเงินสด หุ้น กองทุน ทองคำ อสังหาฯ หักลบหนี้สินทุกประเภท',
    features: ['Dashboard สัดส่วนสินทรัพย์ 6 ประเภท', 'กราฟติดตาม Net Worth รายเดือนตลอดปี', 'คำนวณอัตราส่วนสภาพคล่องทางการเงิน'],
  },
  {
    title: 'ค่าจ้างพนักงานพาร์ทไทม์ + สลิป',
    slug: 'std-parttime-payroll-slip',
    price: 99,
    level: 'standard',
    categorySlug: 'vba',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 163,
    ratingAvg: 4.9,
    description: 'คิดค่าแรงพาร์ทไทม์รายชั่วโมง/รายกะ พร้อมปุ่มสร้างสลิปเงินเดือนรายคนแบบ A5 พิมพ์หรือส่งเป็นไฟล์ภาพทาง LINE ได้ทันที',
    features: ['คิดค่าแรงปกติ + OT + เบี้ยขยัน', 'สร้างสลิปเงินเดือนอัตโนมัติรายบุคคล', 'สรุปยอดจ่ายประจำงวดแยกตามแผนก'],
  },
  {
    title: 'เช็คชื่อนักเรียน ทั้งเทอม',
    slug: 'std-student-attendance-semester',
    price: 99,
    level: 'standard',
    categorySlug: 'google-sheets',
    previewImage: IMG_EDUCATION,
    downloadCount: 134,
    ratingAvg: 4.8,
    description: 'บันทึกการเข้าเรียน มา ขาด ลา สาย ตลอดภาคเรียน คำนวณ % เวลาเรียนและแจ้งเตือนสิทธิ์สอบอัตโนมัติ',
    features: ['คำนวณ % เวลาเข้าเรียนรายคนทันที', 'แจ้งเตือนสีแดงเมื่อเข้าเรียนต่ำกว่า 80%', 'รองรับการเช็คชื่อบนแท็บเล็ตในห้องเรียน'],
  },
  {
    title: 'ติดตามการส่งงานนักเรียน',
    slug: 'std-homework-submission-tracker',
    price: 99,
    level: 'standard',
    categorySlug: 'google-sheets',
    previewImage: IMG_GSHEETS_CLOUD,
    downloadCount: 121,
    ratingAvg: 4.9,
    description: 'ติดตามงานที่มอบหมายทั้งหมดของนักเรียน รู้ทันทีว่าใครค้างส่งงานชิ้นไหน พร้อมสรุปรายงานส่งรายสัปดาห์',
    features: ['ดูภาพรวมงานค้างส่งรายบุคคล', 'สถานะ ส่งแล้ว / ส่งช้า / ยังไม่ส่ง', 'คำนวณคะแนนส่งงานตรงเวลาอัตโนมัติ'],
  },
  {
    title: 'ประเมินคุณลักษณะอันพึงประสงค์ 8 ข้อ',
    slug: 'std-8-desirable-characteristics',
    price: 99,
    level: 'standard',
    categorySlug: 'excel',
    previewImage: IMG_EDUCATION,
    downloadCount: 118,
    ratingAvg: 4.9,
    description: 'แบบบันทึกและสรุปผลการประเมินคุณลักษณะอันพึงประสงค์ 8 ประการ ตามหลักสูตรแกนกลางฯ แปลงผลเป็น ดีเยี่ยม/ดี/ผ่าน อัตโนมัติ',
    features: ['ครบทั้ง 8 คุณลักษณะและตัวชี้วัด', 'สรุปผลรายบุคคลและสถิติระดับชั้น', 'จัดหน้าพิมพ์รายงาน ปพ. ได้ทันที'],
  },

  // ================= ขั้นสูง (199 บาท) — 20 ไฟล์ =================
  {
    title: 'Excel สต๊อกสินค้า รับเข้า-จ่ายออก-คงเหลือ',
    slug: 'adv-inventory-fifo-stock',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_MANUFACTURING,
    isFeatured: true,
    isBestseller: true,
    downloadCount: 485,
    ratingAvg: 5.0,
    description: 'ระบบคลังสินค้าระดับมืออาชีพ รองรับบาร์โค้ด สต๊อกการ์ดรายชิ้น สรุปมูลค่าสินค้าคงเหลือ และ Dashboard วิเคราะห์สินค้าขายดี/ค้างสต๊อก',
    features: ['สต๊อกการ์ดตรวจเช็กประวัติรับ-จ่ายย้อนหลัง', 'คำนวณต้นทุนเฉลี่ยถ่วงน้ำหนักอัตโนมัติ', 'กราฟ ABC Analysis แยกสินค้าทำกำไร'],
  },
  {
    title: 'คำนวณต้นทุนเมนูอาหาร + ตั้งราคาขาย',
    slug: 'adv-restaurant-food-cost-pricing',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_FOODCOST,
    isBestseller: true,
    downloadCount: 392,
    ratingAvg: 5.0,
    description: 'สูตรคำนวณต้นทุนร้านอาหารและเดลิเวอรี เผื่อค่า Yield วัตถุดิบ คิด GP แพลตฟอร์ม Grab/LINE MAN พร้อมตั้งราคาขายให้ได้กำไรตามเป้า',
    features: ['คำนวณ Yield สูญเสียระหว่างเตรียมวัตถุดิบ', 'ตั้งราคาหน้าร้าน vs ราคาเดลิเวอรี (หัก GP 30-35%)', 'คลังราคาวัตถุดิบกลาง อัปเดตครั้งเดียวเปลี่ยนทั้งเล่ม'],
  },
  {
    title: 'คำนวณเงินเดือน + ประกันสังคม + ภาษี + สลิป',
    slug: 'adv-payroll-tax-sso-payslip',
    price: 199,
    level: 'advanced',
    categorySlug: 'vba',
    previewImage: IMG_HR_PAYROLL,
    isFeatured: true,
    isBestseller: true,
    downloadCount: 441,
    ratingAvg: 5.0,
    description: 'ระบบ Payroll ครบวงจรสำหรับฝ่ายบุคคล SME คำนวณภาษีหัก ณ ที่จ่าย ภ.ง.ด.1 ประกันสังคม กองทุนสำรองเลี้ยงชีพ พร้อมออกสลิป PDF ทีเดียวทั้งบริษัท',
    features: ['คำนวณ ภ.ง.ด.1 รายเดือนอัตโนมัติ', 'ปุ่ม Macro Export สลิป PDF แยกรายพนักงาน', 'สรุปรายงานนำส่ง สปส.1-10'],
  },
  {
    title: 'ใบเสนอราคา/ใบแจ้งหนี้/ใบเสร็จ (VAT 7%)',
    slug: 'adv-billing-qt-inv-rec-vat7',
    price: 199,
    level: 'advanced',
    categorySlug: 'vba',
    previewImage: IMG_VBA_STANDARD,
    isFeatured: true,
    downloadCount: 378,
    ratingAvg: 4.9,
    description: 'ระบบออกเอกสารการค้าครบชุด ตั้งแต่ QT → INV → REC เชื่อมฐานข้อมูลลูกค้าและสินค้า กดบันทึกประวัติและ Export PDF ในคลิกเดียว',
    features: ['ดึงข้อมูลจากใบเสนอราคาไปออกใบแจ้งหนี้ได้ทันที', 'รองรับ VAT 7% (แยกนอก/รวมใน) และหัก ณ ที่จ่าย 3%', 'เก็บฐานข้อมูลประวัติเอกสารย้อนหลัง'],
  },
  {
    title: 'Excel POS ตัดสต๊อกอัตโนมัติ',
    slug: 'adv-excel-pos-auto-stock',
    price: 199,
    level: 'advanced',
    categorySlug: 'vba',
    previewImage: IMG_POS_RETAIL,
    isBestseller: true,
    downloadCount: 356,
    ratingAvg: 4.9,
    description: 'เปลี่ยน Excel เป็นเครื่อง POS ขายหน้าร้าน รองรับเครื่องสแกนบาร์โค้ด พิมพ์ใบเสร็จอย่างย่อ และตัดสต๊อกสินค้าทันทีที่กดชำระเงิน',
    features: ['รองรับการยิงบาร์โค้ด USB', 'ตัดสต๊อกสินค้าและบันทึกประวัติขายอัตโนมัติ', 'Dashboard สรุปยอดขายรายกะ/รายวัน'],
  },
  {
    title: 'ใบสั่งซื้อ (PO) + ติดตามของค้างรับ',
    slug: 'adv-po-backorder-management',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_MANUFACTURING,
    downloadCount: 214,
    ratingAvg: 4.9,
    description: 'ระบบจัดซื้อครบวงจร ออกใบ PO อนุมัติสั่งซื้อ ติดตามการส่งของแบบทยอยรับ (Partial Delivery) และแจ้งเตือนรายการค้างส่งเกินกำหนด',
    features: ['ติดตามยอดสั่งซื้อเทียบยอดรับจริง (Backorder)', 'ฐานข้อมูล Supplier และประวัติราคาซื้อ', 'แจ้งเตือน PO เกินกำหนดส่งมอบ'],
  },
  {
    title: 'ใบกำกับภาษีเต็มรูป + รันเลข + ภ.พ.30',
    slug: 'adv-tax-invoice-pp30-system',
    price: 199,
    level: 'advanced',
    categorySlug: 'vba',
    previewImage: IMG_VBA_STANDARD,
    downloadCount: 329,
    ratingAvg: 5.0,
    description: 'ออกใบกำกับภาษีเต็มรูปแบบมาตรฐานกรมสรรพากร รันเลขที่เอกสารอัตโนมัติ พร้อมดึงข้อมูลลงรายงานภาษีขายเพื่อยื่น ภ.พ.30',
    features: ['รันเลขที่ใบกำกับภาษีต่อเนื่องไม่ซ้ำ', 'สร้างรายงานภาษีซื้อ-ภาษีขายอัตโนมัติ', 'รองรับทั้งสำนักงานใหญ่และสาขา'],
  },
  {
    title: 'บัญชีรายรับ-รายจ่ายร้าน + งบกำไรขาดทุน',
    slug: 'adv-shop-accounting-pnl',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 312,
    ratingAvg: 4.9,
    description: 'ระบบบัญชีธุรกิจ SME แยกผังบัญชีรายรับ-ต้นทุน-ค่าใช้จ่ายดำเนินงาน สร้างงบกำไรขาดทุน (P&L) รายเดือนและรายปีอัตโนมัติ',
    features: ['งบกำไรขาดทุนเปรียบเทียบ 12 เดือน', 'Dashboard วิเคราะห์ Gross Margin & Net Profit', 'รองรับหลายบัญชีธนาคารและเงินสดย่อย'],
  },
  {
    title: 'ออเดอร์แม่ค้าออนไลน์ + กำไรสุทธิ',
    slug: 'adv-online-seller-net-profit',
    price: 199,
    level: 'advanced',
    categorySlug: 'google-sheets',
    previewImage: IMG_ECOMMERCE,
    isBestseller: true,
    downloadCount: 404,
    ratingAvg: 5.0,
    description: 'จัดการออเดอร์ร้านค้าออนไลน์ Shopee/Lazada/TikTok/เพจ คำนวณค่าธรรมเนียม ค่าแพ็ค ค่าแอดโฆษณา จนได้กำไรสุทธิที่แท้จริง',
    features: ['หักค่าธรรมเนียมแพลตฟอร์มและค่าแอดอัตโนมัติ', 'รายงานยอดขายแยกตามช่องทางขาย', 'ตัดสต๊อกและสรุปยอด COD รอโอน'],
  },
  {
    title: 'ลูกหนี้/เจ้าหนี้ + อายุหนี้',
    slug: 'adv-ar-ap-aging-report',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_ACCOUNTING,
    downloadCount: 196,
    ratingAvg: 4.9,
    description: 'วิเคราะห์อายุลูกหนี้การค้าและเจ้าหนี้การค้า (Aging Report: 0-30, 31-60, 61-90, >90 วัน) ช่วยวางแผนกระแสเงินสดไม่ให้สะดุด',
    features: ['จำแนกอายุหนี้อัตโนมัติ 4 ช่วงเวลา', 'แจ้งเตือนบิลใกล้ครบกำหนดเครดิตเทอม', 'สรุปยอดวางบิลและยอดรับชำระ'],
  },
  {
    title: 'หอพัก/ห้องเช่า + ใบแจ้งหนี้',
    slug: 'adv-dormitory-invoice-pro',
    price: 199,
    level: 'advanced',
    categorySlug: 'vba',
    previewImage: IMG_DORMITORY,
    downloadCount: 287,
    ratingAvg: 4.9,
    description: 'บริหารอพาร์ตเมนต์และหอพักครบวงจร จดมิเตอร์น้ำ-ไฟ ออกใบแจ้งหนี้/ใบเสร็จรับเงินรายห้อง พร้อมประวัติผู้เช่าและสัญญา',
    features: ['พิมพ์ใบแจ้งหนี้ทุกห้องในคลิกเดียว', 'คำนวณค่าน้ำ-ไฟแบบขั้นต่ำหรือเหมาจ่ายได้', 'Dashboard อัตราการเข้าพักและรายได้รวม'],
  },
  {
    title: 'บันทึกวันลา + สิทธิ์คงเหลือ',
    slug: 'adv-hr-leave-entitlement',
    price: 199,
    level: 'advanced',
    categorySlug: 'google-sheets',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 175,
    ratingAvg: 4.9,
    description: 'ระบบบริหารวันลาพนักงานคำนวณสิทธิ์วันลาพักร้อนตามอายุงานอัตโนมัติ แจ้งเตือนเมื่อใช้สิทธิ์เกิน และมีปฏิทินวันหยุดทีม',
    features: ['คำนวณสิทธิ์พักร้อนตามอายุงานอัตโนมัติ', 'ดูวันลาคงเหลือรายคนแบบ Real-time', 'เชื่อมข้อมูลเพื่อหักค่าจ้างลาเกินสิทธิ์ได้'],
  },
  {
    title: 'KPI + สมรรถนะ → เกรด/โบนัส',
    slug: 'adv-kpi-competency-bonus',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 229,
    ratingAvg: 5.0,
    description: 'ระบบประเมินผลประจำปี HR เชื่อมคะแนน KPI และ Competency เพื่อจัดเกรดพนักงานและคำนวณงบโบนัส/ปรับเงินเดือนตาม Bell Curve',
    features: ['คำนวณคะแนนถ่วงน้ำหนัก KPI + Competency', 'จัดสรรโบนัสตามเกรดและงบประมาณบริษัท', 'กราฟ Bell Curve เทียบมาตรฐานองค์กร'],
  },
  {
    title: 'ยอดขายเทียบเป้า + ค่าคอมมิชชั่น',
    slug: 'adv-sales-target-commission',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_POS_RETAIL,
    downloadCount: 254,
    ratingAvg: 4.9,
    description: 'ติดตามผลงานทีมขายเทียบเป้า (Target vs Actual) คำนวณค่าคอมมิชชั่นแบบขั้นบันไดและโบนัสทีมอัตโนมัติ',
    features: ['คำนวณคอมมิชชั่นแบบ Tier ขั้นบันได', 'Leaderboard จัดอันดับพนักงานขาย', 'Dashboard รายบุคคลและรายทีม'],
  },
  {
    title: 'XLOOKUP ราคาส่ง + ค่าส่ง',
    slug: 'adv-xlookup-wholesale-shipping',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_MANUFACTURING,
    downloadCount: 164,
    ratingAvg: 4.9,
    description: 'ระบบคิดราคาขายส่งอัตโนมัติตามจำนวนสั่งซื้อ (Tier Pricing) พร้อมคำนวณค่าขนส่งตามน้ำหนักและโซนพื้นที่ด้วย XLOOKUP',
    features: ['ราคาส่งปรับอัตโนมัติตามช่วงจำนวน', 'ตารางคำนวณค่าส่งตามน้ำหนัก/จังหวัด', 'สร้างใบเสนอราคาส่งออกลูกค้าทันที'],
  },
  {
    title: 'ใบขอซื้อ (PR) + อนุมัติตามวงเงิน',
    slug: 'adv-pr-approval-workflow',
    price: 199,
    level: 'advanced',
    categorySlug: 'appsheet',
    previewImage: IMG_APPSHEET_MOBILE,
    downloadCount: 149,
    ratingAvg: 4.9,
    description: 'ระบบใบขอซื้อ (Purchase Requisition) กำหนดลำดับขั้นผู้อนุมัติตามวงเงินอัตโนมัติ ตรวจสอบงบประมาณคงเหลือก่อนสั่งซื้อ',
    features: ['กำหนดสายอนุมัติตามวงเงินงบประมาณ', 'เชื่อมโยง PR สู่ใบสั่งซื้อ PO ได้', 'รองรับการใช้งานผ่าน AppSheet มือถือ'],
  },
  {
    title: 'BOQ งานก่อสร้าง + ติดตามต้นทุน',
    slug: 'adv-construction-boq-cost',
    price: 199,
    level: 'advanced',
    categorySlug: 'ai-solver',
    previewImage: IMG_CONSTRUCTION_BOQ,
    isFeatured: true,
    downloadCount: 308,
    ratingAvg: 5.0,
    description: 'เทมเพลตถอดปริมาณวัสดุและประเมินราคางานก่อสร้าง (BOQ) แยกค่าวัสดุ ค่าแรง ค่าดำเนินการ พร้อมเปรียบเทียบงบประเมินกับจ่ายจริงหน้างาน',
    features: ['หมวดงานมาตรฐานครบ (โครงสร้าง สถาปัตย์ ระบบ)', 'เทียบราคากลาง BOQ กับต้นทุนจ่ายจริง (Cost Control)', 'สรุปกำไรขาดทุนรายโครงการ'],
  },
  {
    title: 'ลงเวลาทำงาน + OT 1.5/2/3 เท่า',
    slug: 'adv-timekeeping-ot-15-2-3',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 271,
    ratingAvg: 4.9,
    description: 'นำเข้าข้อมูลสแกนนิ้วหรือบันทึกเวลาเข้า-ออก คำนวณมาสาย ขาดงาน และค่าล่วงเวลา OT 1.5x, 2x, 3x ตามกฎหมายแรงงานไทยเป๊ะ',
    features: ['แยก OT วันทำงาน 1.5x และวันหยุด 2x/3x', 'หักเวลาพักและคิดนาทีมาสายอัตโนมัติ', 'เชื่อมต่อไปยังตารางเงินเดือนได้ทันที'],
  },
  {
    title: 'กองทุนสงเคราะห์ลูกจ้าง',
    slug: 'adv-employee-welfare-fund',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 132,
    ratingAvg: 4.9,
    description: 'คำนวณเงินสะสมและเงินสมทบกองทุนสงเคราะห์ลูกจ้างตามกฎหมายใหม่ จัดการบัญชีรายคนและยอดรวมนำส่งรายเดือน',
    features: ['ตั้งค่าอัตราสมทบ 0.25% - 0.5% ตามเกณฑ์', 'สรุปรายงานนำส่งประจำเดือน', 'ตรวจสอบยอดสะสมรายบุคคลย้อนหลัง'],
  },
  {
    title: 'กองทุนสำรองเลี้ยงชีพ',
    slug: 'adv-provident-fund-pvd',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 147,
    ratingAvg: 4.9,
    description: 'บริหารกองทุนสำรองเลี้ยงชีพ (PVD) รองรับอัตราเงินสะสมแบบขั้นบันไดตามอายุงาน คำนวณส่วนแบ่งนายจ้างตามเงื่อนไขการลาออก',
    features: ['กำหนด % เงินสะสมและสมทบแยกตามอายุงาน', 'คำนวณสิทธิ์ได้รับเงินสมทบนายจ้าง (Vesting)', 'สรุปไฟล์นำส่งบริษัทจัดการกองทุน'],
  },

  // ================= หมวดใหม่ Proposed Products — 10 หัวข้อ =================
  {
    title: 'Excel คำนวณต้นทุนการผลิต + Yield + Scrap',
    slug: 'pro-manufacturing-cost-yield-scrap',
    price: 299,
    level: 'advanced',
    categorySlug: 'ai-solver',
    previewImage: IMG_MANUFACTURING,
    isFeatured: true,
    isBestseller: true,
    downloadCount: 186,
    ratingAvg: 5.0,
    description: 'ระบบคำนวณต้นทุนโรงงานอุตสาหกรรม คิดต้นทุนวัตถุดิบ ค่าแรงทางตรง โสหุ้ยการผลิต พร้อมวิเคราะห์ % Yield และมูลค่าของเสีย (Scrap)',
    features: ['คำนวณต้นทุนต่อหน่วยจริงรวม Yield & Scrap', 'วิเคราะห์ Variance ต้นทุนมาตรฐาน vs ต้นทุนจริง', 'Dashboard ติดตามประสิทธิภาพไลน์ผลิต'],
  },
  {
    title: 'Excel วางแผนการผลิต Production Planning',
    slug: 'pro-production-planning-mrp',
    price: 249,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_MANUFACTURING,
    downloadCount: 162,
    ratingAvg: 4.9,
    description: 'วางแผนกำลังการผลิต (Capacity Planning) และตารางผลิตประจำสัปดาห์เทียบคำสั่งซื้อลูกค้า ป้องกันปัญหาคอขวดและส่งมอบล่าช้า',
    features: ['คำนวณ Load ชั่วโมงเครื่องจักรเทียบกำลังผลิต', 'ตารางจัดคิวงานผลิตแบบ Visual Timeline', 'ติดตาม % การผลิตได้ตามแผน (Plan vs Actual)'],
  },
  {
    title: 'Excel ควบคุมวัตถุดิบ + เบิกจ่ายตาม BOM',
    slug: 'pro-raw-material-bom-control',
    price: 249,
    level: 'advanced',
    categorySlug: 'ai-solver',
    previewImage: IMG_MANUFACTURING,
    isFeatured: true,
    downloadCount: 194,
    ratingAvg: 5.0,
    description: 'ผูกสูตร Bill of Materials (BOM) หลายระดับ แค่กรอกจำนวนสินค้าที่จะผลิต ระบบคำนวณยอดเบิกวัตถุดิบและเช็กสต๊อกคงเหลือให้อัตโนมัติ',
    features: ['ระเบิดสูตร BOM (BOM Explosion) ทันที', 'เช็กวัตถุดิบขาดแคลนก่อนเปิดใบสั่งผลิต', 'ตัดสต๊อกวัตถุดิบตามใบเบิกผลิต'],
  },
  {
    title: 'Excel คำนวณต้นทุน OT รายแผนก',
    slug: 'pro-department-ot-cost-analysis',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 141,
    ratingAvg: 4.9,
    description: 'วิเคราะห์งบค่าล่วงเวลา (OT) แยกรายแผนกและรายกะ เทียบงบประมาณที่ตั้งไว้ เพื่อควบคุมต้นทุนแรงงานส่วนเกินอย่างแม่นยำ',
    features: ['Dashboard เปรียบเทียบค่า OT รายแผนก', 'วิเคราะห์สาเหตุการทำ OT และช่วงเวลาพีค', 'แจ้งเตือนแผนกที่ใช้งบ OT เกิน 80%'],
  },
  {
    title: 'Excel ตรวจสอบการขาด ลา มาสาย รายวัน',
    slug: 'pro-daily-attendance-monitor',
    price: 199,
    level: 'advanced',
    categorySlug: 'google-sheets',
    previewImage: IMG_HR_PAYROLL,
    downloadCount: 158,
    ratingAvg: 4.9,
    description: 'ติดตามสถิติการมาทำงานรายวันทั้งองค์กร สรุปอัตราการขาดงาน (Absenteeism Rate) และอันดับการมาสายรายเดือนสำหรับ HR',
    features: ['Heatmap แสดงวันที่มีสถิติขาดลามาสายสูง', 'คำนวณเบี้ยขยันรายเดือนอัตโนมัติ', 'รายงานสรุปส่งผู้บริหารรายสัปดาห์'],
  },
  {
    title: 'Excel เปรียบเทียบราคาซัพพลายเออร์',
    slug: 'pro-supplier-price-comparison',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_MANUFACTURING,
    downloadCount: 173,
    ratingAvg: 4.9,
    description: 'ตารางเทียบใบเสนอราคาผู้ขาย 3-5 รายพร้อมกัน คำนวณคะแนนด้านราคา เครดิตเทอม ระยะเวลาจัดส่ง และแนะนำผู้ชนะการประมูลทันที',
    features: ['เปรียบเทียบราคาต่อหน่วยและเงื่อนไขการชำระ', 'ระบบให้คะแนน Weighted Scoring Model', 'เก็บประวัติราคาซื้อที่ดีที่สุดย้อนหลัง'],
  },
  {
    title: 'Excel ควบคุมเครื่องมือและทรัพย์สินบริษัท',
    slug: 'pro-company-asset-tool-registry',
    price: 199,
    level: 'advanced',
    categorySlug: 'appsheet',
    previewImage: IMG_APPSHEET_MOBILE,
    downloadCount: 137,
    ratingAvg: 4.9,
    description: 'ทะเบียนทรัพย์สินและเครื่องมือช่าง ติดตามผู้เบิกใช้งาน วันส่งคืน รอบซ่อมบำรุง และคำนวณค่าเสื่อมราคาทางบัญชีอัตโนมัติ',
    features: ['ระบบยืม-คืนเครื่องมือพร้อมผู้รับผิดชอบ', 'คำนวณค่าเสื่อมราคาทรัพย์สินรายปี', 'รองรับรหัสทรัพย์สินและ QR Tag'],
  },
  {
    title: 'Excel Dashboard วิเคราะห์ยอดขายและกำไร',
    slug: 'pro-executive-sales-profit-dashboard',
    price: 299,
    level: 'advanced',
    categorySlug: 'web-app',
    previewImage: IMG_ERP_SAAS,
    isFeatured: true,
    isBestseller: true,
    downloadCount: 318,
    ratingAvg: 5.0,
    description: 'Executive Dashboard ระดับผู้บริหาร วิเคราะห์แนวโน้มยอดขาย กำไรขั้นต้น ลูกค้า Top 20% และสินค้าทำเงินในหน้าจอเดียว',
    features: ['Slicer กรองข้อมูลตามปี เดือน ภูมิภาค และทีมขาย', 'กราฟ Waterfall แสดงโครงสร้างรายได้สู่กำไรสุทธิ', 'เปรียบเทียบ YoY และ MoM อัตโนมัติ'],
  },
  {
    title: 'Excel ควบคุมรถบริษัท น้ำมัน ค่าซ่อม',
    slug: 'pro-fleet-fuel-maintenance-control',
    price: 199,
    level: 'advanced',
    categorySlug: 'excel',
    previewImage: IMG_LOGISTICS_FLEET,
    downloadCount: 151,
    ratingAvg: 4.9,
    description: 'บริหารจัดการยานพาหนะบริษัท บันทึกเลขไมล์ อัตราสิ้นเปลืองน้ำมัน (กม./ลิตร) ค่าซ่อมบำรุง ต่อ พ.ร.บ. และประกันภัย',
    features: ['คำนวณอัตราสิ้นเปลืองน้ำมันผิดปกติอัตโนมัติ', 'แจ้งเตือนวันหมดอายุประกัน/ภาษี/เช็กกิโล', 'สรุปต้นทุนค่าใช้จ่ายต่อคันรายเดือน'],
  },
  {
    title: 'Excel คำนวณต้นทุนขนส่งต่อเที่ยว',
    slug: 'pro-logistics-cost-per-trip',
    price: 199,
    level: 'advanced',
    categorySlug: 'ai-solver',
    previewImage: IMG_LOGISTICS_FLEET,
    downloadCount: 169,
    ratingAvg: 4.9,
    description: 'คำนวณต้นทุนโลจิสติกส์และค่าขนส่งต่อเที่ยว/ต่อกิโลเมตร/ต่อชิ้น รวมค่าน้ำมัน ค่าทางด่วน เบี้ยเลี้ยงคนขับ และค่าเสื่อมรถ',
    features: ['คำนวณจุดคุ้มทุนต่อเที่ยววิ่ง (Break-even)', 'เทียบต้นทุนรถบริษัท vs จ้างรถร่วมขนส่ง', 'ตั้งราคาค่าบริการขนส่งพร้อมอัตรากำไร'],
  },
];

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
      .update(paymentsSettings)
      .set({
        configJson: JSON.stringify({
          promptpayId: '0819998888',
          accountName: 'กดแล้วจบ (Kodraewjob Digital Marketplace)',
          qrImageUrl: '/assets/aistudio/Untitled_e84a513c.jpg',
        }),
      })
      .where(eq(paymentsSettings.provider, 'promptpay'));
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
      const inserted = await db.insert(categories).values(cat).returning();
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
        downloadCount: item.downloadCount,
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
}
