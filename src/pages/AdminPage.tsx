import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  Download,
  Package,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderDTO, Product } from '../types';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'payments';

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  totalDownloads: number;
  totalCustomers: number;
  registeredUsersCount: number;
  totalProducts: number;
  salesChart: Array<{ label: string; revenue: number; orders: number }>;
  topProducts: Product[];
}

export function AdminPage() {
  const { dbUser, isAdmin, getIdToken, setAuthModalOpen, showToast, categories } =
    useApp();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<OrderDTO[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [paymentRows, setPaymentRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchAllAdminData = useCallback(async () => {
    if (!dbUser || !isAdmin) return;
    setLoading(true);
    try {
      const token = await getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, prodRes, ordRes, custRes, payRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/products?limit=100'),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/customers', { headers }),
        fetch('/api/admin/payments', { headers }),
      ]);

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
    } catch {
      showToast({ type: 'error', title: 'โหลดข้อมูล Admin ไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  }, [dbUser, isAdmin, getIdToken, showToast]);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  if (!dbUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h1 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50">
          กรุณาเข้าสู่ระบบผู้ดูแล (Admin)
        </h1>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="mt-5 px-6 py-2.5 rounded-xl bg-[#1E1B18] dark:bg-orange-500 text-white text-sm font-semibold"
        >
          เข้าสู่ระบบด้วย Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h1 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50">
          บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลหลัก ({'pragopkhammool@gmail.com'})
        </p>
      </div>
    );
  }

  const handleAiStudioDescribe = async () => {
    if (!newTitle.trim()) {
      showToast({ type: 'info', title: 'กรุณากรอกชื่อสินค้าก่อนใช้ AI Studio' });
      return;
    }
    setAiGenerating(true);
    try {
      const token = await getIdToken();
      const cat = categories.find((c) => String(c.id) === newCategoryId)?.name || 'Excel';
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      const token = await getIdToken();
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
        headers: { Authorization: `Bearer ${token}` },
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
      const token = await getIdToken();
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      const token = await getIdToken();
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
      const token = await getIdToken();
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: 'promptpay',
          isActive: true,
          configJson: {
            promptpayId: ppId,
            accountName: ppName,
            qrImageUrl: '/assets/aistudio/Untitled_e84a513c.jpg',
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
      const token = await getIdToken();
      const res = await fetch('/api/admin/reports/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const maxChartRev = Math.max(
    1,
    ...(stats?.salesChart.map((d) => d.revenue) || [100])
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-orange-50">
            กดแล้วจบ (Kodraewjob) Admin Console
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            จัดการคลังเทมเพลต อัปโหลดไฟล์ Excel (.xlsx สูงสุด 50MB) ตรวจสอบสลิป และ AI Studio
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 self-start shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export รายงานยอดขาย (.xlsx)
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-orange-200/80 dark:border-orange-900/40 pb-3">
        {[
          { id: 'dashboard', label: 'ภาพรวม & กราฟ', icon: BarChart3 },
          { id: 'products', label: 'จัดการสินค้า & AI Studio', icon: Package },
          { id: 'orders', label: 'คำสั่งซื้อ & อนุมัติสลิป', icon: CheckCircle2 },
          { id: 'customers', label: 'รายชื่อลูกค้า', icon: Users },
          { id: 'payments', label: 'ตั้งค่า PromptPay', icon: CreditCard },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as AdminTab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
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
          {/* TAB 1: DASHBOARD */}
          {tab === 'dashboard' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">ยอดขายรวมที่ชำระแล้ว</p>
                  <p className="font-display font-bold text-2xl text-orange-600 dark:text-orange-400 mt-1 tabular-nums">
                    ฿{stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    {stats.paidOrdersCount} ออเดอร์สำเร็จ
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">คำสั่งซื้อทั้งหมด</p>
                  <p className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50 mt-1 tabular-nums">
                    {stats.totalOrders.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-500 mt-1 tabular-nums">
                    รอตรวจสอบ {stats.pendingOrdersCount} รายการ
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">ยอดดาวน์โหลดสะสม</p>
                  <p className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50 mt-1 tabular-nums">
                    {stats.totalDownloads.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    จาก {stats.totalProducts} เทมเพลต
                  </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card">
                  <p className="text-xs text-stone-500">ลูกค้าธุรกิจทั้งหมด</p>
                  <p className="font-display font-bold text-2xl text-[#1E1B18] dark:text-orange-50 mt-1 tabular-nums">
                    {stats.totalCustomers.toLocaleString()}+
                  </p>
                  <p className="text-xs text-stone-400 mt-1 tabular-nums">
                    สมาชิกบัญชี Google: {stats.registeredUsersCount}
                  </p>
                </div>
              </div>

              {/* 7-Day Revenue Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
                  <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-6">
                    ยอดขายย้อนหลัง 7 วัน (บาท)
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

                <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
                  <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-4">
                    5 เทมเพลตยอดดาวน์โหลดสูงสุด
                  </h2>
                  <div className="space-y-3">
                    {stats.topProducts.map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 text-sm">
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
          )}

          {/* TAB 2: PRODUCTS + AI STUDIO */}
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

          {/* TAB 3: ORDERS */}
          {tab === 'orders' && (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card overflow-x-auto">
              <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-4">
                รายการคำสั่งซื้อ ({ordersList.length})
              </h2>
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="border-b border-orange-200/80 dark:border-orange-900/40 text-stone-500">
                  <tr>
                    <th className="py-2.5 pr-3">เลขที่ออเดอร์</th>
                    <th className="py-2.5 px-3">ลูกค้า</th>
                    <th className="py-2.5 px-3">ช่องทาง</th>
                    <th className="py-2.5 px-3">ยอดรวม</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 pl-3 text-right">เปลี่ยนสถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {ordersList.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 pr-3 font-mono font-semibold">{o.orderNumber}</td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-[#1E1B18] dark:text-orange-50">
                          {o.customerName}
                        </p>
                        <p className="text-[11px] text-stone-500">{o.customerEmail}</p>
                      </td>
                      <td className="py-3 px-3">{o.paymentMethod}</td>
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
                            className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
                          >
                            อนุมัติชำระเงิน
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: CUSTOMERS */}
          {tab === 'customers' && (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card overflow-x-auto">
              <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50 mb-4">
                สมาชิกที่ลงทะเบียน ({customersList.length})
              </h2>
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="border-b border-orange-200/80 dark:border-orange-900/40 text-stone-500">
                  <tr>
                    <th className="py-2.5 pr-3">ชื่อ</th>
                    <th className="py-2.5 px-3">อีเมล</th>
                    <th className="py-2.5 px-3">สิทธิ์</th>
                    <th className="py-2.5 pl-3">วันที่สมัคร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/30">
                  {customersList.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 pr-3 font-medium">{u.name}</td>
                      <td className="py-3 px-3">{u.email}</td>
                      <td className="py-3 px-3">{u.role}</td>
                      <td className="py-3 pl-3 text-stone-500">
                        {new Date(u.createdAt).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {tab === 'payments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <form
                onSubmit={handleSavePromptPay}
                className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-4"
              >
                <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-orange-50">
                  ตั้งค่า PromptPay QR Code อัตโนมัติ
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
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
                >
                  บันทึกการตั้งค่า
                </button>
              </form>

              <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card text-center space-y-3">
                <p className="font-display font-bold text-sm text-[#1E1B18] dark:text-orange-50">
                  ภาพ Thai QR Payment หลักของร้าน
                </p>
                <img
                  src="/assets/aistudio/Untitled_e84a513c.jpg"
                  alt="PromptPay QR"
                  referrerPolicy="no-referrer"
                  className="w-48 mx-auto rounded-xl border border-orange-200"
                />
                <p className="text-xs text-stone-500">
                  ช่องทางชำระเงินที่เปิดใช้งาน: {paymentRows.filter((p) => p.isActive).map((p) => p.provider).join(', ')}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
