import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  LayoutDashboard,
  MessageSquareHeart,
  Play,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TableProperties,
  Terminal,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchJsonSafe, queryLocalProducts } from '../lib/catalogClient';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

const BRAND_BANNER =
  '/assets/aistudio/810659720_983970528045836_3360242927367859030_n_fcb7cbf0.png';
const IMG_ACC = '/src/assets/images/template_accounting_pos_1795676831169.jpg';
const IMG_MFG = '/src/assets/images/template_manufacturing_bom_1795676829666.jpg';
const IMG_ENG = '/src/assets/images/template_engineering_solver_1795676831708.jpg';
const LINE_QR = '/assets/aistudio/L_556fsrdw_GW_6a59b22f.png';

const CATEGORY_CARDS = [
  {
    name: 'Excel Templates',
    slug: 'excel',
    count: '38+ ไฟล์',
    desc: 'บัญชี สต๊อก POS เงินเดือน และ BOM โรงงาน',
    icon: FileSpreadsheet,
  },
  {
    name: 'Web App & Dashboard',
    slug: 'web-app',
    count: '20 ระบบ ERP',
    desc: 'SaaS ERP 20 ระบบ + สต๊อก POS เงินเดือน และหัวเอกสารโลโก้บริษัท',
    icon: LayoutDashboard,
  },
  {
    name: 'VBA Automation',
    slug: 'vba',
    count: 'คลิกเดียว',
    desc: 'ออกใบกำกับภาษี ภ.พ.30 และสลิป PDF อัตโนมัติ',
    icon: Terminal,
  },
  {
    name: 'Google Sheets',
    slug: 'google-sheets',
    count: 'Cloud Sync',
    desc: 'เช็คชื่อ ตัดเกรด ออเดอร์ออนไลน์ ทำงานร่วมกันได้',
    icon: TableProperties,
  },
  {
    name: 'AppSheet No-Code',
    slug: 'appsheet',
    count: 'มือถือ/แท็บเล็ต',
    desc: 'ใบขอซื้อ PR อนุมัติ และคุมทรัพย์สินองค์กร',
    icon: Smartphone,
  },
  {
    name: 'AI Solver คำนวณ',
    slug: 'ai-solver',
    count: 'Gemini AI',
    desc: 'แก้โจทย์ไฟฟ้า ฟิสิกส์ คณิต โครงสร้าง และ BOM',
    icon: Calculator,
  },
];

const SHOWCASE_VIDEOS = [
  {
    id: 'pos-stock',
    title: 'ระบบสต๊อกสินค้า & POS ตัดสต๊อกอัตโนมัติ',
    duration: '0:24 นาที',
    category: 'Excel + VBA',
    image: IMG_ACC,
    highlights: [
      'ยิงบาร์โค้ดขายหน้าร้านแล้วตัดยอดคงเหลือทันที',
      'คำนวณต้นทุนเฉลี่ยถ่วงน้ำหนัก + กำไรรายบิล',
      'แจ้งเตือนจุดสั่งซื้อซ้ำ (Reorder Point) อัตโนมัติ',
    ],
  },
  {
    id: 'bom-yield',
    title: 'คำนวณต้นทุนการผลิต + Yield + Scrap ตาม BOM',
    duration: '0:28 นาที',
    category: 'Manufacturing',
    image: IMG_MFG,
    highlights: [
      'ระเบิดสูตรวัตถุดิบ BOM หลายระดับในคลิกเดียว',
      'ติดตาม % Yield และมูลค่าของเสียหน้าไลน์ผลิต',
      'เชื่อมแผนการผลิต Production Planning ประจำสัปดาห์',
    ],
  },
  {
    id: 'ai-solver-demo',
    title: 'AI Solver แก้โจทย์วิศวกรรม & แปลงเป็นสูตร Excel',
    duration: '0:20 นาที',
    category: 'AI Solver',
    image: IMG_ENG,
    highlights: [
      'คำนวณวงจรไฟฟ้า 3 เฟส โมเมนต์คาน และแรงเฉือน',
      'แสดงวิธีทำทีละขั้นตอนพร้อมหน่วยวัดมาตรฐาน',
      'สร้างสูตร Excel สำหรับนำไปคำนวณต่อในตารางได้ทันที',
    ],
  },
];

