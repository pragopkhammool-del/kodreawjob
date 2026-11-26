import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  Play,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  downloadFormulasWorkbook,
  EXCEL_FORMULAS_50,
  ExcelFormulaItem,
  FORMULA_CATEGORIES,
  FormulaCategory,
} from '../data/excelFormulas50';

function numberToThaiBaht(amount: number): string {
  if (!Number.isFinite(amount)) return 'ศูนย์บาทถ้วน';
  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  const readInt = (numStr: string): string => {
    let out = '';
    const len = numStr.length;
    for (let i = 0; i < len; i++) {
      const d = Number(numStr[i]);
      const pos = len - i - 1;
      if (d === 0) continue;
      if (pos === 1 && d === 1) out += 'สิบ';
      else if (pos === 1 && d === 2) out += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && len > 1 && numStr[len - 2] !== '0') out += 'เอ็ด';
      else out += digits[d] + units[pos];
    }
    return out || 'ศูนย์';
  };
  const fixed = Math.abs(amount).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const prefix = amount < 0 ? 'ลบ' : '';
  let intText = '';
  if (intPart.length > 6) {
    const high = intPart.slice(0, intPart.length - 6);
    const low = intPart.slice(intPart.length - 6);
    intText = `${readInt(high)}ล้าน${Number(low) > 0 ? readInt(low) : ''}`;
  } else {
    intText = readInt(intPart);
  }
  const satang = Number(decPart);
  if (satang === 0) return `${prefix}${intText}บาทถ้วน`;
  return `${prefix}${intText}บาท${readInt(decPart)}สตางค์`;
}

