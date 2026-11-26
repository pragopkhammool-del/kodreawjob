import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  Download,
  FolderCog,
  KeyRound,
  Lock,
  MousePointerClick,
  Package,
  Palette,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { DEFAULT_THEME_CONFIG, useApp } from '../context/AppContext';
import { Category, OrderDTO, Product, QrCodeItem, ThemeConfig } from '../types';

type AdminTab =
  | 'dashboard'
  | 'theme'
  | 'qrs'
  | 'categories'
  | 'products'
  | 'orders'
  | 'customers';

interface LinkClickStat {
  linkKey: string;
  label: string;
  targetUrl: string;
  clicks: number;
  lastClickedAt: string;
}

interface AdminStats {
  totalRevenue: number;
  pendingRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  paymentMethodBreakdown: Array<{ method: string; amount: number; count: number }>;
  totalDownloads: number;
  realDownloadLogsCount: number;
  totalLinkClicks: number;
  linkClicksBreakdown: LinkClickStat[];
  recentLinkClicks: Array<{
    id: number;
    linkKey: string;
    label: string;
    targetUrl: string;
    createdAt: string;
  }>;
  totalCustomers: number;
  registeredUsersCount: number;
  totalProducts: number;
  salesChart: Array<{ label: string; revenue: number; orders: number }>;
  topProducts: Product[];
}

const THEME_PRESETS: ThemeConfig[] = [
  DEFAULT_THEME_CONFIG,
  {
    presetId: 'emerald-mint',
    name: 'Emerald Mint ธุรกิจ',
    primaryColor: '#10B981',
    primaryHover: '#059669',
    bgLight: '#ECFDF5',
    surfaceLight: '#D1FAE5',
    darkAccent: '#0F172A',
  },
  {
    presetId: 'royal-navy',
    name: 'Royal Blue องค์กร',
    primaryColor: '#2563EB',
    primaryHover: '#1D4ED8',
    bgLight: '#EFF6FF',
    surfaceLight: '#DBEAFE',
    darkAccent: '#0F172A',
  },
  {
    presetId: 'rose-coral',
    name: 'Rose Coral ทันสมัย',
    primaryColor: '#F43F5E',
    primaryHover: '#E11D48',
    bgLight: '#FFF1F2',
    surfaceLight: '#FFE4E6',
    darkAccent: '#1F1218',
  },
  {
    presetId: 'violet-saas',
    name: 'Violet SaaS Tech',
    primaryColor: '#7C3AED',
    primaryHover: '#6D28D9',
    bgLight: '#F5F3FF',
    surfaceLight: '#EDE9FE',
    darkAccent: '#1E1B2E',
  },
];

const ICON_OPTIONS = [
  'FileSpreadsheet',
  'LayoutDashboard',
  'Terminal',
  'TableProperties',
  'Smartphone',
  'Calculator',
  'Database',
  'FolderKanban',
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  promptpay: 'PromptPay QR',
  bank_transfer: 'โอนเงินธนาคาร',
  card: 'บัตรเครดิต/เดบิต',
  truemoney: 'TrueMoney Wallet',
  free: 'ดาวน์โหลดฟรี',
};