const TESTIMONIALS = [
  {
    name: 'กิตติพงษ์ วรรณศิริ',
    role: 'กรรมการผู้จัดการ · บจก. สยามเฟอร์นิเจอร์',
    quote:
      'เปลี่ยนจากการจดสต๊อกลงสมุดมาใช้เทมเพลต BOM และสต๊อกรับเข้า-จ่ายออก ลดเวลาตรวจนับโกดังลง 70% ตั้งแต่เดือนแรกครับ',
  },
  {
    name: 'ณัฐวดี เจริญสุข',
    role: 'เจ้าของร้านอาหารบ้านสวนคาเฟ่',
    quote:
      'ไฟล์คำนวณต้นทุนเมนูอาหาร + GP เดลิเวอรีช่วยให้รู้กำไรสุทธิต่อจานจริง ปรับราคาขายใหม่แล้วกำไรร้านดีขึ้นชัดเจนค่ะ',
  },
  {
    name: 'ธนากร สุขสวัสดิ์',
    role: 'ผู้จัดการฝ่ายบุคคล · บริษัท โลจิสติกส์ไทย จำกัด',
    quote:
      'ระบบเงินเดือน + ภาษี + สลิป VBA ช่วยทีม HR ปิดงวดพนักงาน 45 คนเสร็จภายใน 1 ชั่วโมง จากเดิมที่เคยใช้เวลา 2 วันเต็ม',
  },
  {
    name: 'ศิริพร อัครเดชา',
    role: 'เจ้าของหอพักสุขใจอพาร์ตเมนต์',
    quote:
      'ไฟล์หอพัก 199 บาทคุ้มมากค่ะ จดมิเตอร์น้ำไฟแล้วกดพิมพ์ใบแจ้งหนี้ส่งลูกบ้านได้ครบทุกห้องในคลิกเดียว',
  },
  {
    name: 'วรพล ตั้งจิตต์',
    role: 'วิศวกรโยธา · ทีมรับเหมาก่อสร้าง W-Build',
    quote:
      'เทมเพลต BOQ งานก่อสร้างช่วยคุมต้นทุนวัสดุกับค่าแรงหน้างานได้ดีมาก เทียบงบประมาณกับยอดจ่ายจริงได้ทันที',
  },
  {
    name: 'พิมพ์ชนก รัตนากร',
    role: 'เจ้าของแบรนด์สกินแคร์ออนไลน์',
    quote:
      'ใช้ไฟล์ออเดอร์แม่ค้าออนไลน์ + กำไรสุทธิ ทำให้เห็นค่าแอดและค่าธรรมเนียมแพลตฟอร์มครบ ไม่ขายดีแบบขาดทุนอีกต่อไป',
  },
];

