import React, { useState } from 'react';
import {
  Atom,
  Building,
  Check,
  Copy,
  Layers,
  Sigma,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type DomainKey = 'electrical' | 'physics' | 'math' | 'structural' | 'bom';

interface SolverResult {
  title: string;
  givenVariables: string[];
  formulasUsed: string[];
  steps: string[];
  finalAnswer: string;
  excelFormula: string;
  engineeringNote: string;
}

const DOMAINS: Array<{
  key: DomainKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sample: string;
}> = [
  {
    key: 'electrical',
    label: 'ไฟฟ้า (Electrical)',
    icon: Zap,
    sample:
      'มอเตอร์ 3 เฟส แรงดัน 380V กินกระแส 18A ค่า Power Factor = 0.85 จงหากำลังไฟฟ้าจริง (kW) และกำลังไฟฟ้าปรากฏ (kVA)',
  },
  {
    key: 'physics',
    label: 'ฟิสิกส์ (Physics)',
    icon: Atom,
    sample:
      'วัตถุมวล 25 kg ถูกดึงด้วยแรง 150 N ไปบนพื้นราบที่มีสัมประสิทธิ์ความเสียดทาน 0.2 เป็นระยะทาง 12 เมตร จงหาความเร่งและงานสุทธิ',
  },
  {
    key: 'math',
    label: 'คณิตศาสตร์ (Math)',
    icon: Sigma,
    sample:
      'แก้สมการและหาจุดต่ำสุดของฟังก์ชันต้นทุน C(x) = 2x^2 - 48x + 500 พร้อมคำนวณต้นทุนต่ำสุด',
  },
  {
    key: 'structural',
    label: 'โครงสร้าง (Structural)',
    icon: Building,
    sample:
      'คานยื่น (Cantilever Beam) ยาว 4 เมตร รับน้ำหนักแผ่สม่ำเสมอ w = 12 kN/m ตลอดความยาว จงหาแรงเฉือนสูงสุด Vmax และโมเมนต์ดัดสูงสุด Mmax',
  },
  {
    key: 'bom',
    label: 'สร้าง BOM & Yield',
    icon: Layers,
    sample:
      'ผลิตโต๊ะทำงาน 200 ตัว 1 ตัวใช้แผ่นไม้ 1.2 ตร.ม. (Scrap 8%) ขาเหล็ก 4 ชิ้น สกรู 16 ตัว จงคำนวณปริมาณวัตถุดิบที่ต้องเบิกทั้งหมด',
  },
];

export function SolverPage() {
  const { showToast, navigate } = useApp();
  const [domain, setDomain] = useState<DomainKey>('electrical');
  const [question, setQuestion] = useState(DOMAINS[0].sample);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDomainSelect = (key: DomainKey) => {
    setDomain(key);
    const found = DOMAINS.find((d) => d.key === key);
    if (found) setQuestion(found.sample);
    setResult(null);
  };

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, question }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        showToast({ type: 'error', title: data.error || 'ไม่สามารถคำนวณได้' });
      }
    } catch {
      showToast({ type: 'error', title: 'เชื่อมต่อเซิร์ฟเวอร์ AI ไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  };

  const copyExcel = () => {
    if (!result?.excelFormula) return;
    navigator.clipboard.writeText(result.excelFormula);
    setCopied(true);
    showToast({ type: 'success', title: 'คัดลอกสูตร Excel แล้ว' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-3xl mb-8">
        <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          AI Engineering &amp; BOM Solver
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#1E1B18] dark:text-orange-50 mt-2">
          AI แก้โจทย์คำนวณวิศวกรรม &amp; สร้าง BOM
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
          วิเคราะห์โจทย์ไฟฟ้า ฟิสิกส์ คณิตศาสตร์ โครงสร้างคาน/เสา และคำนวณสูตร BOM การผลิต พร้อมแปลงเป็นสูตร Excel เพื่อนำไปใช้งานต่อทันที
        </p>
      </div>

      {/* Domain Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DOMAINS.map((d) => {
          const Icon = d.icon;
          const active = domain === d.key;
          return (
            <button
              key={d.key}
              onClick={() => handleDomainSelect(d.key)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                active
                  ? 'bg-[#1E1B18] dark:bg-orange-500 text-white'
                  : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300 hover:border-orange-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {d.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form */}
        <form
          onSubmit={handleSolve}
          className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4"
        >
          <label className="block font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
            ระบุโจทย์หรือพารามิเตอร์ที่ต้องการคำนวณ
          </label>
          <textarea
            rows={6}
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="พิมพ์โจทย์หรือค่าตัวแปร..."
            className="w-full px-3.5 py-3 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm text-[#1E1B18] dark:text-orange-50 focus:outline-none focus:border-orange-500 leading-relaxed"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'กำลังคำนวณและตรวจสอบสูตร...' : 'คำนวณคำตอบ & สร้างสูตร Excel'}
          </button>

          <div className="pt-3 border-t border-orange-100 dark:border-orange-900/30 text-xs text-stone-500 dark:text-stone-400">
            ต้องการไฟล์ Excel BOM หรือ BOQ สำเร็จรูป?{' '}
            <button
              type="button"
              onClick={() => navigate('/category/ai-solver')}
              className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
            >
              ดูเทมเพลตวิศวกรรมทั้งหมด
            </button>
          </div>
        </form>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-8 soft-card space-y-4 animate-pulse">
              <div className="h-6 bg-orange-100 dark:bg-[#2A201B] rounded w-2/3" />
              <div className="h-20 bg-orange-100 dark:bg-[#2A201B] rounded" />
              <div className="h-32 bg-orange-100 dark:bg-[#2A201B] rounded" />
            </div>
          ) : result ? (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card space-y-6 animate-fade-in-up">
              <div>
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                  ผลการวิเคราะห์โดย AI Solver
                </p>
                <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-orange-50 mt-1">
                  {result.title}
                </h2>
              </div>

              <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 p-4">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                  คำตอบสุดท้าย
                </p>
                <p className="font-display font-bold text-lg sm:text-xl text-[#1E1B18] dark:text-orange-50 mt-1 tabular-nums">
                  {result.finalAnswer}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-orange-50/60 dark:bg-[#2A201B] p-4">
                  <p className="font-display font-semibold text-xs text-stone-500 dark:text-stone-400 mb-2">
                    ตัวแปรที่กำหนด
                  </p>
                  <ul className="space-y-1 text-xs sm:text-sm text-[#1E1B18] dark:text-stone-200">
                    {result.givenVariables.map((v, i) => (
                      <li key={i}>• {v}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-orange-50/60 dark:bg-[#2A201B] p-4">
                  <p className="font-display font-semibold text-xs text-stone-500 dark:text-stone-400 mb-2">
                    สูตรหลักที่ใช้
                  </p>
                  <ul className="space-y-1 text-xs sm:text-sm font-mono text-orange-700 dark:text-orange-400">
                    {result.formulasUsed.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50 mb-2.5">
                  ขั้นตอนการคำนวณ
                </h3>
                <ol className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                  {result.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="font-mono font-bold text-orange-600 dark:text-orange-400 shrink-0">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl bg-[#1E1B18] text-white p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-amber-400">
                    สูตร Excel พร้อมนำไปวางใช้งาน
                  </span>
                  <button
                    onClick={copyExcel}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'คัดลอกแล้ว' : 'คัดลอกสูตร'}
                  </button>
                </div>
                <code className="block font-mono text-xs sm:text-sm text-orange-300 break-all">
                  {result.excelFormula}
                </code>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400">
                คำแนะนำเพิ่มเติม: {result.engineeringNote}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-10 text-center soft-card">
              <p className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                เลือกหมวดโจทย์แล้วกดคำนวณได้เลย
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                ระบบจะแสดงวิธีทำ สูตรที่ใช้ คำตอบพร้อมหน่วย และสูตร Excel ให้ทันที
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
