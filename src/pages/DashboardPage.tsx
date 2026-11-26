import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Heart,
  Lock,
  Package,
  Search,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderDTO, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export function DashboardPage({ lookupToken }: { lookupToken?: string }) {
  const {
    dbUser,
    getIdToken,
    setAuthModalOpen,
    navigate,
    wishlist,
    showToast,
    downloadProtectedFile,
  } = useApp();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [wishedProducts, setWishedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [lookedUpOrder, setLookedUpOrder] = useState<OrderDTO | null>(null);

  useEffect(() => {
    if (!dbUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getIdToken()
      .then((token) =>
        fetch('/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dbUser, getIdToken]);

  useEffect(() => {
    if (wishlist.length === 0) {
      setWishedProducts([]);
      return;
    }
    fetch('/api/products?limit=100')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items)) {
          setWishedProducts(d.items.filter((p: Product) => wishlist.includes(p.id)));
        }
      })
      .catch(() => {});
  }, [wishlist]);

  const handleOrderLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSearch.trim()) return;
    try {
      const res = await fetch(`/api/orders/lookup/${encodeURIComponent(orderSearch.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setLookedUpOrder({ ...data.order, items: data.items });
      } else {
        setLookedUpOrder(null);
        showToast({ type: 'error', title: data.error || 'ไม่พบเลขที่คำสั่งซื้อ' });
      }
    } catch {
      showToast({ type: 'error', title: 'ค้นหาไม่สำเร็จ' });
    }
  };

  if (lookupToken) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-8 soft-card space-y-5">
          <CheckCircle2 className="w-12 h-12 text-orange-500 mx-auto" />
          <h1 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-white">
            ลิงก์ดาวน์โหลดปลอดภัย (24 ชั่วโมง)
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            กรุณาเข้าสู่ระบบด้วย Gmail (Google) ก่อนกดปุ่มเพื่อรับไฟล์ Excel (.xlsx) ของคุณทันที
          </p>
          <button
            onClick={() => downloadProtectedFile(`/api/download/${lookupToken}`, 'kodraewjob-template.xlsx')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
          >
            {dbUser ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {dbUser ? 'ดาวน์โหลดไฟล์เดี๋ยวนี้' : 'เข้าสู่ระบบ Gmail เพื่อดาวน์โหลด'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-white">
            บัญชีของฉัน &amp; ดาวน์โหลดไฟล์
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            จัดการประวัติคำสั่งซื้อ ลิงก์ดาวน์โหลด และรายการเทมเพลตที่บันทึกไว้
          </p>
        </div>

        {/* Order Lookup */}
        <form onSubmit={handleOrderLookup} className="flex gap-2">
          <input
            type="text"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ออเดอร์ (เช่น KDJ-...)"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            ค้นหา
          </button>
        </form>
      </div>

      {lookedUpOrder && (
        <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-white">
              ผลค้นหาคำสั่งซื้อ: {lookedUpOrder.orderNumber}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-[#1F1815]">
              {lookedUpOrder.status === 'paid' ? 'ชำระแล้ว' : 'รอชำระเงิน'}
            </span>
          </div>
          <div className="space-y-2">
            {(lookedUpOrder.items || []).map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-[#1F1815] p-3.5 rounded-xl border border-orange-200 dark:border-orange-900/40"
              >
                <span className="font-medium text-sm text-[#1E1B18] dark:text-white">
                  {item.productTitle}
                </span>
                {lookedUpOrder.status === 'paid' ? (
                  <button
                    onClick={() =>
                      downloadProtectedFile(
                        `/api/download/${item.downloadToken}`,
                        `${item.productSlug}.xlsx`
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    {dbUser ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {dbUser ? 'ดาวน์โหลด .xlsx' : 'ล็อกอินเพื่อดาวน์โหลด'}
                  </button>
                ) : (
                  <span className="text-xs text-amber-600">รอตรวจสอบการชำระเงิน</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!dbUser ? (
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-10 text-center soft-card">
          <User className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-white">
            เข้าสู่ระบบเพื่อดาวน์โหลดไฟล์และดูประวัติการสั่งซื้อ
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            ระบบกำหนดให้ยืนยันตัวตนด้วย Gmail (Google) ก่อนดาวน์โหลดไฟล์ทุกครั้ง
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="mt-5 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
          >
            เข้าสู่ระบบด้วย Gmail / Google
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-5 h-5 text-orange-500" />
              <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-white">
                คำสั่งซื้อและไฟล์ดาวน์โหลดของฉัน ({orders.length})
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-orange-100 dark:bg-[#2A201B] rounded-xl" />
                <div className="h-16 bg-orange-100 dark:bg-[#2A201B] rounded-xl" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-sm text-stone-500">
                คุณยังไม่มีประวัติการสั่งซื้อ{' '}
                <button
                  onClick={() => navigate('/templates')}
                  className="text-orange-600 font-semibold hover:underline"
                >
                  เลือกชมเทมเพลตเลย
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-xl border border-orange-200 dark:border-orange-900/40 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1E1B18] dark:text-white">
                          {ord.orderNumber}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500">
                          {new Date(ord.createdAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-sm text-[#1E1B18] dark:text-amber-400 tabular-nums">
                          ฿{ord.totalAmount.toLocaleString()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-semibold ${
                            ord.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {ord.status === 'paid' ? 'ชำระแล้ว' : 'รอตรวจสอบ'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(ord.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FFF7ED] dark:bg-[#2A201B] p-3 rounded-lg"
                        >
                          <span className="text-sm font-medium text-[#1E1B18] dark:text-white">
                            {item.productTitle}
                          </span>
                          {ord.status === 'paid' ? (
                            <button
                              onClick={() =>
                                downloadProtectedFile(
                                  `/api/download/${item.downloadToken}`,
                                  `${item.productSlug}.xlsx`
                                )
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
                            >
                              <Download className="w-3.5 h-3.5" />
                              ดาวน์โหลด .xlsx
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <Clock className="w-3.5 h-3.5" />
                              รอการยืนยันชำระเงิน
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist */}
      {wishedProducts.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-white">
              รายการโปรดของคุณ ({wishedProducts.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
