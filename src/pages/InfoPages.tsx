import React, { useState } from 'react';
import {
  ArrowRight,
  Atom,
  BookOpen,
  Building,
  Check,
  Layers,
  Mail,
  MessageCircle,
  Sigma,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const BRAND_LOGO =
  '/assets/aistudio/810624000_983971044712451_6466500635178443708_n_81f9a476.jpg';
const LINE_QR = '/assets/aistudio/L_556fsrdw_GW_6a59b22f.png';

export function SolutionsPage() {
  const { navigate } = useApp();

  const solutions = [
    {
      title: 'โซลูชันวิศวกรรมไฟฟ้า (Electrical)',
      desc: 'คำนวณโหลด 3 เฟส กฎของโอห์ม ขนาดสายไฟ เบรกเกอร์ และ Power Factor ด้วย AI Solver และสูตร Excel สำเร็จรูป',
      icon: Zap,
      action: () => navigate('/solve'),
      cta: 'เปิดเครื่องมือคำนวณไฟฟ้า',
    },
    {
      title: 'โซลูชันฟิสิกส์ & กลศาสตร์ (Physics)',
      desc: 'วิเคราะห์แรง งาน พลังงาน โมเมนตัม และคลื่น พร้อมแสดงวิธีทำทีละขั้นตอนสำหรับวิศวกรและนักเรียน',
      icon: Atom,
      action: () => navigate('/solve'),
      cta: 'เปิดเครื่องมือคำนวณฟิสิกส์',
    },
    {
      title: 'โซลูชันคณิตศาสตร์ธุรกิจ (Math & Optimization)',
      desc: 'แก้สมการ หาจุดคุ้มทุน Break-even และฟังก์ชันต้นทุนต่ำสุดพร้อมสูตร Excel ที่นำไปต่อยอดได้ทันที',
      icon: Sigma,
      action: () => navigate('/solve'),
      cta: 'เปิดเครื่องมือคำนวณคณิต',
    },
    {
      title: 'โซลูชันวิศวกรรมโครงสร้าง & BOQ',
      desc: 'คำนวณแรงเฉือน โมเมนต์ดัดคาน เสา และถอดปริมาณ BOQ งานก่อสร้างเทียบงบประเมินกับต้นทุนจริง',
      icon: Building,
      action: () => navigate('/templates/adv-construction-boq-cost'),
      cta: 'ดูเทมเพลต BOQ ก่อสร้าง',
    },
    {
      title: 'โซลูชัน BOM & ต้นทุนการผลิตโรงงาน',
      desc: 'ระเบิดสูตร Bill of Materials (BOM) คำนวณ Yield, Scrap และวางแผนกำลังการผลิต Production Planning',
      icon: Layers,
      action: () => navigate('/templates/pro-raw-material-bom-control'),
      cta: 'ดูเทมเพลต BOM โรงงาน',
    },
    {
      title: 'AppSheet No-Code โจทย์คำนวณ & วิศวกรรม',
      desc: 'แอปมือถือ/แท็บเล็ตเชื่อม Google Sheets สำหรับใบขอซื้อ PR ตรวจเช็กทรัพย์สิน QR และงานวิศวกรรมภาคสนาม',
      icon: Sparkles,
      action: () => navigate('/category/appsheet'),
      cta: 'ดูตัวอย่าง AppSheet No-Code',
    },
    {
      title: 'Web App SaaS ERP 20 ระบบครบวงจร',
      desc: 'ทดลองใช้งานระบบบริหารธุรกิจออนไลน์ 20 ระบบ ลงทะเบียนบริษัท อัปโหลดโลโก้ พิมพ์ใบเสร็จ/ใบกำกับภาษี/สลิป',
      icon: Building,
      action: () => navigate('/webapp'),
      cta: 'เปิดใช้งาน Web App ERP 20 ระบบ',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl">
        <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
          Industry &amp; Engineering Solutions
        </p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#1E1B18] dark:text-orange-50 mt-2">
          โซลูชันเฉพาะทาง: ไฟฟ้า · ฟิสิกส์ · คณิต · โครงสร้าง · BOM
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
          ผสานความแม่นยำของเทมเพลต Excel ระดับอุตสาหกรรมเข้ากับ AI Solver สำหรับงานวิศวกรรมและการผลิต
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                  {s.title}
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                  {s.desc}
                </p>
              </div>
              <button
                onClick={s.action}
                className="mt-6 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1.5"
              >
                {s.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PricingPage() {
  const { navigate } = useApp();
  const [partTab, setPartTab] = useState<'all' | 'excel' | 'webapp'>('all');

  const excelPackages = [
    {
      tier: 'FREE',
      subtitle: 'ทดลองใช้งาน / ผู้เริ่มต้น',
      price: '฿0',
      unit: 'ฟรีตลอดชีพ',
      previewImage: '/src/assets/images/template_accounting_pos_1795676831169.jpg',
      desc: 'เหมาะสำหรับผู้ที่ต้องการทดลองใช้ Template ก่อนตัดสินใจซื้อ หรือใช้ในงานส่วนตัว/ร้านค้าขนาดเล็ก',
      rights: [
        'ดาวน์โหลด Excel Template ฟรี',
        'ใช้งานได้ทันทีหลังล็อกอิน Gmail / LINE',
        'สูตรคำนวณพื้นฐานแม่นยำ',
        'คู่มือการใช้งานเบื้องต้น',
        'เหมาะสำหรับ Personal / Small Business',
      ],
      examples: [
        'รายรับ-รายจ่าย',
        'Stock Starter',
        'Leave Starter',
        'Payroll Starter',
        'Quotation Starter',
        'Grade Starter',
      ],
      level: 'free',
      cta: 'ดาวน์โหลดไฟล์ฟรี',
      featured: false,
    },
    {
      tier: 'STANDARD',
      subtitle: 'งานทั่วไป / ธุรกิจขนาดเล็ก',
      price: '฿99',
      unit: 'จ่ายครั้งเดียวจบ',
      previewImage: '/src/assets/images/template_education_grading_1795680578102.jpg',
      desc: 'เหมาะสำหรับผู้ใช้งานทั่วไปที่ต้องการ Template ที่มีระบบมากขึ้น พร้อม Dashboard และตัวช่วยกรองข้อมูล',
      rights: [
        'Excel Template แบบพร้อมใช้งานทันที',
        'สูตรคำนวณอัตโนมัติ & Summary สรุปผล',
        'Dashboard กราฟวิเคราะห์ภาพรวม',
        'ระบบ Search / Filter & จัดหน้าพร้อม Print',
        'รองรับ Excel 2019 ขึ้นไป + คู่มือการใช้งาน',
      ],
      examples: ['ร้านค้าทั่วไป', 'พนักงานบริษัท', 'Freelance', 'ครู / นักเรียน', 'ธุรกิจขนาดเล็ก'],
      level: 'standard',
      cta: 'เลือกดูแพ็กเกจ 99 บาท',
      featured: false,
    },
    {
      tier: 'ADVANCED',
      subtitle: 'ระบบงานธุรกิจแบบเต็มระบบ',
      price: '฿199',
      unit: 'เริ่มต้น ฿199 (โรงงานเฉพาะทางถึง ฿299)',
      previewImage: '/src/assets/images/vba_automation_excel_1795679554655.jpg',
      desc: 'เหมาะสำหรับธุรกิจ SME ที่ต้องการระบบงานจริงจัง ครบวงจรทั้งเอกสาร การคำนวณ และความปลอดภัยของสูตร',
      rights: [
        'ระบบเต็มรูปแบบ + Master Data แยกฐานข้อมูล',
        'Automatic Calculation & Formula Automation',
        'Search / Filter / Report / Print / PDF / Excel Export',
        'Data Validation & Protection ป้องกันสูตรเสีย',
        'คู่มือใช้งานละเอียด + อัปเดตเวอร์ชันตามกฎหมาย',
      ],
      examples: ['SME', 'HR / บุคคล', 'Accounting', 'Sales / POS', 'Warehouse', 'Purchasing', 'Restaurant', 'Online Seller', 'Factory'],
      level: 'advanced',
      cta: 'เลือกดูระบบขั้นสูง 199฿',
      featured: true,
    },
  ];

  const webAppPlans = [
    {
      code: 'basic',
      name: 'BASIC',
      badge: 'เริ่มต้นใช้งานจริง',
      price: '250',
      cycle: '/ เดือน',
      storage: '30 MB',
      users: '1 User Account',
      records: '99 Data Records',
      features: ['Dashboard สรุปภาพรวม', 'Report & พิมพ์ A4 / 80mm', 'Export Excel / CSV', 'Backup & Restore', 'Support มาตรฐาน'],
      popular: false,
    },
    {
      code: 'standard',
      name: 'STANDARD',
      badge: 'ธุรกิจกำลังเติบโต',
      price: '350',
      cycle: '/ เดือน',
      storage: '35 MB',
      users: '2 User Accounts',
      records: '199 Data Records',
      features: ['Multi User 2 บัญชีผู้ใช้', 'Dashboard & Report ครบชุด', 'POS ตัดสต๊อก & ลงบัญชีอัตโนมัติ', 'Export Excel / Backup', 'Support มาตรฐานรวดเร็ว'],
      popular: false,
    },
    {
      code: 'professional',
      name: 'PROFESSIONAL',
      badge: '🔥 แพ็กเกจยอดนิยม',
      price: '550',
      cycle: '/ เดือน',
      storage: '50 MB',
      users: '5 User Accounts',
      records: '600 Data Records',
      features: ['Multi User 5 บัญชีผู้ใช้', 'กำหนด Role & Permission แยกแผนก', 'Dashboard & รายงานครบ 20 ระบบ', 'PO รับเข้าคลัง & สลิปเงินเดือนอัตโนมัติ', 'Priority Support กลุ่ม LINE'],
      popular: true,
    },
    {
      code: 'business',
      name: 'BUSINESS',
      badge: 'SME เต็มรูปแบบ',
      price: '990',
      cycle: '/ เดือน',
      storage: '100 MB',
      users: '10 User Accounts',
      records: '3,000 Data Records',
      features: ['Multi User 10 บัญชีผู้ใช้', 'Permission ละเอียดระดับฝ่าย', 'Advanced Report & KPI กำไรขาดทุน', 'BOM โรงงาน / ขนส่ง / Multi-Branch', 'Priority Support ทีมพัฒนา'],
      popular: false,
    },
    {
      code: 'enterprise',
      name: 'ENTERPRISE',
      badge: 'องค์กรขนาดใหญ่',
      price: '1,500',
      cycle: '/ เดือน',
      storage: '500 MB',
      users: 'Unlimited Users',
      records: '15,000 Data Records',
      features: ['User Management ไม่จำกัดผู้ใช้งาน', 'Role & Permission ระดับองค์กร', 'Advanced Report + SQL Schema Export', 'API Integration พร้อมเชื่อมต่อ', 'Dedicated Support'],
      popular: false,
    },
    {
      code: 'enterprise_yearly',
      name: 'ENTERPRISE YEARLY',
      badge: '👑 Unlimited Package',
      price: '19,000',
      cycle: '/ ปี',
      storage: 'Unlimited Storage',
      users: 'Unlimited Users',
      records: 'Unlimited Records',
      features: ['Storage Unlimited ไม่จำกัดพื้นที่', 'User & Data Records Unlimited', 'Priority Support ระดับ VIP', 'มีตัวเลือกโปรรายปี 15,900 บ./ปี (500MB)', 'Multi-Application Access เต็มระบบ'],
      popular: false,
    },
  ];

  const uniquePreviewGallery = [
    {
      title: 'Web App SaaS ERP (20 ระบบ)',
      sub: 'POS + สต๊อก + บัญชี + สลิปโลโก้บริษัท',
      img: '/src/assets/images/erp_saas_suite_preview_1795679556912.jpg',
      to: '/webapp',
    },
    {
      title: 'Food Cost & ร้านอาหาร',
      sub: 'ต้นทุนวัตถุดิบ + Yield + GP เดลิเวอรี',
      img: '/src/assets/images/template_restaurant_foodcost_1795680575049.jpg',
      to: '/templates/adv-restaurant-food-cost-pricing',
    },
    {
      title: 'BOQ งานก่อสร้าง & วิศวกรรม',
      sub: 'ถอดปริมาณวัสดุ + คุมงบหน้างานจริง',
      img: '/src/assets/images/template_construction_boq_1795680575810.jpg',
      to: '/templates/adv-construction-boq-cost',
    },
    {
      title: 'หอพัก / ห้องเช่าอัจฉริยะ',
      sub: 'จดมิเตอร์น้ำ-ไฟ + พิมพ์ใบแจ้งหนี้',
      img: '/src/assets/images/template_dormitory_rental_1795680575996.jpg',
      to: '/templates/adv-dormitory-invoice-pro',
    },
    {
      title: 'ออเดอร์ร้านค้าออนไลน์',
      sub: 'Shopee / Lazada / TikTok + กำไรสุทธิ',
      img: '/src/assets/images/template_online_ecommerce_1795680577250.jpg',
      to: '/templates/adv-online-seller-net-profit',
    },
    {
      title: 'คุมรถขนส่ง & โลจิสติกส์',
      sub: 'ค่าน้ำมัน + ซ่อมบำรุง + ต้นทุนต่อเที่ยว',
      img: '/src/assets/images/template_logistics_fleet_1795680578621.jpg',
      to: '/templates/pro-fleet-fuel-maintenance-control',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header + Segmented Part Switcher */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-xs font-bold tracking-wider uppercase text-orange-600 dark:text-orange-400">
          PRICING &amp; PACKAGE STRUCTURE
        </p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#1E1B18] dark:text-orange-50">
          แพ็กเกจราคาชัดเจน แยกกลุ่ม Excel Template และ Web App SaaS ERP
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400">
          เลือกใช้งานแบบซื้อขาดตลอดชีพสำหรับไฟล์ Excel หรือระบบ Web Application ออนไลน์ที่ทดลองฟรี 30 วันเต็มก่อนตัดสินใจ
        </p>

        <div className="inline-flex flex-wrap justify-center gap-2 pt-2">
          {[
            { id: 'all', label: 'ดูทั้งหมด (Part 1 + Part 2)' },
            { id: 'excel', label: 'Part 1: Excel Template (0 – 199฿)' },
            { id: 'webapp', label: 'Part 2: Web App Subscription (ทดลองฟรี 30 วัน)' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPartTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                partTab === t.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== PART 1: EXCEL TEMPLATE ==================== */}
      {(partTab === 'all' || partTab === 'excel') && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-orange-200/80 dark:border-orange-900/40 pb-4">
            <div>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                PART 1 — EXCEL TEMPLATE (จ่ายครั้งเดียว ใช้งานตลอดชีพ)
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50 mt-1">
                แพ็กเกจไฟล์ Excel สำเร็จรูป
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/templates')}
              className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              ดูเทมเพลตทั้งหมด 59+ ไฟล์
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Excel Tier Cards with Distinct Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {excelPackages.map((p) => (
              <div
                key={p.tier}
                className={`rounded-2xl overflow-hidden soft-card flex flex-col ${
                  p.featured
                    ? 'bg-[#1E1B18] text-white border-2 border-orange-500'
                    : 'bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40'
                }`}
              >
                <div className="aspect-[16/9] overflow-hidden bg-stone-900 relative">
                  <img
                    src={p.previewImage}
                    alt={`ตัวอย่าง ${p.tier}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="font-display font-bold text-sm">{p.tier}</span>
                    <span className="text-xs text-orange-300 font-semibold">{p.subtitle}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <p className="font-display font-bold text-3xl tabular-nums">{p.price}</p>
                    <span className={`text-xs ${p.featured ? 'text-stone-300' : 'text-stone-500'}`}>
                      {p.unit}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed ${p.featured ? 'text-stone-300' : 'text-stone-600 dark:text-stone-400'}`}>
                    {p.desc}
                  </p>

                  <div className="mt-5 pt-4 border-t border-orange-200/40 dark:border-orange-900/40 flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">
                        สิทธิ์การใช้งาน
                      </p>
                      <ul className="space-y-2 text-sm">
                        {p.rights.map((r) => (
                          <li key={r} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                        {p.level === 'free' ? 'ตัวอย่างไฟล์ฟรี' : 'เหมาะสำหรับ'}
                      </p>
                      <p className={`text-xs leading-relaxed ${p.featured ? 'text-stone-300' : 'text-stone-600 dark:text-stone-400'}`}>
                        {p.examples.join(' · ')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/templates?level=${p.level}`)}
                    className="mt-6 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
                  >
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== PART 2: WEB APPLICATION SUBSCRIPTION ==================== */}
      {(partTab === 'all' || partTab === 'webapp') && (
        <section className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-orange-200/80 dark:border-orange-900/40 pb-4">
            <div>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                PART 2 — WEB APPLICATION SUBSCRIPTION (SAAS ERP 20 ระบบออนไลน์)
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50 mt-1">
                แพ็กเกจรายเดือน &amp; รายปีสำหรับระบบ Web App ธุรกิจ
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/webapp')}
              className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              เปิดใช้งาน Web App ทันที
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* FREE TRIAL 1 MONTH BANNER */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-[#1E1B18] to-orange-950 text-white p-6 sm:p-8 soft-card border border-emerald-500/40 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                FREE TRIAL — ทดลองใช้งานฟรี 1 เดือน (30 วันเต็ม · ฿0)
              </p>
              <h3 className="font-display font-bold text-2xl sm:text-3xl">
                เปิดบริษัท SaaS ERP 20 ระบบได้ทันที ทดลองใช้ฟรี 30 วัน ไม่ต้องผูกบัตร
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                สิทธิ์ทดลองใช้งาน: พื้นที่จัดเก็บข้อมูล <strong className="text-white">30 MB</strong> · ผู้ใช้งาน{' '}
                <strong className="text-white">1 User</strong> · บันทึกข้อมูลสูงสุด{' '}
                <strong className="text-white">99 Records</strong> · รองรับครบทั้ง 20 โมดูล พร้อมระบบแจ้งเตือนก่อนหมดอายุ{' '}
                <strong className="text-amber-300">7 วัน / 3 วัน / 1 วัน / วันหมดอายุ</strong> และอัปเกรดต่อได้ทันทีไม่เสียข้อมูล
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <button
                type="button"
                onClick={() => navigate('/webapp')}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
              >
                เริ่มทดลองใช้งานฟรี 30 วัน
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-stone-300 lg:text-right">
                เริ่มนับวันทดลองอัตโนมัติเมื่อสร้าง Workspace บริษัทของคุณ
              </p>
            </div>
          </div>

          {/* 6 Paid Subscription Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {webAppPlans.map((plan) => (
              <div
                key={plan.code}
                className={`rounded-2xl p-6 soft-card flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-[#1E1B18] text-white border-2 border-orange-500'
                    : 'bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-lg">{plan.name}</span>
                    <span
                      className={`text-xs font-bold ${
                        plan.popular
                          ? 'text-orange-400'
                          : plan.code === 'enterprise_yearly'
                            ? 'text-amber-500'
                            : 'text-orange-600 dark:text-orange-400'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-3xl tabular-nums">฿{plan.price}</span>
                    <span className={`text-xs ${plan.popular ? 'text-stone-300' : 'text-stone-500'}`}>
                      {plan.cycle}
                    </span>
                  </div>

                  {/* Quota Specs Grid */}
                  <div
                    className={`mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-xs ${
                      plan.popular
                        ? 'border-stone-700 text-stone-200'
                        : 'border-orange-100 dark:border-orange-900/40 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">Storage</p>
                      <p className="font-bold tabular-nums mt-0.5">{plan.storage}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">Users</p>
                      <p className="font-bold tabular-nums mt-0.5">{plan.users.replace(' Account', '')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">Records</p>
                      <p className="font-bold tabular-nums mt-0.5">{plan.records.replace(' Data ', ' ')}</p>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/webapp?plan=${plan.code}`)}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                      plan.popular
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-[#231915] dark:bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    เลือกแพ็กเกจ {plan.name}
                  </button>
                  {plan.code === 'enterprise_yearly' && (
                    <button
                      type="button"
                      onClick={() => navigate('/webapp?plan=enterprise_annual_saver')}
                      className="w-full py-2 rounded-xl border border-amber-400/70 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      หรือเลือกโปรรายปี ฿15,900/ปี (ประหยัดจาก ฿18,000)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Annual Pricing Insight Box */}
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                💡 แนะนำสำหรับลูกค้ารายปี (Enterprise Annual Strategy)
              </p>
              <p className="text-sm text-[#1E1B18] dark:text-orange-50 leading-relaxed">
                แพ็กเกจ Enterprise รายเดือน <strong>1,500 × 12 = 18,000 บาท/ปี</strong> — หากองค์กรต้องการส่วนลดรายปี สามารถเลือก{' '}
                <strong>Enterprise Saver 15,900 บาท/ปี</strong> (500 MB · User ไม่จำกัด · 15,000 Records) หรืออัปเกรดเป็น{' '}
                <strong>Enterprise Yearly Unlimited 19,000 บาท/ปี</strong> (ไม่จำกัดทั้ง Storage, Users และ Data Records!)
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/webapp?plan=enterprise_annual_saver')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1E1B18] text-xs font-bold whitespace-nowrap shrink-0"
            >
              สมัครโปรรายปี ฿15,900
            </button>
          </div>

          {/* Full Comparison Table */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4">
            <div>
              <h3 className="font-display font-bold text-xl text-[#1E1B18] dark:text-orange-50">
                ตารางเปรียบเทียบแพ็กเกจ Web Application ทั้งหมด
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                แสดงโควต้าพื้นที่จัดเก็บ (Storage) จำนวนผู้ใช้งาน (Users) และจำนวนรายการข้อมูล (Data Records) ที่ระบบบังคับใช้จริงแบบ Real-Time
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left tabular-nums">
                <thead>
                  <tr className="border-b border-orange-200/80 dark:border-orange-900/40 text-stone-500">
                    <th className="py-3 pr-4">แพ็กเกจ</th>
                    <th className="py-3 pr-4">ราคา</th>
                    <th className="py-3 pr-4">Storage</th>
                    <th className="py-3 pr-4">Users</th>
                    <th className="py-3 pr-4">Data Records</th>
                    <th className="py-3 pr-4">จุดเด่นหลัก</th>
                    <th className="py-3 text-right">เริ่มต้น</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {[
                    { code: 'trial', name: 'Free Trial', price: '0 บาท / 30 วัน', storage: '30 MB', users: '1', records: '99', highlight: 'ทดลองครบ 20 ระบบ + แจ้งเตือนก่อนหมดอายุ' },
                    { code: 'basic', name: 'Basic', price: '250 บาท/เดือน', storage: '30 MB', users: '1', records: '99', highlight: 'Dashboard · Report · Export · Backup' },
                    { code: 'standard', name: 'Standard', price: '350 บาท/เดือน', storage: '35 MB', users: '2', records: '199', highlight: 'Multi User 2 คน · POS ↔ สต๊อก ↔ บัญชี' },
                    { code: 'professional', name: 'Professional 🔥', price: '550 บาท/เดือน', storage: '50 MB', users: '5', records: '600', highlight: 'Multi User 5 คน · Permission · ยอดนิยม', popular: true },
                    { code: 'business', name: 'Business', price: '990 บาท/เดือน', storage: '100 MB', users: '10', records: '3,000', highlight: 'Permission ละเอียด · Advanced Report' },
                    { code: 'enterprise', name: 'Enterprise', price: '1,500 บาท/เดือน', storage: '500 MB', users: 'Unlimited', records: '15,000', highlight: 'User Management · Role · API' },
                    { code: 'enterprise_annual_saver', name: 'Enterprise Saver', price: '15,900 บาท/ปี', storage: '500 MB', users: 'Unlimited', records: '15,000', highlight: 'ประหยัด 2,100 บ./ปี เทียบรายเดือน' },
                    { code: 'enterprise_yearly', name: 'Enterprise Yearly', price: '19,000 บาท/ปี', storage: 'Unlimited', users: 'Unlimited', records: 'Unlimited', highlight: 'ไม่จำกัด Storage / User / Records' },
                  ].map((row) => (
                    <tr key={row.code} className={row.popular ? 'bg-orange-50/70 dark:bg-orange-950/30 font-semibold' : ''}>
                      <td className="py-3 pr-4 font-display font-bold text-[#1E1B18] dark:text-orange-50 whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="py-3 pr-4 font-bold text-orange-600 whitespace-nowrap">{row.price}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.storage}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.users}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.records}</td>
                      <td className="py-3 pr-4 text-stone-600 dark:text-stone-300">{row.highlight}</td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(row.code === 'trial' ? '/webapp' : `/webapp?plan=${row.code}`)
                          }
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                        >
                          {row.code === 'trial' ? 'ทดลองฟรี' : 'อัปเกรด'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Funnel Progression */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4">
            <h3 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
              เส้นทางการเติบโตของธุรกิจบน กดแล้วจบ SaaS (Sales Funnel)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
              {[
                { step: 'ขั้นที่ 1', label: 'FREE 30 วัน', sub: 'ทดลองใช้งานจริง', active: false },
                { step: 'ขั้นที่ 2', label: 'BASIC 250฿', sub: '30MB / 99 Rec', active: false },
                { step: 'ขั้นที่ 3', label: 'STANDARD 350฿', sub: '2 Users / 199 Rec', active: false },
                { step: 'ขั้นที่ 4 ⭐', label: 'PRO 550฿', sub: '5 Users / 600 Rec', active: true },
                { step: 'ขั้นที่ 5', label: 'BUSINESS 990฿', sub: '10 Users / 3,000 Rec', active: false },
                { step: 'ขั้นที่ 6', label: 'ENTERPRISE 1,500฿', sub: '500MB / 15,000 Rec', active: false },
                { step: 'ขั้นที่ 7 👑', label: 'YEARLY 19,000฿', sub: 'Unlimited ทั้งองค์กร', active: false },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl p-3 border ${
                    s.active
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-[#FFF7ED] dark:bg-[#2A201B] border-orange-200/80 dark:border-orange-900/40'
                  }`}
                >
                  <p className={`text-[10px] font-bold ${s.active ? 'text-orange-100' : 'text-orange-600 dark:text-orange-400'}`}>
                    {s.step}
                  </p>
                  <p className="font-display font-bold text-xs mt-1">{s.label}</p>
                  <p className={`text-[11px] mt-0.5 ${s.active ? 'text-orange-50' : 'text-stone-500'}`}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== UNIQUE DOMAIN PREVIEW GALLERY (NO DUPLICATES) ==================== */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
            ตัวอย่างหน้าจอระบบและเทมเพลตแยกตามสายธุรกิจ (ภาพตัวอย่างเฉพาะทางไม่ซ้ำกัน)
          </p>
          <h2 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50 mt-1">
            ครบทุกสายอาชีพในแพลตฟอร์มเดียว
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {uniquePreviewGallery.map((g) => (
            <button
              key={g.title}
              type="button"
              onClick={() => navigate(g.to)}
              className="text-left rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 overflow-hidden soft-card hover:-translate-y-1 hover:border-orange-500 transition-all group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-900">
                <img
                  src={g.img}
                  alt={g.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                  {g.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{g.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AboutPage() {
  const { navigate } = useApp();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-8 sm:p-10 soft-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 flex justify-center">
          <img
            src={BRAND_LOGO}
            alt="กดแล้วจบ (Kodraewjob Digital Marketplace)"
            referrerPolicy="no-referrer"
            className="w-44 h-44 rounded-full object-cover border-4 border-orange-400 shadow-lg"
          />
        </div>
        <div className="md:col-span-8 space-y-4">
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            เกี่ยวกับ กดแล้วจบ (Kodraewjob Digital Marketplace)
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
            แนวคิด “กดแล้วจบ” เพื่อธุรกิจไทยทำงานเร็วขึ้น
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            เราเริ่มต้นจากความตั้งใจที่จะช่วยให้เจ้าของธุรกิจ SME ฝ่ายบัญชี HR โรงงานอุตสาหกรรม และคุณครูไทย มีไฟล์ Excel, Google Sheets, VBA และ AppSheet ที่ออกแบบมาให้ใช้งานได้จริงทันที ไม่ต้องเสียเวลาลองผิดลองถูก หรือจ้างพัฒนาระบบราคาหลักแสน ปัจจุบันได้รับความไว้วางใจจากผู้ใช้งานและองค์กรกว่า 140+ แห่งทั่วประเทศ พร้อมคอมมูนิตี้ฟอรั่มสำหรับแลกเปลี่ยนเทคนิคการใช้งานจริง
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/templates')}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
            >
              เลือกชมเทมเพลตทั้งหมด
            </button>
            <button
              onClick={() => navigate('/forum')}
              className="px-5 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200 text-sm font-semibold"
            >
              เข้าสู่ฟอรั่มชุมชน
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-5 py-2.5 rounded-xl border border-orange-200 dark:border-orange-900/40 text-sm font-semibold"
            >
              ติดต่อทีมพัฒนา
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
          <p className="font-display font-bold text-3xl text-orange-600 tabular-nums">140+</p>
          <p className="text-sm font-semibold text-[#1E1B18] dark:text-orange-50 mt-1">
            ลูกค้าธุรกิจที่ใช้งานจริง
          </p>
          <p className="text-xs text-stone-500 mt-1">ครอบคลุมร้านค้า คาเฟ่ หอพัก รับเหมา และโรงงาน</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
          <p className="font-display font-bold text-3xl text-[#1E1B18] dark:text-orange-50 tabular-nums">59+</p>
          <p className="text-sm font-semibold text-[#1E1B18] dark:text-orange-50 mt-1">
            เทมเพลตพร้อมใช้ครบทุกแผนก
          </p>
          <p className="text-xs text-stone-500 mt-1">ตั้งแต่ระดับเริ่มต้นฟรี จนถึงระบบ VBA/BOM ขั้นสูง</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
          <p className="font-display font-bold text-3xl text-amber-500 tabular-nums">24 ชม.</p>
          <p className="text-sm font-semibold text-[#1E1B18] dark:text-orange-50 mt-1">
            ระบบดาวน์โหลดอัตโนมัติ
          </p>
          <p className="text-xs text-stone-500 mt-1">สแกน PromptPay QR แล้วรับไฟล์ได้ทันทีทุกเวลา</p>
        </div>
      </div>
    </div>
  );
}

export function BlogPage() {
  const { navigate } = useApp();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const articles = [
    {
      title: 'วิธีวางระบบสต๊อกสินค้า SME ด้วย Excel ให้ไม่พลาดจุดสั่งซื้อซ้ำ (Reorder Point)',
      date: '20 พฤศจิกายน 2026',
      readTime: '4 นาที',
      summary:
        'เรียนรู้การผูกสูตร SUMIFS แยกรับเข้า-จ่ายออก และตั้งค่า Conditional Formatting แจ้งเตือนสีแดงทันทีเมื่อสินค้าต่ำกว่า Safety Stock',
      body: 'การคุมสต๊อกที่แม่นยำเริ่มต้นจากการแยกชีตฐานข้อมูลสินค้า (Master SKU) ออกจากชีตบันทึกเคลื่อนไหวรายวัน (Stock In/Out) แล้วใช้สูตร SUMIFS ดึงยอดรวมมารวมในหน้าคงเหลือ จากนั้นตั้งสูตร Reorder Status = IF(คงเหลือ <= จุดสั่งซื้อ, "สั่งซื้อด่วน", "ปกติ") เพื่อป้องกันของขาดมือในวันที่ขายดี',
      ctaSlug: '/templates/adv-inventory-fifo-stock',
    },
    {
      title: 'เปรียบเทียบแผนปลดหนี้ Snowball vs Avalanche แบบไหนเหมาะกับคุณ',
      date: '15 พฤศจิกายน 2026',
      readTime: '5 นาที',
      summary:
        'เทคนิคจัดการหนี้หลายก้อน ทั้งบัตรเครดิต สินเชื่อรถ และหนี้บ้าน เพื่อลดดอกเบี้ยรวมและปิดยอดให้เร็วขึ้นกว่าเดิมหลายปี',
      body: 'กลยุทธ์ Snowball เน้นปิดหนี้ก้อนที่ยอดคงเหลือต่ำสุดก่อนเพื่อสร้างกำลังใจและปลดล็อกกระแสเงินสดรายเดือน ส่วน Avalanche เน้นโปะหนี้ที่อัตราดอกเบี้ยสูงสุดก่อนซึ่งช่วยประหยัดดอกเบี้ยรวมได้มากที่สุด เทมเพลตของเราช่วยจำลองตัวเลขทั้งสองแบบเทียบกันทันที',
      ctaSlug: '/templates/std-debt-payoff-snowball-avalanche',
    },
    {
      title: 'สูตรคำนวณต้นทุนอาหาร + ค่า GP แอปเดลิเวอรี ไม่ให้ขายดีแต่ขาดทุน',
      date: '10 พฤศจิกายน 2026',
      readTime: '4 นาที',
      summary:
        'วิธีเผื่อค่า Yield สูญเสียจากการตัดแต่งวัตถุดิบ และสูตรย้อนกลับตั้งราคาขายบนแอปเดลิเวอรีหลังหัก GP 30-35% + VAT',
      body: 'ร้านอาหารจำนวนมากตั้งราคาจากต้นทุนดิบโดยลืมคิด Yield เช่น เนื้อสัตว์ 1 กก. หลังตัดแต่งอาจเหลือใช้งานจริง 800 กรัม และเมื่อขายผ่านแพลตฟอร์มที่มี GP 32% + VAT 7% ของ GP ราคาขายต้องคำนวณด้วยสูตร ราคาขายหน้าร้าน / (1 - อัตราหักรวม) เพื่อรักษากำไรสุทธิให้เท่าเดิม',
      ctaSlug: '/templates/adv-restaurant-food-cost-pricing',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          คลังความรู้ &amp; บทความธุรกิจ
        </p>
        <h1 className="font-display font-bold text-3xl text-[#1E1B18] dark:text-orange-50 mt-2">
          บทความเทคนิค Excel และระบบจัดการธุรกิจ
        </h1>
      </div>

      <div className="space-y-4">
        {articles.map((art, i) => (
          <article
            key={art.title}
            className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card"
          >
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>{art.date}</span>
              <span aria-hidden="true">·</span>
              <span>อ่าน {art.readTime}</span>
            </div>
            <h2
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="cursor-pointer font-display font-bold text-lg sm:text-xl text-[#1E1B18] dark:text-orange-50 mt-1.5 hover:text-orange-600 dark:hover:text-orange-400"
            >
              {art.title}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">{art.summary}</p>
            {openIdx === i && (
              <div className="mt-4 pt-4 border-t border-orange-100 dark:border-orange-900/30 space-y-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                <p>{art.body}</p>
                <button
                  onClick={() => navigate(art.ctaSlug)}
                  className="text-orange-600 dark:text-orange-400 font-semibold inline-flex items-center gap-1.5 hover:underline"
                >
                  ดูเทมเพลตที่เกี่ยวข้อง
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const { showToast, navigate } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        showToast({
          type: 'success',
          title: 'ส่งข้อความเรียบร้อยแล้ว',
          description: 'ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ',
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        const d = await res.json();
        showToast({ type: 'error', title: d.error || 'ส่งข้อความไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาด' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 rounded-2xl bg-[#1E1B18] text-white p-7 sm:p-8 soft-card space-y-6">
        <div>
          <p className="text-xs font-semibold text-orange-400">ติดต่อทีมงาน กดแล้วจบ (Kodraewjob)</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mt-1">
            สอบถามเทมเพลตหรือสั่งพัฒนาไฟล์เฉพาะกิจการ
          </h1>
          <p className="text-sm text-stone-300 mt-2 leading-relaxed">
            แอด LINE Official เพื่อเข้ากลุ่มลูกค้า 140+ คน หรือเข้าร่วมพูดคุยในหน้าฟอรั่มชุมชนเพื่อสอบถามการปรับแต่งสูตรให้ตรงกับงานของคุณ
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 text-center text-[#1E1B18]">
          <img
            src={LINE_QR}
            alt="LINE OA @556fsrdw"
            referrerPolicy="no-referrer"
            className="w-44 h-44 mx-auto object-contain"
          />
          <p className="font-display font-bold text-base mt-2">LINE ID: @556fsrdw</p>
          <a
            href="https://line.me/R/ti/p/@556fsrdw"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            เพิ่มเพื่อน LINE ทันที
          </a>
        </div>

        <div className="space-y-2 text-xs text-stone-300">
          <p className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            กลุ่มผู้ใช้งานจริงกว่า 140+ ธุรกิจ
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-400" />
            pragopkhammool@gmail.com
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/forum')}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
        >
          เปิดหน้าฟอรั่ม &amp; แชทสมาชิก
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card space-y-5"
      >
        <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-orange-50 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          ส่งข้อความถึงทีมงาน
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">ชื่อผู้ติดต่อ</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">อีเมลติดต่อกลับ</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">หัวข้อเรื่อง</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="เช่น สอบถามเทมเพลตสต๊อก, ขอใบเสนอราคาองค์กร"
            className="w-full px-3.5 py-2.5 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">รายละเอียด</label>
          <textarea
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
        >
          {sending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
        </button>
      </form>
    </div>
  );
}
