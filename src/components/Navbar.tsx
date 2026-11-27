import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import firebaseConfig from '../../firebase-applet-config.json';

const BRAND_LOGO =
  '/assets/aistudio/810624000_983971044712451_6466500635178443708_n_81f9a476.jpg';

export function Navbar() {
  const {
    route,
    navigate,
    darkMode,
    toggleDarkMode,
    dbUser,
    isAdmin,
    cart,
    setAuthModalOpen,
    authModalOpen,
    authDomainError,
    clearAuthDomainError,
    loginWithGoogle,
    loginWithEmail,
    logout,
    showToast,
    trackLinkClick,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regLineId, setRegLineId] = useState('');
  const [registering, setRegistering] = useState(false);

  const navLinks = [
    { label: 'เทมเพลต', path: '/templates' },
    { label: 'Google Sheets', path: '/google-sheets' },
    { label: 'เทมเพลตฟรี 110+ แบบ', path: '/excel-templates' },
    { label: 'บทความ', path: '/blog' },
    { label: 'ตัวอย่าง Web App', path: '/webapps-demo' },
    { label: 'เรียนรู้ 50 สูตร', path: '/learn' },
    { label: 'Web App ERP', path: '/webapp' },
    { label: 'ฟอรั่ม', path: '/forum' },
    { label: 'ราคา', path: '/pricing' },
    { label: 'AI แก้โจทย์', path: '/solve' },
    { label: 'ติดต่อเรา', path: '/contact' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(q ? `/templates?search=${encodeURIComponent(q)}` : '/templates');
  };

  const isActive = (path: string) => {
    if (path === '/') return route === '/';
    return route.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FFF7ED]/92 dark:bg-[#14100E]/92 border-b border-orange-200/80 dark:border-orange-900/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 lg:gap-4">
          {/* Zone 1: Brand wordmark + logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
          >
            <img
              src={BRAND_LOGO}
              alt="กดแล้วจบ Kodraewjob Digital Marketplace Logo"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border-2 border-orange-400"
            />
            <div className="leading-none">
              <span className="font-display font-bold text-lg tracking-tight text-[#1E1B18] dark:text-orange-50 whitespace-nowrap block">
                กดแล้วจบ
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-orange-600 dark:text-orange-400 hidden sm:block">
                Kodraewjob
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-stone-700 dark:text-stone-300">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors hover:text-orange-600 dark:hover:text-orange-400 ${
                  isActive(link.path)
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : ''
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Compact action cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="ค้นหาเทมเพลต"
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            <button
              onClick={() => navigate('/cart')}
              aria-label="ตะกร้าสินค้า"
              className="relative p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[11px] font-bold tabular-nums flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin')}
              title="เข้าสู่ระบบจัดการหลังบ้าน (Admin)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400/70 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>

            {dbUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 text-xs font-medium text-[#1E1B18] dark:text-orange-50 hover:border-orange-500 transition-colors whitespace-nowrap shrink-0"
                >
                  {dbUser.avatar ? (
                    <img
                      src={dbUser.avatar}
                      alt={dbUser.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-orange-600" />
                  )}
                  <span className="max-w-[100px] truncate">{dbUser.name}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 soft-card py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-orange-100 dark:border-orange-900/40">
                      <p className="text-xs font-semibold text-[#1E1B18] dark:text-white truncate">
                        {dbUser.name}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{dbUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/forum');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-stone-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center gap-2.5"
                    >
                      <MessageCircle className="w-4 h-4 text-orange-500" />
                      ฟอรั่มชุมชน &amp; แชท
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-stone-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4 text-orange-500" />
                      ไฟล์ดาวน์โหลดของฉัน
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-amber-600 dark:text-amber-400 font-medium hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        จัดการระบบ (Admin)
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                เข้าสู่ระบบ
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="เมนูนำทาง"
              className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-orange-100 dark:hover:bg-orange-950/50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-orange-200/70 dark:border-orange-900/40 bg-white/95 dark:bg-[#1F1815]/95 px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาเทมเพลต เช่น สต๊อก, เงินเดือน, ใบกำกับภาษี, BOM, BOQ..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] text-sm text-[#1E1B18] dark:text-white border border-orange-200 dark:border-orange-900/50 focus:border-orange-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                ค้นหา
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-orange-200 dark:border-orange-900/40 bg-white dark:bg-[#1F1815] px-4 py-4 space-y-2">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 pb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาเทมเพลต..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] text-sm text-[#1E1B18] dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold"
              >
                ค้นหา
              </button>
            </form>
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(link.path);
                }}
                className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/about');
              }}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            >
              เกี่ยวกับเรา &amp; บทความ
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/admin');
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin จัดการหลังบ้าน
            </button>
            <div className="pt-2 border-t border-orange-100 dark:border-orange-900/40 flex flex-col gap-2">
              {dbUser ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-sm font-semibold text-left"
                  >
                    ไฟล์ของฉัน ({dbUser.name})
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-sm font-semibold text-left"
                    >
                      หน้าผู้ดูแลระบบ (Admin)
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-rose-600 text-sm text-left"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold"
                >
                  เข้าสู่ระบบ Gmail / Google
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sign-In Modal (Gmail / Google primary + LINE / Facebook guidance) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-6 sm:p-8 soft-card animate-fade-in-up relative">
            <button
              onClick={() => {
                clearAuthDomainError();
                setAuthModalOpen(false);
              }}
              aria-label="ปิดหน้าต่าง"
              className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <img
                src={BRAND_LOGO}
                alt="กดแล้วจบ Logo"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-2 border-orange-400 mb-4"
              />
              <h2 className="font-display text-xl font-bold text-[#1E1B18] dark:text-white">
                เข้าสู่ระบบ กดแล้วจบ
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1.5">
                กรุณาเข้าสู่ระบบก่อนดาวน์โหลดไฟล์ Excel โพสต์ในฟอรั่ม หรือแชทกับสมาชิก
              </p>

              <button
                onClick={loginWithGoogle}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-3 transition-colors shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
                เข้าสู่ระบบด้วย Gmail / Google (แนะนำ)
              </button>

              <div className="mt-3 w-full grid grid-cols-2 gap-2.5">
                <a
                  href="https://line.me/R/ti/p/@556fsrdw"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackLinkClick(
                      'line-auth-modal',
                      'เชื่อมต่อ LINE @556fsrdw (หน้าต่างล็อกอิน)',
                      'https://line.me/R/ti/p/@556fsrdw'
                    );
                    showToast({
                      type: 'info',
                      title: 'เชื่อมต่อ LINE @556fsrdw',
                      description: 'แนะนำให้ล็อกอิน Gmail ด้านบนก่อนเพื่อดาวน์โหลดไฟล์ทันที',
                    });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  LINE @556fsrdw
                </a>
                <button
                  type="button"
                  onClick={() => {
                    showToast({
                      type: 'info',
                      title: 'กรุณาใช้ปุ่ม Gmail / Google ด้านบน',
                      description: 'เพื่อยืนยันสิทธิ์ดาวน์โหลดไฟล์อัตโนมัติในระบบทันที',
                    });
                    loginWithGoogle();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  Facebook / Gmail
                </button>
              </div>

              <div className="mt-5 w-full pt-4 border-t border-orange-200 dark:border-orange-900/50 text-left">
                <h3 className="text-xs font-bold text-[#1E1B18] dark:text-orange-100 mb-2">
                  หรือลงทะเบียนด้วยชื่อ-อีเมล (บันทึกลงฐานข้อมูลและเข้าสู่ระบบทันที)
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!regName.trim() || !regEmail.trim()) {
                      showToast({ type: 'error', title: 'กรุณากรอกชื่อและอีเมล' });
                      return;
                    }
                    setRegistering(true);
                    await loginWithEmail(regName.trim(), regEmail.trim(), regLineId.trim());
                    setRegistering(false);
                  }}
                  className="space-y-2.5"
                >
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-0.5">
                      ชื่อ-นามสกุล / ชื่อร้าน *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="เช่น คุณสมชาย ใจดี"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-0.5">
                      อีเมล *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-0.5">
                      LINE ID (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={regLineId}
                      onChange={(e) => setRegLineId(e.target.value)}
                      placeholder="@yourlineid"
                      className="w-full px-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow"
                  >
                    {registering ? 'กำลังบันทึกและเข้าสู่ระบบ...' : 'บันทึกการลงทะเบียน & เข้าสู่ระบบทันที'}
                  </button>
                </form>
              </div>

              {authDomainError && (
                <div className="mt-4 w-full rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3.5 text-left space-y-2">
                  <div className="flex items-start gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>โดเมนนี้ยังไม่ได้อนุญาตใน Firebase Console (auth/unauthorized-domain)</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    ให้นำโดเมนด้านล่างไปเพิ่มใน <strong>Authentication → Settings → Authorized domains</strong> ของโปรเจกต์ Firebase เพื่อเปิดใช้งานการล็อกอิน Google บนโดเมนนี้:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#14100E] border border-amber-300 dark:border-amber-800 text-[11px] font-mono text-[#1E1B18] dark:text-orange-100 truncate">
                      {authDomainError}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(authDomainError);
                        setCopiedDomain(true);
                        setTimeout(() => setCopiedDomain(false), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 shrink-0"
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedDomain ? 'คัดลอกแล้ว' : 'คัดลอก'}
                    </button>
                  </div>
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700 dark:text-orange-400 hover:underline pt-0.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    เปิดหน้าตั้งค่า Firebase Authorized Domains ทันที
                  </a>
                </div>
              )}

              <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
                ปลอดภัย 100% ด้วย Firebase Authentication · ดาวน์โหลดไฟล์ได้ทันทีหลังล็อกอิน
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