export function AdminPage() {
  const {
    dbUser,
    isAdmin,
    adminToken,
    setAdminToken,
    getIdToken,
    setAuthModalOpen,
    showToast,
    categories,
    refreshCategories,
    siteConfig,
    refreshSiteConfig,
  } = useApp();

  const isAuthorizedAdmin = Boolean(adminToken) || (Boolean(dbUser) && isAdmin);

  // Passcode login state
  const [authStatus, setAuthStatus] = useState<{ mode: string; needsSetup: boolean } | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeConfirmInput, setPasscodeConfirmInput] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<OrderDTO[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [paymentRows, setPaymentRows] = useState<any[]>([]);
  const [qrList, setQrList] = useState<QrCodeItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Theme customizer state
  const [themeDraft, setThemeDraft] = useState<ThemeConfig>(siteConfig.theme);
  const [savingTheme, setSavingTheme] = useState(false);

  // QR Code upload state
  const [qrFiles, setQrFiles] = useState<Record<string, File | null>>({});
  const [qrTitles, setQrTitles] = useState<Record<string, string>>({});
  const [qrDescs, setQrDescs] = useState<Record<string, string>>({});
  const [uploadingQrCode, setUploadingQrCode] = useState<string | null>(null);
  const [newQrCode, setNewQrCode] = useState('');
  const [newQrTitle, setNewQrTitle] = useState('');
  const [newQrDesc, setNewQrDesc] = useState('');
  const [newQrFile, setNewQrFile] = useState<File | null>(null);

  // Category editor state
  const [catEdits, setCatEdits] = useState<
    Record<number, { name: string; icon: string; description: string }>
  >({});
  const [savingCatId, setSavingCatId] = useState<number | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('FileSpreadsheet');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Orders & Customers search/filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Add Product + AI Studio state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('199');
  const [newLevel, setNewLevel] = useState<'free' | 'standard' | 'advanced'>('advanced');
  const [newCategoryId, setNewCategoryId] = useState('1');
  const [newFeatures, setNewFeatures] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [aiScriptPreview, setAiScriptPreview] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // PromptPay edit state
  const [ppId, setPpId] = useState('0819998888');
  const [ppName, setPpName] = useState('กดแล้วจบ (Kodraewjob Digital Marketplace)');

  useEffect(() => {
    setThemeDraft(siteConfig.theme);
  }, [siteConfig.theme]);

  useEffect(() => {
    const initial: Record<number, { name: string; icon: string; description: string }> = {};
    categories.forEach((c) => {
      initial[c.id] = { name: c.name, icon: c.icon, description: c.description };
    });
    setCatEdits(initial);
  }, [categories]);

  const getAdminHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (adminToken) {
      return { 'X-Admin-Token': adminToken };
    }
    const fbToken = await getIdToken();
    return fbToken ? { Authorization: `Bearer ${fbToken}` } : {};
  }, [adminToken, getIdToken]);

  useEffect(() => {
    if (!isAuthorizedAdmin) {
      fetch('/api/admin/auth/status')
        .then((r) => r.json())
        .then((d) => setAuthStatus(d))
        .catch(() => setAuthStatus({ mode: 'env', needsSetup: false }));
    }
  }, [isAuthorizedAdmin]);

  const fetchAllAdminData = useCallback(async () => {
    if (!isAuthorizedAdmin) return;
    setLoading(true);
    try {
      const headers = await getAdminHeaders();

      const [statsRes, prodRes, ordRes, custRes, payRes, qrRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/products?limit=100'),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/customers', { headers }),
        fetch('/api/admin/payments', { headers }),
        fetch('/api/admin/qrs', { headers }),
      ]);

      if (statsRes.status === 401 || ordRes.status === 401) {
        if (adminToken) setAdminToken(null);
        showToast({ type: 'error', title: 'เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
        return;
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (prodRes.ok) {
        const pd = await prodRes.json();
        setProductsList(pd.items || []);
      }
      if (ordRes.ok) setOrdersList(await ordRes.json());
      if (custRes.ok) setCustomersList(await custRes.json());
      if (payRes.ok) {
        const rows = await payRes.json();
        setPaymentRows(rows);
        const pp = rows.find((r: any) => r.provider === 'promptpay');
        if (pp?.configJson) {
          const parsed = JSON.parse(pp.configJson);
          if (parsed.promptpayId) setPpId(parsed.promptpayId);
          if (parsed.accountName) setPpName(parsed.accountName);
        }
      }
      if (qrRes.ok) {
        const qrs: QrCodeItem[] = await qrRes.json();
        setQrList(qrs);
        const tMap: Record<string, string> = {};
        const dMap: Record<string, string> = {};
        qrs.forEach((q) => {
          tMap[q.code] = q.title;
          dMap[q.code] = q.description;
        });
        setQrTitles(tMap);
        setQrDescs(dMap);
      }
    } catch {
      showToast({ type: 'error', title: 'โหลดข้อมูล Admin ไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  }, [isAuthorizedAdmin, getAdminHeaders, adminToken, setAdminToken, showToast]);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passcodeInput.trim();
    if (!trimmed) return;

    if (authStatus?.needsSetup && trimmed !== passcodeConfirmInput.trim()) {
      showToast({ type: 'error', title: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' });
      return;
    }

    setAuthSubmitting(true);
    try {
      const endpoint = authStatus?.needsSetup ? '/api/admin/auth/claim' : '/api/admin/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.adminToken) {
        setAdminToken(data.adminToken);
        setPasscodeInput('');
        setPasscodeConfirmInput('');
        showToast({
          type: 'success',
          title: authStatus?.needsSetup
            ? 'ตั้งรหัสและเข้าสู่ระบบหลังบ้านสำเร็จ'
            : 'เข้าสู่ระบบหลังบ้านสำเร็จ',
        });
      } else {
        if (data.needsSetup) {
          setAuthStatus({ mode: 'claim', needsSetup: true });
        }
        showToast({ type: 'error', title: data.error || 'รหัสเข้าสู่ระบบไม่ถูกต้อง' });
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
    } finally {
      setAuthSubmitting(false);
    }
  };

  // RENDER LOGIN GATE IF NOT AUTHORIZED
  if (!isAuthorizedAdmin) {
    const needsSetup = Boolean(authStatus?.needsSetup);
    return (
      <div className="max-w-md mx-auto px-4 py-14 sm:py-20">
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-6 sm:p-8 soft-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#1E1B18] dark:text-orange-50">
              {needsSetup
                ? 'ตั้งค่ารหัสแอดมินครั้งแรก'
                : 'แอดมินเข้าสู่ระบบจัดการหลังบ้าน'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              {needsSetup
                ? 'กรอกรหัสผ่านแอดมินที่ต้องการใช้งานครั้งแรกเพื่อล็อกสิทธิ์ผู้ดูแลระบบ'
                : 'กรอกรหัสแอดมิน (Passcode) เพื่อจัดการสีเทมเพลต QR Code หมวดหมู่ และสถิติ'}
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                รหัสผ่านแอดมิน (Admin Passcode)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {needsSetup && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  ยืนยันรหัสผ่านอีกครั้ง
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={passcodeConfirmInput}
                    onChange={(e) => setPasscodeConfirmInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-sm"
            >
              {authSubmitting
                ? 'กำลังตรวจสอบ...'
                : needsSetup
                  ? 'ตั้งรหัสและเข้าสู่ระบบหลังบ้าน'
                  : 'เข้าสู่ระบบจัดการหลังบ้าน'}
            </button>
          </form>

          <div className="pt-4 border-t border-orange-100 dark:border-orange-900/40 text-center space-y-2.5">
            <p className="text-xs text-stone-500">หรือเข้าสู่ระบบด้วยบัญชี Google เจ้าของระบบ</p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-orange-200 dark:border-orange-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-[#2A201B] transition-colors"
            >
              เข้าสู่ระบบด้วย Google Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HANDLERS
  const handleSaveTheme = async (targetTheme: ThemeConfig) => {
    setSavingTheme(true);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(targetTheme),
      });
      const data = await res.json();
      if (res.ok) {
        setThemeDraft(data);
        await refreshSiteConfig();
        showToast({
          type: 'success',
          title: 'อัปเดตสีเทมเพลตเรียบร้อย',
          description: `กำลังใช้งานธีม: ${data.name}`,
        });
      } else {
        showToast({ type: 'error', title: data.error || 'บันทึกสีเทมเพลตไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถบันทึกสีเทมเพลตได้' });
    } finally {
      setSavingTheme(false);
    }
  };

  const handleSaveQrItem = async (code: string) => {
    setUploadingQrCode(code);
    try {
      const headers = await getAdminHeaders();
      const formData = new FormData();
      formData.append('code', code);
      formData.append('title', qrTitles[code] || code);
      formData.append('description', qrDescs[code] || '');
      formData.append('isActive', 'true');
      if (qrFiles[code]) {
        formData.append('qrImage', qrFiles[code]!);
      }

      const res = await fetch('/api/admin/qrs', {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setQrFiles((prev) => ({ ...prev, [code]: null }));
        await Promise.all([fetchAllAdminData(), refreshSiteConfig()]);
        showToast({ type: 'success', title: `บันทึก QR Code (${data.title}) สำเร็จ` });
      } else {
        showToast({ type: 'error', title: data.error || 'อัปโหลด QR Code ไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาดระหว่างอัปโหลด QR' });
    } finally {
      setUploadingQrCode(null);
    }
  };

  const handleCreateCustomQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQrTitle.trim() || !newQrFile) {
      showToast({ type: 'info', title: 'กรุณากรอกชื่อ QR และเลือกไฟล์รูปภาพ' });
      return;
    }
    setUploadingQrCode('__new__');
    try {
      const headers = await getAdminHeaders();
      const formData = new FormData();
      formData.append('code', newQrCode.trim() || `qr-${Date.now().toString(36)}`);
      formData.append('title', newQrTitle.trim());
      formData.append('description', newQrDesc.trim());
      formData.append('isActive', 'true');
      formData.append('qrImage', newQrFile);

      const res = await fetch('/api/admin/qrs', {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setNewQrCode('');
        setNewQrTitle('');
        setNewQrDesc('');
        setNewQrFile(null);
        await Promise.all([fetchAllAdminData(), refreshSiteConfig()]);
        showToast({ type: 'success', title: `เพิ่ม QR Code "${data.title}" เรียบร้อย` });
      } else {
        showToast({ type: 'error', title: data.error || 'เพิ่ม QR Code ไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'เพิ่ม QR Code ไม่สำเร็จ' });
    } finally {
      setUploadingQrCode(null);
    }
  };

  const handleDeleteQr = async (qrId: number) => {
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/qrs/${qrId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        await Promise.all([fetchAllAdminData(), refreshSiteConfig()]);
        showToast({ type: 'info', title: 'ลบ QR Code แล้ว' });
      } else {
        showToast({ type: 'error', title: data.error || 'ลบไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'ลบไม่สำเร็จ' });
    }
  };

  const handleSaveCategory = async (cat: Category) => {
    const draft = catEdits[cat.id];
    if (!draft) return;
    setSavingCatId(cat.id);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshCategories();
        showToast({ type: 'success', title: `บันทึกหมวดหมู่ "${data.name}" แล้ว` });
      } else {
        showToast({ type: 'error', title: data.error || 'บันทึกไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถแก้ไขหมวดหมู่ได้' });
    } finally {
      setSavingCatId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatDesc.trim()) return;
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug: newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          icon: newCatIcon,
          description: newCatDesc.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCatName('');
        setNewCatSlug('');
        setNewCatDesc('');
        await refreshCategories();
        showToast({ type: 'success', title: `เพิ่มหมวดหมู่ "${data.name}" แล้ว` });
      } else {
        showToast({ type: 'error', title: data.error || 'เพิ่มหมวดหมู่ไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'เพิ่มหมวดหมู่ไม่สำเร็จ' });
    }
  };

  const handleAiStudioDescribe = async () => {
    if (!newTitle.trim()) {
      showToast({ type: 'info', title: 'กรุณากรอกชื่อสินค้าก่อนใช้ AI Studio' });
      return;
    }
    setAiGenerating(true);
    try {
      const headers = await getAdminHeaders();
      const cat = categories.find((c) => String(c.id) === newCategoryId)?.name || 'Excel';
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, category: cat, level: newLevel }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewDesc(data.description || '');
        setNewFeatures(Array.isArray(data.features) ? data.features.join('\n') : '');
        setAiScriptPreview(data.videoScript || '');
        showToast({ type: 'success', title: 'AI Studio สร้างคำอธิบายและสคริปต์วิดีโอแล้ว' });
      } else {
        showToast({ type: 'error', title: data.error || 'สร้างคอนเทนต์ไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาด' });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProduct(true);
    try {
      const headers = await getAdminHeaders();
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('description', newDesc);
      formData.append('price', newPrice);
      formData.append('level', newLevel);
      formData.append('categoryId', newCategoryId);
      formData.append('features', newFeatures);
      if (newFile) formData.append('file', newFile);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showToast({ type: 'success', title: 'เพิ่มเทมเพลตใหม่เรียบร้อยแล้ว' });
        setNewTitle('');
        setNewDesc('');
        setNewFeatures('');
        setNewFile(null);
        setAiScriptPreview('');
        fetchAllAdminData();
      } else {
        showToast({ type: 'error', title: data.error || 'เพิ่มสินค้าไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาด' });
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast({ type: 'success', title: `อัปเดตสถานะเป็น ${status} แล้ว` });
        fetchAllAdminData();
      }
    } catch {
      showToast({ type: 'error', title: 'อัปเดตสถานะไม่สำเร็จ' });
    }
  };

  const handleArchiveProduct = async (productId: number) => {
    try {
      const headers = await getAdminHeaders();
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        showToast({ type: 'info', title: 'ซ่อนสินค้าออกจากหน้าร้านแล้ว' });
        fetchAllAdminData();
      }
    } catch {
      showToast({ type: 'error', title: 'ดำเนินการไม่สำเร็จ' });
    }
  };

  const handleSavePromptPay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = await getAdminHeaders();
      const currentPromptpayQr =
        qrList.find((q) => q.code === 'promptpay')?.imageUrl ||
        '/assets/aistudio/Untitled_e84a513c.jpg';
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'promptpay',
          isActive: true,
          configJson: {
            promptpayId: ppId,
            accountName: ppName,
            qrImageUrl: currentPromptpayQr,
          },
        }),
      });
      if (res.ok) {
        showToast({ type: 'success', title: 'บันทึกการตั้งค่า PromptPay แล้ว' });
      }
    } catch {
      showToast({ type: 'error', title: 'บันทึกไม่สำเร็จ' });
    }
  };

  const handleExportReport = async () => {
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin/reports/export', { headers });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kodraewjob-sales-report.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast({ type: 'error', title: 'ส่งออกรายงาน Excel ไม่สำเร็จ' });
    }
  };

  const maxChartRev = Math.max(1, ...(stats?.salesChart.map((d) => d.revenue) || [100]));

  const filteredOrders = ordersList.filter((o) =>
    orderFilter === 'all' ? true : o.status === orderFilter
  );

  const filteredCustomers = customersList.filter((u) => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
            กดแล้วจบ (Kodraewjob) Admin Console
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            เปลี่ยนสีเทมเพลต · อัปโหลด QR Code · แก้ไขหมวดหมู่ · ดูยอดชำระ สถิติโหลด คลิกลิงก์จริง และรายชื่อผู้ลงทะเบียน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start">
          <button
            onClick={fetchAllAdminData}
            className="px-3.5 py-2.5 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-white dark:bg-[#1F1815] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-orange-400"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
            รีเฟรชข้อมูล
          </button>
          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export รายงาน (.xlsx)
          </button>
          {adminToken && (
            <button
              onClick={() => {
                setAdminToken(null);
                showToast({ type: 'info', title: 'ออกจากเซสชันแอดมินแล้ว' });
              }}
              className="px-3.5 py-2.5 rounded-xl bg-stone-200/80 dark:bg-[#2A201B] text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-rose-100 hover:text-rose-700"
            >
              ล็อกเอาต์แอดมิน
            </button>
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-orange-200/80 dark:border-orange-900/40 pb-3">
        {[
          { id: 'dashboard', label: 'ภาพรวม & สถิติจริง', icon: BarChart3 },
          { id: 'theme', label: 'เปลี่ยนสีเทมเพลต', icon: Palette },
          { id: 'qrs', label: 'อัปโหลด QR Code', icon: QrCode },
          { id: 'categories', label: 'หมวดหมู่เครื่องมือ', icon: FolderCog },
          { id: 'products', label: 'จัดการสินค้า & AI', icon: Package },
          { id: 'orders', label: 'ยอดชำระเงิน & สลิป', icon: CreditCard },
          { id: 'customers', label: 'ผู้ที่ลงทะเบียน', icon: Users },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as AdminTab)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                tab === t.id
                  ? 'bg-[#1E1B18] dark:bg-orange-500 text-white'
                  : 'bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-orange-100 dark:bg-[#2A201B]" />
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD & ANALYTICS */}
          {tab === 'dashboard' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">ยอดชำระเงินสำเร็จ</p>
                  <p className="font-display font-bold text-2xl text-orange-600 dark:text-orange-400 mt-1 tabular-nums">
                    ฿{stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    {stats.paidOrdersCount} ออเดอร์ชำระแล้ว
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">ยอดรอตรวจสอบชำระเงิน</p>
                  <p className="font-display font-bold text-2xl text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                    ฿{stats.pendingRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    รอตรวจ {stats.pendingOrdersCount} รายการ
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">จำนวนคนที่กดโหลด</p>
                  <p className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50 mt-1 tabular-nums">
                    {stats.totalDownloads.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    บันทึกโหลดจริง {stats.realDownloadLogsCount.toLocaleString()} ครั้ง
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-orange-500" />
                    จำนวนคนคลิกลิงก์จริง
                  </p>
                  <p className="font-display font-bold text-2xl text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                    {stats.totalLinkClicks.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    จาก {stats.linkClicksBreakdown.length} ลิงก์ที่ถูกคลิก
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">ผู้ที่ลงทะเบียนในระบบ</p>
                  <p className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50 mt-1 tabular-nums">
                    {stats.registeredUsersCount.toLocaleString()} คน
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    สินค้าทั้งหมด {stats.totalProducts} รายการ
                  </p>
                </div>
              </div>

              {/* Payment Breakdown & 7-Day Revenue Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
                  <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-6">
                    ยอดการชำระเงินย้อนหลัง 7 วัน (บาท)
                  </h2>
                  <div className="h-56 flex items-end justify-between gap-3">
                    {stats.salesChart.map((d) => {
                      const pct = Math.max(8, Math.round((d.revenue / maxChartRev) * 100));
                      return (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                            ฿{d.revenue.toLocaleString()}
                          </span>
                          <div
                            style={{ height: `${pct}%` }}
                            className="w-full max-w-[44px] rounded-t-xl bg-orange-500/85 hover:bg-orange-500 transition-colors"
                          />
                          <span className="text-[11px] text-stone-500 whitespace-nowrap">
                            {d.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-5">
                  <div>
                    <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-3">
                      สรุปยอดชำระแยกตามช่องทาง
                    </h2>
                    {stats.paymentMethodBreakdown.length === 0 ? (
                      <p className="text-xs text-stone-400">ยังไม่มีรายการชำระเงิน</p>
                    ) : (
                      <div className="space-y-2">
                        {stats.paymentMethodBreakdown.map((m) => (
                          <div
                            key={m.method}
                            className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-orange-100/70 dark:border-orange-900/30"
                          >
                            <span className="font-medium">
                              {PAYMENT_METHOD_LABELS[m.method] || m.method} ({m.count})
                            </span>
                            <span className="font-mono font-bold text-orange-600 tabular-nums">
                              ฿{m.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50 mb-2">
                      5 เทมเพลตยอดดาวน์โหลดสูงสุด
                    </h3>
                    <div className="space-y-2">
                      {stats.topProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                          <span className="truncate text-[#1E1B18] dark:text-stone-200">
                            {idx + 1}. {p.title}
                          </span>
                          <span className="font-mono text-xs font-semibold text-orange-600 dark:text-orange-400 tabular-nums shrink-0">
                            {p.downloadCount} โหลด
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Link Clicks Breakdown */}
              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card overflow-x-auto">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-orange-500" />
                      สถิติจำนวนคนคลิกลิงก์จริง ({stats.totalLinkClicks.toLocaleString()} คลิก)
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      นับจากผู้ใช้งานที่คลิกลิงก์ LINE @556fsrdw, Google Sheets จริง, AppSheet และลิงก์เทมเพลตบนหน้าเว็บ
                    </p>
                  </div>
                </div>
                {stats.linkClicksBreakdown.length === 0 ? (
                  <p className="text-sm text-stone-500 py-4">
                    ยังไม่มีประวัติการคลิกลิงก์ เมื่อผู้เข้าชมกดลิงก์ LINE / Google Sheets / เทมเพลต ข้อมูลจริงจะแสดงที่นี่ทันที
                  </p>
                ) : (
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="border-b border-orange-200/80 dark:border-orange-900/40 text-stone-500">
                      <tr>
                        <th className="py-2.5 pr-3">ชื่อลิงก์ / ปุ่ม</th>
                        <th className="py-2.5 px-3">URL ปลายทาง</th>
                        <th className="py-2.5 px-3 text-right">จำนวนคลิกจริง</th>
                        <th className="py-2.5 pl-3 text-right">คลิกล่าสุด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                      {stats.linkClicksBreakdown.map((item) => (
                        <tr key={item.linkKey}>
                          <td className="py-3 pr-3 font-medium text-[#1E1B18] dark:text-orange-50">
                            {item.label}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-stone-500 max-w-xs truncate">
                            {item.targetUrl}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-orange-600 tabular-nums">
                            {item.clicks.toLocaleString()}
                          </td>
                          <td className="py-3 pl-3 text-right text-xs text-stone-400">
                            {new Date(item.lastClickedAt).toLocaleString('th-TH')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THEME COLOR CUSTOMIZER */}
          {tab === 'theme' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-6">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-orange-500" />
                    เลือกชุดสีเทมเพลตสำเร็จรูป (Presets)
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    เลือกโทนสีที่ต้องการแล้วกดบันทึก สีของปุ่มหลัก พื้นหลัง และส่วนหัวเว็บไซต์จะเปลี่ยนตามทันที
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const active = themeDraft.presetId === preset.presetId;
                    return (
                      <button
                        type="button"
                        key={preset.presetId}
                        onClick={() => setThemeDraft(preset)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          active
                            ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/60 dark:bg-[#2A201B]'
                            : 'border-orange-200/80 dark:border-orange-900/40 hover:border-orange-400'
                        }`}
                      >
                        <div className="flex -space-x-1.5 shrink-0">
                          <span
                            className="w-6 h-6 rounded-full border border-white shadow"
                            style={{ backgroundColor: preset.primaryColor }}
                          />
                          <span
                            className="w-6 h-6 rounded-full border border-white shadow"
                            style={{ backgroundColor: preset.bgLight }}
                          />
                          <span
                            className="w-6 h-6 rounded-full border border-white shadow"
                            style={{ backgroundColor: preset.darkAccent }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-sm text-[#1E1B18] dark:text-orange-50 truncate">
                            {preset.name}
                          </p>
                          <p className="text-[11px] font-mono text-stone-500">
                            {preset.primaryColor}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-orange-100 dark:border-orange-900/40 space-y-4">
                  <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
                    ปรับแต่งสีเทมเพลตเอง (Custom Colors)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'primaryColor', label: 'สีปุ่มและไฮไลต์หลัก' },
                      { key: 'primaryHover', label: 'สีปุ่มเมื่อชี้เมาส์' },
                      { key: 'bgLight', label: 'สีพื้นหลังโทนสว่าง' },
                      { key: 'surfaceLight', label: 'สีพื้นการ์ดอ่อน' },
                      { key: 'darkAccent', label: 'สีส่วนท้าย (Footer)' },
                    ].map((field) => {
                      const val = (themeDraft as any)[field.key] as string;
                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300">
                            {field.label}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={val}
                              onChange={(e) =>
                                setThemeDraft((prev) => ({
                                  ...prev,
                                  presetId: 'custom',
                                  name: 'ธีมกำหนดเอง (Custom)',
                                  [field.key]: e.target.value.toUpperCase(),
                                }))
                              }
                              className="w-10 h-9 rounded-lg border border-orange-200 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                setThemeDraft((prev) => ({
                                  ...prev,
                                  presetId: 'custom',
                                  name: 'ธีมกำหนดเอง (Custom)',
                                  [field.key]: e.target.value.toUpperCase(),
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 font-mono text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    disabled={savingTheme}
                    onClick={() => handleSaveTheme(themeDraft)}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm"
                  >
                    {savingTheme ? 'กำลังบันทึก...' : 'บันทึกสีเทมเพลตและใช้งานทันที'}
                  </button>
                  <button
                    type="button"
                    disabled={savingTheme}
                    onClick={() => handleSaveTheme(DEFAULT_THEME_CONFIG)}
                    className="px-5 py-2.5 rounded-xl border border-orange-200 dark:border-orange-800 text-xs font-semibold text-stone-700 dark:text-stone-200"
                  >
                    รีเซ็ตเป็นสีส้มพาสเทลเดิม
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4">
                <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                  ตัวอย่างหน้าตาธีม (Live Preview)
                </h3>
                <div
                  className="rounded-2xl p-5 border border-black/10 space-y-4"
                  style={{ backgroundColor: themeDraft.bgLight }}
                >
                  <div
                    className="rounded-xl p-4 text-white"
                    style={{ backgroundColor: themeDraft.darkAccent }}
                  >
                    <p className="font-display font-bold text-sm">กดแล้วจบ · Kodraewjob</p>
                    <p className="text-xs opacity-80 mt-0.5">{themeDraft.name}</p>
                  </div>
                  <div
                    className="rounded-xl p-4 space-y-2"
                    style={{ backgroundColor: themeDraft.surfaceLight }}
                  >
                    <p className="font-display font-bold text-sm text-[#1E1B18]">
                      การ์ดตัวอย่างเทมเพลต Excel 2027
                    </p>
                    <p className="text-xs text-stone-600">
                      ตัวอย่างปุ่มสั่งซื้อและพื้นหลังโทนสีที่เลือก
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-white text-xs font-bold"
                      style={{ backgroundColor: themeDraft.primaryColor }}
                    >
                      ปุ่มหลัก ({themeDraft.primaryColor})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QR CODES UPLOAD & PROMPTPAY */}
          {tab === 'qrs' && (
            <div className="space-y-8">
              {/* Existing QR Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrList.map((qr) => (
                  <div
                    key={qr.id}
                    className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card space-y-4 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                          {qr.code}
                        </span>
                        <h3 className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50 mt-1.5">
                          {qr.title}
                        </h3>
                      </div>
                      {qr.code !== 'promptpay' && qr.code !== 'line' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteQr(qr.id)}
                          aria-label="ลบ QR"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-orange-200 flex items-center justify-center">
                      <img
                        src={qr.imageUrl}
                        alt={qr.title}
                        referrerPolicy="no-referrer"
                        className="w-40 h-40 object-contain"
                      />
                    </div>

                    <div className="space-y-2.5 text-xs flex-1">
                      <div>
                        <label className="block font-semibold mb-1">ชื่อ QR Code</label>
                        <input
                          type="text"
                          value={qrTitles[qr.code] ?? qr.title}
                          onChange={(e) =>
                            setQrTitles((prev) => ({ ...prev, [qr.code]: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">รายละเอียด</label>
                        <input
                          type="text"
                          value={qrDescs[qr.code] ?? qr.description}
                          onChange={(e) =>
                            setQrDescs((prev) => ({ ...prev, [qr.code]: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40"
                        />
                      </div>
                      <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-800 cursor-pointer hover:border-orange-500 text-stone-600 dark:text-stone-300">
                        <Upload className="w-4 h-4 text-orange-500" />
                        <span className="truncate">
                          {qrFiles[qr.code]?.name || 'อัปโหลดรูปภาพ QR ใหม่ (.png/.jpg)'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            setQrFiles((prev) => ({
                              ...prev,
                              [qr.code]: e.target.files?.[0] || null,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      disabled={uploadingQrCode === qr.code}
                      onClick={() => handleSaveQrItem(qr.code)}
                      className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                    >
                      {uploadingQrCode === qr.code ? 'กำลังอัปโหลด...' : 'บันทึก / อัปเดต QR นี้'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New QR Code + PromptPay ID Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form
                  onSubmit={handleCreateCustomQr}
                  className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4"
                >
                  <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-orange-500" />
                    เพิ่ม QR Code ช่องทางเพิ่มเติม (ธนาคาร / TrueMoney / กลุ่มอื่น)
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">รหัสอ้างอิง (Code)</label>
                      <input
                        type="text"
                        value={newQrCode}
                        onChange={(e) => setNewQrCode(e.target.value)}
                        placeholder="เช่น kbank-qr"
                        className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">ชื่อ QR Code *</label>
                      <input
                        type="text"
                        required
                        value={newQrTitle}
                        onChange={(e) => setNewQrTitle(e.target.value)}
                        placeholder="เช่น ธ.กสิกรไทย บจก.กดแล้วจบ"
                        className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">คำอธิบาย</label>
                    <input
                      type="text"
                      value={newQrDesc}
                      onChange={(e) => setNewQrDesc(e.target.value)}
                      placeholder="เลขบัญชีหรือหมายเหตุการสแกน"
                      className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                    />
                  </div>
                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-800 cursor-pointer hover:border-orange-500 text-xs text-stone-600 dark:text-stone-300">
                    <Upload className="w-4 h-4 text-orange-500" />
                    <span>{newQrFile ? newQrFile.name : 'เลือกไฟล์รูปภาพ QR Code (.png/.jpg) *'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => setNewQrFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={uploadingQrCode === '__new__'}
                    className="px-5 py-2.5 rounded-xl bg-[#1E1B18] dark:bg-orange-500 text-white text-sm font-semibold"
                  >
                    {uploadingQrCode === '__new__' ? 'กำลังเพิ่ม...' : 'เพิ่ม QR Code ลงหน้าชำระเงิน'}
                  </button>
                </form>

                <form
                  onSubmit={handleSavePromptPay}
                  className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4"
                >
                  <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                    ตั้งค่าเบอร์ PromptPay สร้างยอดเงินอัตโนมัติ
                  </h2>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      เบอร์พร้อมเพย์ / เลขประจำตัวผู้เสียภาษี 13 หลัก
                    </label>
                    <input
                      type="text"
                      required
                      value={ppId}
                      onChange={(e) => setPpId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ชื่อบัญชีที่แสดง</label>
                    <input
                      type="text"
                      required
                      value={ppName}
                      onChange={(e) => setPpName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                    />
                  </div>
                  <p className="text-xs text-stone-500">
                    ช่องทางชำระเงินที่เปิดใช้งาน: {paymentRows.filter((p) => p.isActive).map((p) => p.provider).join(', ')}
                  </p>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
                  >
                    บันทึกหมายเลข PromptPay
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: TOOL CATEGORIES EDITOR */}
          {tab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-orange-50">
                  แก้ไขหมวดหมู่เครื่องมือ ({categories.length} หมวดหมู่)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => {
                    const draft = catEdits[cat.id] || {
                      name: cat.name,
                      icon: cat.icon,
                      description: cat.description,
                    };
                    return (
                      <div
                        key={cat.id}
                        className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span className="font-mono">slug: {cat.slug}</span>
                          <span>ID #{cat.id}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">ชื่อหมวดหมู่</label>
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(e) =>
                              setCatEdits((prev) => ({
                                ...prev,
                                [cat.id]: { ...draft, name: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">ไอคอน</label>
                          <select
                            value={draft.icon}
                            onChange={(e) =>
                              setCatEdits((prev) => ({
                                ...prev,
                                [cat.id]: { ...draft, icon: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                          >
                            {ICON_OPTIONS.map((ic) => (
                              <option key={ic} value={ic}>
                                {ic}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">คำอธิบายหมวดหมู่</label>
                          <textarea
                            rows={2}
                            value={draft.description}
                            onChange={(e) =>
                              setCatEdits((prev) => ({
                                ...prev,
                                [cat.id]: { ...draft, description: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={savingCatId === cat.id}
                          onClick={() => handleSaveCategory(cat)}
                          className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                        >
                          {savingCatId === cat.id ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขหมวดหมู่'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form
                onSubmit={handleCreateCategory}
                className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4"
              >
                <h3 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  เพิ่มหมวดหมู่เครื่องมือใหม่
                </h3>
                <div>
                  <label className="block text-xs font-semibold mb-1">ชื่อหมวดหมู่ *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="เช่น Looker Studio Dashboard"
                    className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Slug (ภาษาอังกฤษ)</label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="looker-studio"
                    className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">ไอคอน</label>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                  >
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">คำอธิบาย *</label>
                  <textarea
                    rows={3}
                    required
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="อธิบายจุดเด่นของหมวดหมู่เครื่องมือนี้..."
                    className="w-full px-3 py-2 rounded-lg bg-orange-50/40 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1E1B18] dark:bg-orange-500 text-white text-sm font-bold"
                >
                  เพิ่มหมวดหมู่ใหม่
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: PRODUCTS + AI STUDIO */}
          {tab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <form
                onSubmit={handleCreateProduct}
                className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-orange-600" />
                    เพิ่มเทมเพลตใหม่ + AI Studio
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">ชื่อเทมเพลต</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="เช่น Excel คำนวณต้นทุนขนมเบเกอรี่"
                    className="w-full px-3 py-2 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">ราคา (บาท)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ระดับ</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as any)}
                      className="w-full px-2 py-2 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                    >
                      <option value="free">ฟรี</option>
                      <option value="standard">มาตรฐาน</option>
                      <option value="advanced">ขั้นสูง</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">หมวดหมู่</label>
                    <select
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      className="w-full px-2 py-2 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAiStudioDescribe}
                  disabled={aiGenerating}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiGenerating
                    ? 'AI กำลังเขียนคำอธิบาย & สคริปต์วิดีโอ...'
                    : 'ใช้ AI Studio เขียนคำอธิบาย + จุดเด่น + สคริปต์วิดีโอ'}
                </button>

                <div>
                  <label className="block text-xs font-semibold mb-1">คำอธิบายสินค้า</label>
                  <textarea
                    rows={3}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    จุดเด่น (บรรทัดละ 1 ข้อ)
                  </label>
                  <textarea
                    rows={3}
                    value={newFeatures}
                    onChange={(e) => setNewFeatures(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-sm"
                  />
                </div>

                {aiScriptPreview && (
                  <div className="rounded-xl bg-orange-50/70 dark:bg-[#2A201B] p-3 text-xs text-stone-700 dark:text-stone-300">
                    <p className="font-semibold text-orange-600 mb-1">
                      สคริปต์วิดีโอโปรโมท (AI Generated):
                    </p>
                    <p>{aiScriptPreview}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    อัปโหลดไฟล์ Excel (.xlsx/.xlsm สูงสุด 50MB)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-900/50 cursor-pointer text-xs text-stone-500 hover:border-orange-500">
                    <Upload className="w-4 h-4 text-orange-500" />
                    <span>{newFile ? newFile.name : 'เลือกไฟล์ Excel (ไม่บังคับ)'}</span>
                    <input
                      type="file"
                      accept=".xlsx,.xlsm,.xls,.csv"
                      className="hidden"
                      onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
                >
                  {creatingProduct ? 'กำลังบันทึก...' : 'บันทึกเทมเพลตลงคลัง'}
                </button>
              </form>

              <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card overflow-x-auto">
                <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-4">
                  สินค้าทั้งหมดในระบบ ({productsList.length})
                </h2>
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="border-b border-orange-200/80 dark:border-orange-900/40 text-stone-500">
                    <tr>
                      <th className="py-2.5 pr-3">ชื่อเทมเพลต</th>
                      <th className="py-2.5 px-3">ราคา</th>
                      <th className="py-2.5 px-3">ดาวน์โหลด</th>
                      <th className="py-2.5 pl-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {productsList.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 pr-3 font-medium text-[#1E1B18] dark:text-orange-50">
                          {p.title}
                        </td>
                        <td className="py-3 px-3 tabular-nums">
                          {p.price === 0 ? 'ฟรี' : `฿${p.price}`}
                        </td>
                        <td className="py-3 px-3 tabular-nums">{p.downloadCount}</td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            onClick={() => handleArchiveProduct(p.id)}
                            aria-label="ซ่อนสินค้า"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ORDERS & PAYMENTS */}
          {tab === 'orders' && (
            <div className="space-y-4">
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4">
                    <p className="text-xs text-stone-500">ยอดชำระเงินสำเร็จรวม</p>
                    <p className="font-display font-bold text-xl text-emerald-600 tabular-nums mt-1">
                      ฿{stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4">
                    <p className="text-xs text-stone-500">ยอดรอตรวจสอบสลิป</p>
                    <p className="font-display font-bold text-xl text-amber-600 tabular-nums mt-1">
                      ฿{stats.pendingRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                      กรองสถานะ:
                    </span>
                    <div className="flex gap-1.5">
                      {(['all', 'paid', 'pending'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setOrderFilter(f)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            orderFilter === f
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-50 dark:bg-[#2A201B] text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {f === 'all' ? 'ทั้งหมด' : f === 'paid' ? 'ชำระแล้ว' : 'รอตรวจ'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card overflow-x-auto">
                <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-4">
                  รายการคำสั่งซื้อและยอดชำระเงิน ({filteredOrders.length})
                </h2>
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="border-b border-orange-200/80 dark:border-orange-900/40 text-stone-500">
                    <tr>
                      <th className="py-2.5 pr-3">เลขที่ออเดอร์</th>
                      <th className="py-2.5 px-3">ลูกค้า</th>
                      <th className="py-2.5 px-3">ช่องทาง</th>
                      <th className="py-2.5 px-3">ยอดชำระ</th>
                      <th className="py-2.5 px-3">สถานะ</th>
                      <th className="py-2.5 pl-3 text-right">เปลี่ยนสถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                    {filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 pr-3 font-mono font-semibold">{o.orderNumber}</td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-[#1E1B18] dark:text-orange-50">
                            {o.customerName}
                          </p>
                          <p className="text-[11px] text-stone-500">{o.customerEmail}</p>
                        </td>
                        <td className="py-3 px-3">
                          {PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod}
                        </td>
                        <td className="py-3 px-3 tabular-nums font-semibold">
                          ฿{o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              o.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-right space-x-2">
                          {o.status !== 'paid' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                              className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              อนุมัติชำระเงิน
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REGISTERED USERS LIST */}
          {tab === 'customers' && (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4 overflow-x-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                    รายการชื่อผู้ที่ลงทะเบียน ({filteredCustomers.length} คน)
                  </h2>
                  <p className="text-xs text-stone-500">
                    รายชื่อบัญชีสมาชิกทั้งหมดที่เข้าสู่ระบบและลงทะเบียนบนเว็บไซต์
                  </p>
                </div>
                <div className="relative sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ หรืออีเมลสมาชิก..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-orange-50/50 dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/40 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="border-b border-orange-200/80 dark:border-orange-900/40 text-stone-500">
                  <tr>
                    <th className="py-2.5 pr-3">ชื่อผู้ลงทะเบียน</th>
                    <th className="py-2.5 px-3">อีเมล</th>
                    <th className="py-2.5 px-3">สิทธิ์</th>
                    <th className="py-2.5 pl-3">วันที่ลงทะเบียน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-stone-500">
                        ไม่พบรายชื่อผู้ลงทะเบียนที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-orange-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold text-xs">
                                {String(u.name || '?').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-[#1E1B18] dark:text-orange-50">
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 text-xs font-semibold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-stone-500">
                          {new Date(u.createdAt).toLocaleString('th-TH')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
