import React, { useEffect, useState } from 'react';
import {
  Calculator,
  ChevronRight,
  Code2,
  Database,
  Download,
  ExternalLink,
  Filter,
  LayoutDashboard,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
  TableProperties,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

const VBA_SAMPLE_SNIPPET = `Attribute VB_Name = "Mod_TaxInvoice_PDF"
Option Explicit

Public Sub Generate_ThaiTaxInvoice_PDF()
    Dim ws As Worksheet, invNo As String, savePath As String
    Set ws = ThisWorkbook.Sheets("TaxInvoice_Form")
    invNo = "INV-" & Format(Date, "yyyymm") & "-" & Format(ws.Range("B2").Value, "0000")
    savePath = ThisWorkbook.Path & "\\" & invNo & ".pdf"
    ws.ExportAsFixedFormat Type:=xlTypePDF, Filename:=savePath, Quality:=xlQualityStandard
    ws.Range("B2").Value = Val(ws.Range("B2").Value) + 1
    MsgBox "สร้างใบกำกับภาษี PDF สำเร็จ: " & savePath, vbInformation, "กดแล้วจบ VBA"
End Sub`;

interface CatalogPageProps {
  initialCategory?: string;
}

export function CatalogPage({ initialCategory = '' }: CatalogPageProps) {
  const { route, navigate, categories, downloadProtectedFile } = useApp();

  const urlParams = new URLSearchParams(route.split('?')[1] || '');
  const [level, setLevel] = useState<string>(urlParams.get('level') || '');
  const [category, setCategory] = useState<string>(
    initialCategory || urlParams.get('category') || ''
  );
  const [search, setSearch] = useState<string>(urlParams.get('search') || '');
  const [sort, setSort] = useState<string>(urlParams.get('sort') || 'popular');
  const [page, setPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(route.split('?')[1] || '');
    setLevel(params.get('level') || '');
    setCategory(initialCategory || params.get('category') || '');
    setSearch(params.get('search') || '');
    setPage(1);
  }, [route, initialCategory]);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (level) qs.set('level', level);
    if (category) qs.set('category', category);
    if (search.trim()) qs.set('search', search.trim());
    if (sort) qs.set('sort', sort);
    qs.set('page', String(page));
    qs.set('limit', '12');

    fetch(`/api/products?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data.items) ? data.items : []);
        setTotal(Number(data.total || 0));
        setTotalPages(Number(data.totalPages || 1));
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [level, category, search, sort, page]);

  const resetFilters = () => {
    setLevel('');
    setCategory('');
    setSearch('');
    setSort('popular');
    setPage(1);
    navigate('/templates');
  };

  const levelOptions = [
    { value: '', label: 'ทุกระดับราคา' },
    { value: 'free', label: 'ฟรี (฿0) — 19 ไฟล์' },
    { value: 'standard', label: 'มาตรฐาน (฿99) — 10 ไฟล์' },
    { value: 'advanced', label: 'ขั้นสูง (฿199-฿299) — 30 ไฟล์' },
  ];

  const filterPanelContent = (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50 mb-3">
          ระดับราคา
        </h3>
        <div className="space-y-1.5">
          {levelOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setLevel(opt.value);
                setPage(1);
                setMobileFilterOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                level === opt.value
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-[#2A201B]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-orange-200/70 dark:border-orange-900/30">
        <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50 mb-3">
          หมวดหมู่เครื่องมือ
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => {
              setCategory('');
              setPage(1);
              setMobileFilterOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
              category === ''
                ? 'bg-[#1E1B18] dark:bg-orange-500 text-white font-semibold'
                : 'text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-[#2A201B]'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.slug);
                setPage(1);
                setMobileFilterOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                category === cat.slug
                  ? 'bg-[#1E1B18] dark:bg-orange-500 text-white font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-[#2A201B]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="w-full py-2.5 px-3 rounded-xl border border-orange-200 dark:border-orange-900/40 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:border-orange-500 flex items-center justify-center gap-2 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        ล้างตัวกรองทั้งหมด
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-orange-600 dark:hover:text-orange-400">
          หน้าแรก
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E1B18] dark:text-orange-50 font-medium">
          คลังเทมเพลตทั้งหมด
        </span>
      </nav>

      {/* Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
            คลังเทมเพลต Excel &amp; ระบบธุรกิจ
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 tabular-nums">
            พบทั้งหมด {total} รายการ พร้อมดาวน์โหลดใช้งานทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="กรองตามชื่อไฟล์..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-sm text-[#1E1B18] dark:text-orange-50 focus:outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="เรียงลำดับสินค้า"
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-sm text-[#1E1B18] dark:text-orange-50 focus:outline-none focus:border-orange-500"
          >
            <option value="popular">ยอดนิยมสูงสุด</option>
            <option value="price_asc">ราคา: ต่ำ → สูง</option>
            <option value="price_desc">ราคา: สูง → ต่ำ</option>
            <option value="rating">คะแนนรีวิวสูงสุด</option>
            <option value="newest">มาใหม่ล่าสุด</option>
          </select>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-sm font-semibold text-[#1E1B18] dark:text-orange-50 inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            ตัวกรอง
          </button>
        </div>
      </div>

      {/* Category-Specific Interactive Showcases */}
      {category === 'web-app' && (
        <section className="mb-8 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              ตัวอย่างเว็บแอป &amp; SaaS Business ERP 20 ระบบครบวงจร
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
              ลงทะเบียนบริษัท อัปโหลดโลโก้หัวเอกสาร และทดลองใช้ครบทั้ง 20 ระบบ
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              รวมระบบคลังสินค้า (SKU/Barcode/QR), POS ขายหน้าร้านตัดสต๊อกจริง, บัญชี P&amp;L, ใบกำกับภาษี/ใบเสร็จ/QT/PO, เงินเดือน HR + สลิป PDF, ผลิตโรงงาน MES และโลจิสติกส์ พร้อมดาวน์โหลดสคริปต์ MySQL 8+ (.sql) สำหรับ phpMyAdmin
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/webapp')}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold inline-flex items-center gap-2 shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                เปิดใช้งาน Web App ERP (20 ระบบ)
              </button>
              <a
                href="/api/erp/export/mysql-sql"
                className="px-5 py-3 rounded-xl bg-[#1E1B18] hover:bg-stone-800 text-white text-sm font-semibold inline-flex items-center gap-2"
              >
                <Database className="w-4 h-4 text-orange-400" />
                ดาวน์โหลด database.sql (MySQL)
              </a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/src/assets/images/erp_saas_suite_preview_1795679556912.jpg"
              alt="ตัวอย่าง Web App Dashboard และ SaaS Business ERP 20 ระบบ"
              referrerPolicy="no-referrer"
              className="w-full rounded-xl border border-orange-200 dark:border-orange-900/50 object-cover shadow-md"
            />
          </div>
        </section>
      )}

      {category === 'vba' && (
        <section className="mb-8 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-4">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                Excel VBA Automation · มาตรฐานพร้อมใช้งานจริง
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
                สร้างไฟล์ Excel.VBA แยกใบกำกับภาษี &amp; สลิป PDF ในคลิกเดียว
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                โค้ด VBA เขียนแบบ Option Explicit ปลอดภัย อ่านง่าย รองรับรันเลขที่เอกสารอัตโนมัติ ส่งออก PDF ระดับ A4 ทันที (ล็อกอิน Gmail ก่อนดาวน์โหลดชุดไฟล์ตัวอย่างและซอร์สโค้ด .bas)
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    downloadProtectedFile(
                      '/api/vba/download/tax-invoice?format=xlsx',
                      'kodraewjob-vba-tax-invoice.xlsx'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  โหลด Excel VBA ใบกำกับภาษี (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadProtectedFile(
                      '/api/vba/download/payroll-payslip?format=xlsx',
                      'kodraewjob-vba-payroll.xlsx'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#1E1B18] hover:bg-stone-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-orange-400" />
                  โหลด Excel VBA เงินเดือน (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadProtectedFile(
                      '/api/vba/download/tax-invoice?format=bas',
                      'kodraewjob-vba-tax-invoice.bas'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl border border-orange-300 dark:border-orange-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5"
                >
                  โหลดโมดูลโค้ด (.bas)
                </button>
              </div>
            </div>
            <div className="lg:col-span-6 space-y-3">
              <img
                src="/src/assets/images/vba_automation_excel_1795679554655.jpg"
                alt="ตัวอย่างหน้าจอมาตรฐาน Excel VBA Automation"
                referrerPolicy="no-referrer"
                className="w-full rounded-xl border border-orange-200 dark:border-orange-900/50 object-cover shadow-md"
              />
              <pre className="p-4 rounded-xl bg-[#1E1B18] text-orange-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
                {VBA_SAMPLE_SNIPPET}
              </pre>
            </div>
          </div>
        </section>
      )}

      {category === 'google-sheets' && (
        <section className="mb-8 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
              <TableProperties className="w-4 h-4" />
              Google Sheets Cloud Sync · ลิงก์เข้าใช้งานจริงบน Google
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
              ตัวอย่าง Google Sheets พร้อมลิงก์เปิด Worksheet ใน Google จริง
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              ทำงานร่วมกันหลายคนแบบเรียลไทม์ผ่านมือถือและคอมพิวเตอร์ เพียงดาวน์โหลดไฟล์เทมเพลตด้านล่างแล้วกดเปิด Google Sheets เพื่อนำเข้า (File → Import) ใช้งานออนไลน์ได้ทันที
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://docs.google.com/spreadsheets/u/0/create"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center gap-2 shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                สร้าง Google Sheets ใหม่บน Google จริง
              </a>
              <a
                href="https://docs.google.com/spreadsheets/u/0/"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl border border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm font-semibold inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                เปิดหน้าคลัง Google Sheets ของคุณ
              </a>
            </div>
          </div>
          <div className="lg:col-span-6">
            <img
              src="/src/assets/images/google_sheets_cloud_1795679554880.jpg"
              alt="ตัวอย่างการใช้งาน Google Sheets แบบ Cloud Sync"
              referrerPolicy="no-referrer"
              className="w-full rounded-xl border border-orange-200 dark:border-orange-900/50 object-cover shadow-md"
            />
          </div>
        </section>
      )}

      {(category === 'appsheet' || category === 'ai-solver') && (
        <section className="mb-8 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              AppSheet No-Code &amp; โจทย์คำนวณวิศวกรรม
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
              เชื่อมต่อแอปมือถือ AppSheet ร่วมกับเครื่องมือคำนวณ &amp; วิศวกรรม
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              บันทึกข้อมูลหน้างาน สแกน QR ทรัพย์สิน อนุมัติใบขอซื้อ PR ผ่านมือถือและแท็บเล็ต พร้อมเครื่องมือ AI Solver คำนวณไฟฟ้า ฟิสิกส์ คณิต โครงสร้าง BOQ และ BOM โรงงาน
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/solve')}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold inline-flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                เปิด AI Solver คำนวณวิศวกรรม
              </button>
              <a
                href="https://www.appsheet.com/"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl border border-orange-300 dark:border-orange-800 text-sm font-semibold inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-orange-500" />
                เปิดแพลตฟอร์ม Google AppSheet
              </a>
            </div>
          </div>
          <div className="lg:col-span-6">
            <img
              src="/src/assets/images/appsheet_nocode_mobile_1795679555658.jpg"
              alt="ตัวอย่าง AppSheet No-Code มือถือและแท็บเล็ตสำหรับวิศวกรรมและจัดซื้อ"
              referrerPolicy="no-referrer"
              className="w-full rounded-xl border border-orange-200 dark:border-orange-900/50 object-cover shadow-md"
            />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
            <div className="flex items-center gap-2 text-sm font-display font-bold text-[#1E1B18] dark:text-orange-50 mb-5">
              <Filter className="w-4 h-4 text-orange-500" />
              ตัวกรองเทมเพลต
            </div>
            {filterPanelContent}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-orange-100 dark:bg-[#2A201B]" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-orange-100 dark:bg-[#2A201B] rounded w-1/2" />
                    <div className="h-5 bg-orange-100 dark:bg-[#2A201B] rounded w-4/5" />
                    <div className="h-3 bg-orange-100 dark:bg-[#2A201B] rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-12 text-center soft-card">
              <p className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                ไม่พบเทมเพลตที่ตรงกับเงื่อนไขการค้นหา
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                ลองเปลี่ยนคำค้นหา หรือดูเทมเพลตทั้งหมดในระบบ
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
              >
                แสดงเทมเพลตทั้งหมด
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => {
                          setPage(pNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold tabular-nums transition-colors ${
                          page === pNum
                            ? 'bg-[#1E1B18] dark:bg-orange-500 text-white'
                            : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-500'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-80 max-w-full bg-white dark:bg-[#1F1815] h-full p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                ตัวกรองสินค้า
              </h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                aria-label="ปิดตัวกรอง"
                className="p-2 rounded-xl text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterPanelContent}
          </div>
        </div>
      )}
    </div>
  );
}
