import React, { useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';

const LINE_QR_URL = '/assets/aistudio/L_556fsrdw_GW_6a59b22f.png';

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'line' | 'ai'>('line');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([
    {
      role: 'bot',
      text: 'สวัสดีครับ! ผมคือผู้ช่วย AI ประจำ กดแล้วจบ (Kodraewjob) อยากให้ช่วยแนะนำไฟล์ Excel สำหรับงานบัญชี สต๊อก HR หรือการผลิตบอกได้เลยครับ',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.reply || data.error || 'ขออภัยครับ กรุณาลองใหม่อีกครั้ง',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'เชื่อมต่อไม่สำเร็จ กรุณาทักแชท LINE @556fsrdw ได้เลยครับ' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="mb-3 w-[340px] sm:w-[370px] rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 soft-card overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-[#231915] px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="font-display font-semibold text-sm">LINE OA &amp; ผู้ช่วย AI</p>
                <p className="text-[11px] text-orange-200/80">@556fsrdw · กดแล้วจบ</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="ปิดหน้าต่างแชท"
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Segmented Switch */}
          <div className="p-2 bg-[#FFF7ED] dark:bg-[#2A201B] flex gap-1">
            <button
              onClick={() => setTab('line')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                tab === 'line'
                  ? 'bg-white dark:bg-[#1F1815] text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              LINE กลุ่มลูกค้า (@556fsrdw)
            </button>
            <button
              onClick={() => setTab('ai')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                tab === 'ai'
                  ? 'bg-white dark:bg-[#1F1815] text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              ถาม AI แนะนำไฟล์
            </button>
          </div>

          {tab === 'line' ? (
            <div className="p-5 text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-white border border-orange-200">
                <img
                  src={LINE_QR_URL}
                  alt="QR Code LINE Official @556fsrdw"
                  referrerPolicy="no-referrer"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-[#1E1B18] dark:text-white">
                  สแกนเข้ากลุ่ม LINE ลูกค้า (140+ ธุรกิจ)
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  รับไฟล์อัปเดตฟรี สอบถามสูตร Excel และแจ้งโอนสลิปผ่าน LINE ID:{' '}
                  <span className="font-mono font-semibold text-orange-600">@556fsrdw</span>
                </p>
              </div>
              <a
                href="https://line.me/R/ti/p/@556fsrdw"
                target="_blank"
                rel="noreferrer"
                className="block w-full py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-semibold transition-colors"
              >
                เพิ่มเพื่อน LINE @556fsrdw
              </a>
            </div>
          ) : (
            <div className="flex flex-col h-[340px]">
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-sm">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-[#FFF7ED] dark:bg-[#2A201B] text-[#1E1B18] dark:text-stone-100'
                      }`}
                    >
                      {m.role === 'bot' && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400 mb-1">
                          <Bot className="w-3.5 h-3.5" />
                          ผู้ช่วย AI กดแล้วจบ
                        </div>
                      )}
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#FFF7ED] dark:bg-[#2A201B] rounded-2xl px-4 py-2.5 text-xs text-stone-500">
                      กำลังค้นหาเทมเพลตที่เหมาะกับคุณ...
                    </div>
                  </div>
                )}
              </div>
              <form
                onSubmit={sendChat}
                className="p-2.5 border-t border-orange-100 dark:border-orange-900/40 flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์คำถาม เช่น หาไฟล์สต๊อก..."
                  className="flex-1 px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] text-xs sm:text-sm text-[#1E1B18] dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  aria-label="ส่งข้อความ"
                  className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Compact Floating Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg text-xs sm:text-sm font-semibold transition-transform hover:-translate-y-0.5"
      >
        <Sparkles className="w-4 h-4" />
        <span className="whitespace-nowrap">LINE @556fsrdw / AI แชท</span>
      </button>
    </div>
  );
}
