import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BRAND_LOGO =
  '/assets/aistudio/810624000_983971044712451_6466500635178443708_n_81f9a476.jpg';

export function Footer() {
  const { navigate, showToast, uniqueVisitors } = useApp();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        showToast({ type: 'success', title: data.message });
      } else {
        showToast({ type: 'error', title: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#231915] text-stone-300 border-t border-orange-950/60">
      {/* Newsletter Band */}
      <div className="border-b border-orange-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              รับเทมเพลต Excel ฟรีอัปเดตใหม่ทุกเดือนจาก กดแล้วจบ
            </h3>
            <p className="text-sm text-stone-400 mt-1">
              รวมเทคนิคสูตรลัดบัญชี สต๊อก HR และแจ้งเตือนเทมเพลตออกใหม่ก่อนใคร
            </p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-2 text-orange-300 text-sm font-medium bg-orange-950/60 border border-orange-800/60 px-4 py-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-orange-400" />
              สมัครรับข่าวสารสำเร็จแล้ว ขอบคุณครับ
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5">
              <div className="relative sm:w-72">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="อีเมลของคุณ (เช่น name@company.co.th)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1A120F] border border-orange-900/60 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                {submitting ? 'กำลังบันทึก...' : 'รับเทมเพลตฟรี'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 4 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <img
              src={BRAND_LOGO}
              alt="กดแล้วจบ Kodraewjob Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-400"
            />
            <div>
              <p className="font-display font-bold text-white text-lg leading-tight">
                กดแล้วจบ
              </p>
              <p className="text-xs text-orange-400">Kodraewjob Digital Marketplace</p>
            </div>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">
            ศูนย์รวมเทมเพลต Excel, Google Sheets, VBA, AppSheet และเครื่องมือ AI คำนวณวิศวกรรมสำหรับธุรกิจไทย ใช้งานจริงโดย 140+ องค์กร
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white mb-4">หมวดหมู่ยอดนิยม</h4>
          <ul className="space-y-2.5 text-sm text-stone-400">
            <li>
              <button onClick={() => navigate('/category/excel')} className="hover:text-orange-400 transition-colors">
                Excel Templates ธุรกิจ
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/vba')} className="hover:text-orange-400 transition-colors">
                ระบบอัตโนมัติ VBA Macro
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/google-sheets')} className="hover:text-orange-400 transition-colors">
                Google Sheets ออนไลน์
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/category/appsheet')} className="hover:text-orange-400 transition-colors">
                AppSheet แอปองค์กร
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/solve')} className="hover:text-orange-400 transition-colors">
                AI Solver แก้โจทย์วิศวกรรม
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white mb-4">ชุมชนและบริการ</h4>
          <ul className="space-y-2.5 text-sm text-stone-400">
            <li>
              <button onClick={() => navigate('/forum')} className="hover:text-orange-400 transition-colors">
                ฟอรั่มชุมชน &amp; แชทสมาชิก
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/templates')} className="hover:text-orange-400 transition-colors">
                รวมเทมเพลตทั้งหมด (59 รายการ)
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/pricing')} className="hover:text-orange-400 transition-colors">
                แพ็กเกจราคา ฟรี / 99 / 199
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/solutions')} className="hover:text-orange-400 transition-colors">
                โซลูชันเฉพาะทาง (BOM / โครงสร้าง)
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/about')} className="hover:text-orange-400 transition-colors">
                เกี่ยวกับเรา &amp; บทความ
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white mb-4">ช่องทางติดต่อ &amp; สถิติเว็บ</h4>
          <div className="space-y-3 text-sm text-stone-400">
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              LINE Official: @556fsrdw
            </button>
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Eye className="w-4 h-4 text-orange-400" />
              <span>ผู้เข้าชมเว็บไซต์จริง (Unique):</span>
              <span className="font-display font-bold text-orange-300 tabular-nums">
                {uniqueVisitors.toLocaleString()} คน
              </span>
            </div>
            <div className="pt-1 flex flex-wrap gap-2 text-xs text-stone-300">
              <span className="px-2.5 py-1 rounded-md bg-[#1A120F] border border-orange-900/50">
                PromptPay QR
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#1A120F] border border-orange-900/50">
                KBANK / SCB / BBL / KTB
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#1A120F] border border-orange-900/50">
                TrueMoney
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-orange-950/70 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>© 2027 Kodraewjob Digital Marketplace. สงวนลิขสิทธิ์ทุกประการ By Art Kitthana2027</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              SSL Secured &amp; Login-Verified Download
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