export function LearnFormulasPage() {
  const { route, navigate, showToast, trackLinkClick } = useApp();
  const isEbookHighlight = route.includes('ebook=30-formulas');

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | FormulaCategory>('all');
  const [selectedFormula, setSelectedFormula] = useState<ExcelFormulaItem>(EXCEL_FORMULAS_50[0]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  // Interactive sandbox editable numbers for live calculation
  const [valA, setValA] = useState(1500);
  const [valB, setValB] = useState(2000);
  const [valC, setValC] = useState(1000);
  const [ratePct, setRatePct] = useState(6);
  const [months, setMonths] = useState(36);
  const [textInput, setTextInput] = useState('  somchai  jaidee  ');
  const [conditionThreshold, setConditionThreshold] = useState(1400);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://kodraewjob.com/learn';
    return `${window.location.origin}/learn`;
  }, []);

  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}&quote=${encodeURIComponent(
    'แจกฟรี! คู่มือเรียนรู้ 50 สูตร Excel เบื้องต้นพร้อมตัวอย่างไฟล์ฝึกทำจริง จาก กดแล้วจบ (Kodraewjob)'
  )}`;

  const lineShareHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(
    'แจกฟรี! เรียนรู้ 50 สูตร Excel เบื้องต้นเข้าใจง่าย พร้อมไฟล์ตัวอย่างให้โหลดฝึกทำ — กดแล้วจบ'
  )}`;

  const filteredFormulas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EXCEL_FORMULAS_50.filter((f) => {
      if (activeCategory !== 'all' && f.category !== activeCategory) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.thaiName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  const liveSandboxOutput = useMemo(() => {
    const arr = [valA, valB, valC];
    const sum = valA + valB + valC;
    const avg = sum / 3;
    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);
    const name = selectedFormula.name.toUpperCase();

    if (name === 'SUM') return `${sum.toLocaleString('th-TH')} บาท`;
    if (name === 'AVERAGE') return `${avg.toLocaleString('th-TH', { maximumFractionDigits: 2 })} บาท`;
    if (name === 'COUNT' || name === 'COUNTA') return `3 รายการ`;
    if (name === 'MIN') return `${minVal.toLocaleString('th-TH')} บาท`;
    if (name === 'MAX') return `${maxVal.toLocaleString('th-TH')} บาท`;
    if (name === 'ROUND' || name === 'ROUNDUP' || name === 'ROUNDDOWN') {
      const target = avg;
      if (name === 'ROUNDUP') return Math.ceil(target).toLocaleString('th-TH');
      if (name === 'ROUNDDOWN') return Math.floor(target).toLocaleString('th-TH');
      return Math.round(target).toLocaleString('th-TH');
    }
    if (name === 'SUMIF' || name === 'SUMIFS') {
      const above = arr.filter((v) => v >= conditionThreshold).reduce((s, n) => s + n, 0);
      return `${above.toLocaleString('th-TH')} บาท (รายการ >= ${conditionThreshold.toLocaleString()})`;
    }
    if (name === 'COUNTIF' || name === 'COUNTIFS') {
      const cnt = arr.filter((v) => v >= conditionThreshold).length;
      return `${cnt} รายการ (ที่ >= ${conditionThreshold.toLocaleString()})`;
    }
    if (name === 'IF' || name === 'IFS' || name === 'AND' || name === 'OR') {
      return sum >= conditionThreshold * 3 ? 'ผ่านเป้า (บรรลุเป้าหมาย)' : 'ต้องกระตุ้นยอดเพิ่ม';
    }
    if (name === 'BAHTTEXT') return numberToThaiBaht(sum);
    if (name === 'PMT') {
      const r = ratePct / 100 / 12;
      const principal = sum * 100;
      const pmt =
        r === 0
          ? principal / Math.max(1, months)
          : (principal * r) / (1 - Math.pow(1 + r, -Math.max(1, months)));
      return `ผ่อน ${Math.round(pmt).toLocaleString('th-TH')} บาท/เดือน (จากยอดกู้ ${principal.toLocaleString()} บ.)`;
    }
    if (name === 'FV') {
      const r = ratePct / 100 / 12;
      const fv =
        r === 0
          ? valA * months
          : valA * ((Math.pow(1 + r, months) - 1) / r);
      return `เงินออมปลายงวด ≈ ${Math.round(fv).toLocaleString('th-TH')} บาท`;
    }
    if (name === 'PV') {
      const r = ratePct / 100 / 12;
      const pv =
        r === 0 ? valA * months : valA * ((1 - Math.pow(1 + r, -months)) / r);
      return `มูลค่าปัจจุบัน ≈ ${Math.round(pv).toLocaleString('th-TH')} บาท`;
    }
    if (name === 'TRIM') return textInput.trim().replace(/\s+/g, ' ');
    if (name === 'UPPER') return textInput.trim().toUpperCase();
    if (name === 'LOWER') return textInput.trim().toLowerCase();
    if (name === 'PROPER') {
      return textInput
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (name === 'LEN') return `${textInput.trim().length} ตัวอักษร`;
    if (name === 'LEFT') return textInput.trim().slice(0, 4);
    if (name === 'RIGHT') return textInput.trim().slice(-4);
    if (name === 'MID') return textInput.trim().slice(2, 6);
    if (name === 'TEXT') return `${sum.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`;

    return selectedFormula.exampleResult;
  }, [selectedFormula, valA, valB, valC, ratePct, months, textInput, conditionThreshold]);

  const handleCopyFormula = (item: ExcelFormulaItem) => {
    navigator.clipboard?.writeText(item.exampleFormula);
    setCopiedId(item.id);
    showToast({
      type: 'success',
      title: `คัดลอกสูตร ${item.name} แล้ว`,
      description: item.exampleFormula,
    });
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownload = (mode: 'all50' | 'ebook30' | 'single', single?: ExcelFormulaItem) => {
    downloadFormulasWorkbook(mode, single);
    trackLinkClick(
      `learn-download-${mode}`,
      mode === 'all50'
        ? 'ดาวน์โหลดไฟล์ฝึก 50 สูตร Excel'
        : mode === 'ebook30'
          ? 'ดาวน์โหลด Ebook 30 สูตร Excel ฟรี'
          : `ดาวน์โหลดแบบฝึกหัดสูตร ${single?.name}`,
      '/learn'
    );
    showToast({
      type: 'success',
      title: 'เริ่มดาวน์โหลดไฟล์ Excel ฝึกปฏิบัติแล้ว',
      description: 'เปิดไฟล์ด้วย Microsoft Excel ได้ทันที มีชีตข้อมูลพร้อมสูตรตัวอย่างให้ลองแก้',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner */}
      <section className="rounded-2xl bg-gradient-to-br from-[#231915] via-[#2F211B] to-orange-950 text-white p-6 sm:p-10 soft-card border border-orange-900/50 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-bold tracking-wider uppercase text-orange-400 inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              EXCEL LEARNING HUB · กดแล้วจบ (KODRAEWJOB)
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-4xl leading-tight">
              เรียนรู้ 50 สูตร Excel เบื้องต้น ง่าย ๆ พร้อมไฟล์ตัวอย่างให้ลองทำจริง
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              สรุปสูตรสำคัญที่ใช้จริงในงานขาย สต๊อก บัญชี HR และการเงิน อธิบายภาษาไทยเข้าใจง่าย มีสนามทดลองสูตรสดและไฟล์ Excel พร้อมสูตรผูกไว้ให้ดาวน์โหลดฟรี
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleDownload('all50')}
              className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-lg whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              โหลดไฟล์ฝึก 50 สูตร (.xls)
            </button>
            <button
              type="button"
              onClick={() => handleDownload('ebook30')}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Ebook ฟรี: 30 สูตรใช้จริง
            </button>
          </div>
        </div>

        {isEbookHighlight && (
          <div className="rounded-xl bg-emerald-950/70 border border-emerald-500/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-emerald-100">
              <strong className="text-emerald-300">Ebook ฟรี: 30 สูตร Excel ใช้จริง</strong> — กดปุ่ม &ldquo;Ebook ฟรี: 30 สูตรใช้จริง&rdquo; ด้านขวาบนเพื่อดาวน์โหลดไฟล์สรุปและชีตฝึกปฏิบัติได้ทันที
            </p>
            <button
              type="button"
              onClick={() => handleDownload('ebook30')}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#1E1B18] text-xs font-bold whitespace-nowrap"
            >
              ดาวน์โหลด Ebook 30 สูตรเลย
            </button>
          </div>
        )}

        {/* Social Share Bar (Facebook & LINE) */}
        <div className="pt-4 border-t border-orange-900/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-stone-300 inline-flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-orange-400" />
              แชร์คลังความรู้ 50 สูตรให้เพื่อน:
            </span>
            <a
              href={fbShareHref}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackLinkClick('share-fb-learn', 'แชร์ Facebook หน้าเรียนรู้ 50 สูตร', fbShareHref)
              }
              className="px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              แชร์ Facebook
            </a>
            <a
              href={lineShareHref}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackLinkClick('share-line-learn', 'แชร์ LINE หน้าเรียนรู้ 50 สูตร', lineShareHref)
              }
              className="px-3.5 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              แชร์ LINE
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl);
                setCopiedShareUrl(true);
                showToast({ type: 'success', title: 'คัดลอกลิงก์หน้าเรียนรู้แล้ว' });
                setTimeout(() => setCopiedShareUrl(false), 1800);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              {copiedShareUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedShareUrl ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/webapps-demo')}
            className="text-xs font-semibold text-orange-300 hover:text-orange-200 inline-flex items-center gap-1"
          >
            อยากลองระบบ Web App สำเร็จรูป? ดูตัวอย่าง 10 แอป
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Interactive Live Formula Sandbox */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Simulation Stage */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 dark:border-orange-900/40 pb-4">
            <div>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                ห้องทดลองสูตรสด (Interactive Sandbox)
              </p>
              <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-orange-50 mt-0.5">
                #{selectedFormula.id} {selectedFormula.name} — {selectedFormula.thaiName}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleDownload('single', selectedFormula)}
              className="px-3.5 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              โหลดตัวอย่างสูตรนี้
            </button>
          </div>

          {/* Sample Spreadsheet Table */}
          <div className="overflow-x-auto rounded-xl border border-orange-200/80 dark:border-orange-900/40">
            <table className="w-full text-xs sm:text-sm text-left tabular-nums">
              <thead className="bg-orange-50 dark:bg-[#2A201B] text-[#1E1B18] dark:text-orange-100">
                <tr>
                  {selectedFormula.sampleTable.headers.map((h) => (
                    <th key={h} className="px-3.5 py-2.5 font-semibold border-b border-orange-200/70 dark:border-orange-900/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                {selectedFormula.sampleTable.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2 text-stone-700 dark:text-stone-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Editable Test Inputs */}
          <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200/80 dark:border-orange-900/40 p-4 space-y-3">
            <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
              ปรับตัวเลขจำลองเพื่อทดสอบการทำงานของสูตรทันที:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">ค่าช่อง B2</label>
                <input
                  type="number"
                  value={valA}
                  onChange={(e) => setValA(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">ค่าช่อง B3</label>
                <input
                  type="number"
                  value={valB}
                  onChange={(e) => setValB(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">ค่าช่อง B4</label>
                <input
                  type="number"
                  value={valC}
                  onChange={(e) => setValC(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">เกณฑ์เงื่อนไข / ดอกเบี้ย%</label>
                <input
                  type="number"
                  value={['PMT', 'FV', 'PV'].includes(selectedFormula.name) ? ratePct : conditionThreshold}
                  onChange={(e) =>
                    ['PMT', 'FV', 'PV'].includes(selectedFormula.name)
                      ? setRatePct(Number(e.target.value) || 0)
                      : setConditionThreshold(Number(e.target.value) || 0)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-xs font-mono tabular-nums"
                />
              </div>
            </div>

            {['TRIM', 'UPPER', 'LOWER', 'PROPER', 'LEN', 'LEFT', 'RIGHT', 'MID'].includes(
              selectedFormula.name
            ) && (
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">ข้อความทดสอบ (Text Cell A2)</label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-xs font-mono"
                />
              </div>
            )}

            {['PMT', 'FV', 'PV'].includes(selectedFormula.name) && (
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">จำนวนงวด (เดือน)</label>
                <input
                  type="number"
                  min={1}
                  max={360}
                  value={months}
                  onChange={(e) => setMonths(Math.max(1, Number(e.target.value) || 1))}
                  className="w-32 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#14100E] border border-orange-200 dark:border-orange-900/50 text-xs font-mono tabular-nums"
                />
              </div>
            )}
          </div>

          {/* Live Output Box */}
          <div className="rounded-xl bg-[#1E1B18] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-orange-400 font-bold">
                ผลลัพธ์จากการคำนวณสูตรจริง
              </p>
              <p className="font-mono text-lg sm:text-xl font-bold text-emerald-300 tabular-nums mt-0.5">
                {liveSandboxOutput}
              </p>
            </div>
            <code className="px-3 py-1.5 rounded-lg bg-black/40 border border-stone-700 text-xs font-mono text-orange-200">
              {selectedFormula.exampleFormula}
            </code>
          </div>
        </div>

        {/* Right: Formula Guide Card */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-5">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            <span>{selectedFormula.category}</span>
            <span aria-hidden="true"> · </span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              ระดับ{selectedFormula.level}
            </span>
          </div>

          <div>
            <h3 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50">
              ={selectedFormula.name}()
            </h3>
            <p className="text-sm text-stone-700 dark:text-stone-300 mt-2 leading-relaxed">
              {selectedFormula.description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              รูปแบบไวยากรณ์ (Syntax)
            </p>
            <div className="p-3 rounded-xl bg-orange-50/80 dark:bg-[#2A201B] border border-orange-200/70 dark:border-orange-900/40 font-mono text-xs sm:text-sm text-[#1E1B18] dark:text-orange-100 break-all">
              {selectedFormula.syntax}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                ตัวอย่างสูตรพร้อมคัดลอก
              </p>
              <button
                type="button"
                onClick={() => handleCopyFormula(selectedFormula)}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
              >
                {copiedId === selectedFormula.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedId === selectedFormula.id ? 'คัดลอกแล้ว' : 'คัดลอกสูตร'}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#1E1B18] text-emerald-300 font-mono text-xs sm:text-sm break-all">
              {selectedFormula.exampleFormula}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <p className="font-bold inline-flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              เคล็ดลับใช้งานจริง:
            </p>
            <p>{selectedFormula.tip}</p>
          </div>

          <div className="pt-2 border-t border-orange-100 dark:border-orange-900/40 flex flex-wrap gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}&quote=${encodeURIComponent(
                `สูตร Excel ใช้จริง #${selectedFormula.id}: ${selectedFormula.name} (${selectedFormula.thaiName}) — ${selectedFormula.exampleFormula} จาก กดแล้วจบ`
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackLinkClick(
                  `share-fb-formula-${selectedFormula.id}`,
                  `แชร์ Facebook สูตร ${selectedFormula.name}`,
                  shareUrl
                )
              }
              className="flex-1 py-2 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold text-center"
            >
              แชร์สูตรนี้ไป Facebook
            </a>
            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
                shareUrl
              )}&text=${encodeURIComponent(
                `สูตร Excel: ${selectedFormula.name} (${selectedFormula.thaiName}) -> ${selectedFormula.exampleFormula}`
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackLinkClick(
                  `share-line-formula-${selectedFormula.id}`,
                  `แชร์ LINE สูตร ${selectedFormula.name}`,
                  shareUrl
                )
              }
              className="flex-1 py-2 px-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold text-center"
            >
              แชร์สูตรนี้ไป LINE
            </a>
          </div>
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสูตร เช่น SUMIF, XLOOKUP, BAHTTEXT, ภาษี..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-500'
              }`}
            >
              ทั้งหมด ({EXCEL_FORMULAS_50.length})
            </button>
            {FORMULA_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 50 Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFormulas.map((item) => {
            const isSelected = selectedFormula.id === item.id;
            return (
              <article
                key={item.id}
                className={`rounded-2xl bg-white dark:bg-[#1F1815] border p-5 soft-card flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20'
                    : 'border-orange-200/80 dark:border-orange-900/40 hover:border-orange-400'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                      #{String(item.id).padStart(2, '0')} · {item.category}
                    </span>
                    <span>{item.level}</span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                      {item.name} — <span className="text-sm font-semibold">{item.thaiName}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-[#2A201B] font-mono text-xs text-[#1E1B18] dark:text-orange-100 break-all">
                    {item.exampleFormula}
                    <span className="block text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                      ผลลัพธ์: {item.exampleResult}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-orange-100 dark:border-orange-900/40 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFormula(item);
                      window.scrollTo({ top: 260, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    ทดลองสูตร
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyFormula(item)}
                      className="p-1.5 rounded-lg border border-orange-200 dark:border-orange-900/50 text-stone-600 dark:text-stone-300 hover:text-orange-600"
                      title="คัดลอกสูตร"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload('single', item)}
                      className="p-1.5 rounded-lg border border-orange-200 dark:border-orange-900/50 text-stone-600 dark:text-stone-300 hover:text-orange-600"
                      title="ดาวน์โหลดไฟล์ฝึกสูตรนี้"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