export function HomePage() {
  const { navigate, categories, getQrUrl, trackLinkClick } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [activeShowcase, setActiveShowcase] = useState<string | null>(null);
  const [testimonialOffset, setTestimonialOffset] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchJsonSafe<{ items?: Product[] }>('/api/products?featured=true&limit=8').then((res) => {
      if (!active) return;
      if (res.ok && Array.isArray(res.data.items) && res.data.items.length > 0) {
        setFeaturedProducts(res.data.items.slice(0, 8));
      } else {
        setFeaturedProducts(queryLocalProducts({ featured: true, limit: 8 }).items);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroSearch.trim();
    navigate(q ? `/templates?search=${encodeURIComponent(q)}` : '/templates');
  };

  const selectedShowcase = SHOWCASE_VIDEOS.find((v) => v.id === activeShowcase);

  const visibleTestimonials = [
    TESTIMONIALS[testimonialOffset % TESTIMONIALS.length],
    TESTIMONIALS[(testimonialOffset + 1) % TESTIMONIALS.length],
    TESTIMONIALS[(testimonialOffset + 2) % TESTIMONIALS.length],
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 tracking-wide mb-3">
                กดแล้วจบ · แพลตฟอร์มที่ไว้วางใจโดย 140+ ธุรกิจและองค์กรทั่วไทย
              </p>

              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1E1B18] dark:text-orange-50 leading-[1.18] [text-wrap:balance]">
                กดแล้วจบ · ตลาดเทมเพลต Excel &amp; ระบบธุรกิจ Web App ERP
              </h1>

              <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
                รวมเทมเพลตบัญชี สต๊อก POS เงินเดือน HR โครงสร้าง BOQ พร้อมตัวอย่าง Web App SaaS ERP 20 ระบบ ฟอรั่มชุมชน และเครื่องมือ AI คำนวณครบในที่เดียว
              </p>

              {/* Inline Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-xl"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="ค้นหาไฟล์ เช่น สต๊อกสินค้า, ใบกำกับภาษี, เงินเดือน..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500 soft-card"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#231915] dark:bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  ค้นหาเทมเพลต
                </button>
              </form>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/webapp')}
                  className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  ทดลอง Web App ERP 20 ระบบ
                </button>
                <button
                  onClick={() => navigate('/templates')}
                  className="px-5 py-3 rounded-xl bg-[#FFEDD5] dark:bg-[#2A201B] border border-orange-300 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-950 text-[#1E1B18] dark:text-orange-200 text-sm font-semibold inline-flex items-center gap-2 transition-all hover:-translate-y-0.5"
                >
                  เลือกชมเทมเพลตทั้งหมด
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/forum')}
                  className="px-5 py-3 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 hover:border-orange-500 text-[#1E1B18] dark:text-white text-sm font-semibold inline-flex items-center gap-2 transition-all hover:-translate-y-0.5"
                >
                  <MessageSquareHeart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  ฟอรั่มชุมชน
                </button>
              </div>
            </div>

            {/* Attached Brand Banner Showcase */}
            <div className="lg:col-span-6 flex items-center">
              <div className="relative w-full rounded-2xl overflow-hidden border border-orange-200/80 dark:border-orange-900/50 soft-card bg-white dark:bg-[#1F1815] p-2.5 sm:p-3">
                <div className="rounded-xl overflow-hidden bg-[#0F172A]">
                  <img
                    src={BRAND_BANNER}
                    alt="กดแล้วจบ รับทำ สร้าง แก้ไข พัฒนา งานดิจิทัล ครบ จบ ในที่เดียว"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="mt-3 px-2 pb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-medium text-[#1E1B18] dark:text-orange-50">
                    งานดิจิทัล Excel · Google Sheet · Web App · VBA ครบ จบ ในที่เดียว
                  </span>
                  <span className="font-mono text-orange-600 dark:text-orange-400 font-semibold">
                    กดแล้วจบ 2027
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. TRUST BAR */}
          <div className="mt-10 sm:mt-12 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 soft-card p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50 tabular-nums">
                140+ ธุรกิจ
              </p>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                องค์กรและ SME ที่ไว้วางใจใช้งานจริง
              </p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-orange-600 dark:text-orange-400 tabular-nums">
                59+ Templates
              </p>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                ครอบคลุมบัญชี สต๊อก HR และวิศวกรรม
              </p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
                4.9 / 5.0 ดาว
              </p>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                SSL &amp; PromptPay QR ปลอดภัยทันที
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY GRID (6 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
              หมวดหมู่เครื่องมือดิจิทัล
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-1">
              เลือกประเภทเครื่องมือที่เหมาะกับขั้นตอนการทำงานของทีมคุณ
            </p>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            ดูทุกหมวดหมู่
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORY_CARDS.map((cat) => {
            const liveCat = categories.find((c) => c.slug === cat.slug);
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                onClick={() =>
                  cat.slug === 'ai-solver'
                    ? navigate('/solve')
                    : navigate(`/category/${cat.slug}`)
                }
                className="text-left rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card hover:-translate-y-1 hover:border-orange-500 transition-all duration-200 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 truncate">
                      {liveCat?.name || cat.name}
                    </h3>
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400 shrink-0">
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
                    {liveCat?.description || cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (4 cols x 2 rows) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
              เทมเพลตขายดีและแนะนำ
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-1">
              คัดสรรไฟล์ที่ธุรกิจ SME โรงงาน และฝ่ายบัญชีเลือกใช้มากที่สุด (ล็อกอินก่อนดาวน์โหลดทุกไฟล์)
            </p>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            ดูทั้งหมด 59+ รายการ
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-orange-100 dark:bg-[#2A201B]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-orange-100 dark:bg-[#2A201B] rounded w-1/2" />
                  <div className="h-5 bg-orange-100 dark:bg-[#2A201B] rounded w-5/6" />
                  <div className="h-3 bg-orange-100 dark:bg-[#2A201B] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 5. PRICING TIERS (PART 1 EXCEL + PART 2 WEB APP SUBSCRIPTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
              PRICING &amp; PACKAGE STRUCTURE
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50 mt-1">
              Part 1: แพ็กเกจ Excel Template (จ่ายครั้งเดียวจบ)
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-1">
              แยกชัดเจนตามระดับการใช้งาน ตั้งแต่ไฟล์ฟรี 0 บาท จนถึงระบบธุรกิจ SME เต็มรูปแบบ
            </p>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            ดูตารางเปรียบเทียบแพ็กเกจทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-7 soft-card flex flex-col">
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              🆓 FREE — ทดลองใช้งาน / ผู้เริ่มต้น
            </p>
            <h3 className="font-display font-bold text-3xl text-[#1E1B18] dark:text-white mt-1 tabular-nums">
              ฿0 <span className="text-sm font-normal text-stone-500">/ 19 เทมเพลต</span>
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
              สำหรับผู้ที่ต้องการทดลองใช้ Template หรือจัดการงานส่วนตัว/ร้านค้าขนาดเล็ก
            </p>
            <ul className="mt-6 space-y-3 text-sm text-stone-700 dark:text-stone-300 flex-1">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                รายรับรายจ่าย, Stock Starter, Leave Starter
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                Payroll Starter, Quotation Starter, Grade Starter
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                สูตรพื้นฐาน + คู่มือเบื้องต้น (ล็อกอินโหลดฟรีทันที)
              </li>
            </ul>
            <button
              onClick={() => navigate('/templates?level=free')}
              className="mt-8 w-full py-3 rounded-xl bg-[#FFEDD5] dark:bg-[#2A201B] hover:bg-orange-500 hover:text-white text-[#1E1B18] dark:text-white text-sm font-semibold transition-colors"
            >
              ดูเทมเพลตฟรีทั้งหมด
            </button>
          </div>

          {/* Standard Tier */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-300 dark:border-orange-800 p-7 soft-card flex flex-col">
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              ⭐ STANDARD — งานทั่วไป / ธุรกิจขนาดเล็ก
            </p>
            <h3 className="font-display font-bold text-3xl text-[#1E1B18] dark:text-white mt-1 tabular-nums">
              ฿99 <span className="text-sm font-normal text-stone-500">/ เทมเพลต</span>
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
              เหมาะสำหรับร้านค้า พนักงาน Freelance นักเรียน และธุรกิจขนาดเล็กที่ต้องการ Dashboard
            </p>
            <ul className="mt-6 space-y-3 text-sm text-stone-700 dark:text-stone-300 flex-1">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                สูตรคำนวณอัตโนมัติ + Dashboard + Summary
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                Search / Filter / Print พร้อมใช้ (Excel 2019+)
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                คู่มือการใช้งาน + เข้ากลุ่ม LINE @556fsrdw
              </li>
            </ul>
            <button
              onClick={() => navigate('/templates?level=standard')}
              className="mt-8 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
            >
              เลือกชมแพ็กเกจ 99 บาท
            </button>
          </div>

          {/* Advanced Tier (Highlighted) */}
          <div className="rounded-2xl bg-[#231915] text-white border-2 border-orange-500 p-7 soft-card flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-orange-400">
                🚀 ADVANCED — ระบบงานธุรกิจเต็มรูปแบบ
              </p>
              <span className="text-xs font-bold text-amber-400">SME &amp; โรงงาน</span>
            </div>
            <h3 className="font-display font-bold text-3xl text-white mt-1 tabular-nums">
              ฿199 <span className="text-sm font-normal text-stone-400">/ เทมเพลต (โรงงานถึง ฿299)</span>
            </h3>
            <p className="text-sm text-stone-300 mt-2">
              สำหรับ SME, HR, บัญชี, ขาย, คลัง, จัดซื้อ, ร้านอาหาร, แม่ค้าออนไลน์ และโรงงาน
            </p>
            <ul className="mt-6 space-y-3 text-sm text-stone-200 flex-1">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                Master Data + Automatic Calculation + Formula Automation
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                Search / Filter / Report / Print / PDF / Excel Export
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                Data Validation &amp; Protection + คู่มือ &amp; Version Update
              </li>
            </ul>
            <button
              onClick={() => navigate('/templates?level=advanced')}
              className="mt-8 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1E1B18] text-sm font-bold transition-colors"
            >
              เลือกชมระบบขั้นสูง 199฿
            </button>
          </div>
        </div>

        {/* Part 2: Web App Subscription Showcase Strip */}
        <div className="rounded-2xl bg-gradient-to-br from-[#231915] via-[#2B1B15] to-orange-950 text-white border border-orange-500/40 p-6 sm:p-8 soft-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              PART 2 — WEB APPLICATION SUBSCRIPTION (20 ระบบ SaaS ERP ออนไลน์)
            </p>
            <h3 className="font-display font-bold text-xl sm:text-2xl">
              ทดลองใช้ระบบ Web App ERP ฟรี 1 เดือน (30 วัน) · แพ็กเกจจริงเริ่ม ฿250 – ฿1,500/เดือน
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              ครบทุกโควต้าที่คุมจริงในระบบ: <strong className="text-white">Basic 250฿</strong> (30MB/1 User/99 Rec) ·{' '}
              <strong className="text-white">Standard 350฿</strong> (35MB/2 Users/199 Rec) ·{' '}
              <strong className="text-orange-400">Professional 550฿ 🔥 ยอดนิยม</strong> (50MB/5 Users/600 Rec) ·{' '}
              <strong className="text-white">Business 990฿</strong> ·{' '}
              <strong className="text-white">Enterprise 1,500฿</strong> ·{' '}
              <strong className="text-amber-300">รายปี Unlimited 19,000฿</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/webapp')}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold whitespace-nowrap"
            >
              ทดลองใช้ฟรี 30 วัน
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold whitespace-nowrap"
            >
              เปรียบเทียบทุกแพ็กเกจ
            </button>
          </div>
        </div>
      </section>

      {/* 6. AI VIDEO / INTERACTIVE PREVIEW SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
              ตัวอย่างการทำงานจริงใน 30 วินาที
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-1">
              ดูภาพรวมการใช้งานระบบ POS สต๊อก ต้นทุนโรงงาน BOM และ AI แก้โจทย์
            </p>
          </div>
          <button
            onClick={() => navigate('/solve')}
            className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            ทดลองใช้ AI Solver
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SHOWCASE_VIDEOS.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveShowcase(vid.id)}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 overflow-hidden soft-card hover:-translate-y-1 transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#1E1B18]">
                <img
                  src={vid.image}
                  alt={vid.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-white/95 text-[#1E1B18] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5 text-orange-600" />
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                  <span>{vid.category}</span>
                  <span className="font-mono">{vid.duration}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                  {vid.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  คลิกเพื่อดูสรุปการทำงานทีละขั้นตอน
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedShowcase && (
          <div className="mt-6 rounded-2xl bg-[#231915] text-white p-6 sm:p-8 soft-card flex flex-col lg:flex-row gap-6 items-center justify-between animate-fade-in-up">
            <div className="space-y-3 flex-1">
              <p className="text-xs font-semibold text-orange-400">
                สรุปการทำงาน · {selectedShowcase.category} ({selectedShowcase.duration})
              </p>
              <h3 className="font-display font-bold text-xl sm:text-2xl">
                {selectedShowcase.title}
              </h3>
              <ul className="space-y-2 text-sm text-stone-300">
                {selectedShowcase.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() =>
                  selectedShowcase.id === 'ai-solver-demo'
                    ? navigate('/solve')
                    : navigate('/templates')
                }
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
              >
                ไปยังเครื่องมือนี้
              </button>
              <button
                onClick={() => setActiveShowcase(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 7. TESTIMONIALS CAROUSEL (6 Reviews) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
              เสียงตอบรับจาก 140+ ลูกค้าจริง
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-1">
              ผลลัพธ์จากเจ้าของกิจการ ฝ่ายบัญชี ฝ่ายบุคคล และวิศวกรทั่วประเทศ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setTestimonialOffset((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
              }
              aria-label="รีวิวก่อนหน้า"
              className="p-2.5 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 text-stone-700 dark:text-stone-200 hover:border-orange-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTestimonialOffset((prev) => (prev + 1) % TESTIMONIALS.length)}
              aria-label="รีวิวถัดไป"
              className="p-2.5 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 text-stone-700 dark:text-stone-200 hover:border-orange-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleTestimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                  “{t.quote}”
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-orange-100 dark:border-orange-900/40">
                <p className="font-display font-semibold text-sm text-[#1E1B18] dark:text-orange-50">
                  {t.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. COMMUNITY FORUM + LINE GROUP CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#231915] via-[#352016] to-orange-950 text-white p-6 sm:p-10 lg:p-12 soft-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400">
              <Users className="w-4 h-4" />
              กดแล้วจบ Community · ฟอรั่ม &amp; กลุ่ม LINE 140+ สมาชิก
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight">
              ร่วมพูดคุยในฟอรั่ม หรือเข้ากลุ่ม LINE @556fsrdw
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
              ล็อกอินด้วยบัญชี Google เพื่อโพสต์คำถาม รูปภาพ ข้อความเสียง สร้างเพจ สร้างกลุ่ม และแชทกับเพื่อนสมาชิกในฟอรั่ม หรือสแกนเข้ากลุ่ม LINE เพื่อรับไฟล์อัปเดตฟรี
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/forum')}
                className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                เปิดฟอรั่มชุมชน กดแล้วจบ
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://line.me/R/ti/p/@556fsrdw"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackLinkClick(
                    'line-home-cta',
                    'เพิ่มเพื่อน LINE @556fsrdw (หน้าแรก)',
                    'https://line.me/R/ti/p/@556fsrdw'
                  )
                }
                className="px-6 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                เพิ่มเพื่อน LINE @556fsrdw
              </a>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-300">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                รับประกันไฟล์ใช้งานได้จริง 100%
              </span>
              <span>อัปเดตสูตรฟรีเมื่อกฎหมายภาษี/ประกันสังคมเปลี่ยน</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="rounded-2xl bg-white p-4 text-center max-w-[230px] shadow-xl">
              <img
                src={getQrUrl('line', LINE_QR)}
                alt="QR Code LINE Official @556fsrdw"
                referrerPolicy="no-referrer"
                className="w-44 h-44 object-contain mx-auto"
              />
              <p className="mt-2 font-display font-bold text-sm text-[#1E1B18]">
                LINE ID: @556fsrdw
              </p>
              <p className="text-[11px] text-stone-500">สแกนเพื่อเข้ากลุ่มลูกค้า</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
