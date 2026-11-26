import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Lock,
  QrCode,
  ShoppingBag,
  Trash2,
  Upload,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderDTO, OrderItemDTO } from '../types';

const PROMPTPAY_ATTACHED_QR = '/assets/aistudio/Untitled_e84a513c.jpg';

export function CartCheckoutPage({ mode }: { mode: 'cart' | 'checkout' }) {
  const {
    cart,
    removeFromCart,
    clearCart,
    navigate,
    dbUser,
    getIdToken,
    showToast,
    downloadProtectedFile,
  } = useApp();

  const [customerName, setCustomerName] = useState(dbUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(dbUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'promptpay' | 'bank_transfer' | 'card' | 'truemoney'
  >('promptpay');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDTO | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDTO[]>([]);
  const [dynamicQrDataUrl, setDynamicQrDataUrl] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (dbUser) {
      if (!customerName) setCustomerName(dbUser.name);
      if (!customerEmail) setCustomerEmail(dbUser.email);
    }
  }, [dbUser, customerName, customerEmail]);

  const subtotal = cart.reduce((sum, p) => sum + p.price, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
        showToast({
          type: 'success',
          title: `ใช้คูปอง ${data.code} สำเร็จ`,
          description: `ส่วนลด ฿${data.discountAmount.toLocaleString()}`,
        });
      } else {
        setAppliedCoupon(null);
        showToast({ type: 'error', title: data.error || 'คูปองไม่ถูกต้อง' });
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถตรวจสอบคูปองได้' });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const token = await getIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productIds: cart.map((p) => p.id),
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedOrder(data.order);
        setOrderItems(data.items || []);
        setDynamicQrDataUrl(data.promptpayQr?.qrDataUrl || null);
        clearCart();
        showToast({
          type: 'success',
          title: `สร้างคำสั่งซื้อ ${data.order.orderNumber} สำเร็จ`,
        });
      } else {
        showToast({ type: 'error', title: data.error || 'สร้างคำสั่งซื้อไม่สำเร็จ' });
      }
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาดในการสั่งซื้อ' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSlip = async (instantConfirm: boolean) => {
    if (!createdOrder) return;
    setConfirming(true);
    try {
      if (slipFile) {
        const formData = new FormData();
        formData.append('slip', slipFile);
        formData.append('instantConfirm', String(instantConfirm));
        const res = await fetch(`/api/orders/${createdOrder.orderNumber}/upload-slip`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setCreatedOrder(data.order);
          setOrderItems(data.items || []);
          showToast({
            type: 'success',
            title:
              data.order.status === 'paid'
                ? 'ยืนยันการชำระเงินสำเร็จ ดาวน์โหลดไฟล์ได้ทันที'
                : 'ส่งสลิปเรียบร้อย รอแอดมินตรวจสอบสักครู่',
          });
        }
      } else {
        const res = await fetch(`/api/orders/${createdOrder.orderNumber}/confirm-payment`, {
          method: 'POST',
        });
        const data = await res.json();
        if (res.ok) {
          setCreatedOrder(data.order);
          setOrderItems(data.items || []);
          showToast({
            type: 'success',
            title: 'ยืนยันการชำระเงินผ่าน PromptPay เรียบร้อยแล้ว',
          });
        }
      }
    } catch {
      showToast({ type: 'error', title: 'ไม่สามารถยืนยันการชำระเงินได้' });
    } finally {
      setConfirming(false);
    }
  };

  // POST-ORDER PAYMENT & DOWNLOAD VIEW
  if (createdOrder) {
    const isPaid = createdOrder.status === 'paid';
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-6 sm:p-10 soft-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-100 dark:border-orange-900/40">
            <div>
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                คำสั่งซื้อเลขที่ {createdOrder.orderNumber}
              </p>
              <h1 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-white mt-1">
                {isPaid ? 'ชำระเงินสำเร็จ พร้อมดาวน์โหลดทันที' : 'กรุณาสแกนชำระเงิน'}
              </h1>
            </div>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold self-start ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {isPaid ? 'ชำระเงินแล้ว (Paid)' : 'รอชำระเงิน (Pending)'}
            </span>
          </div>

          {!isPaid ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="rounded-2xl bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 p-5 text-center space-y-4">
                <p className="font-display font-bold text-base text-[#1E1B18] dark:text-white">
                  ยอดชำระสุทธิ ฿{createdOrder.totalAmount.toLocaleString()}
                </p>

                {dynamicQrDataUrl && (
                  <div className="bg-white p-3 rounded-xl inline-block border border-orange-200">
                    <img
                      src={dynamicQrDataUrl}
                      alt="Dynamic PromptPay QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      QR พร้อมยอดเงิน ฿{createdOrder.totalAmount.toLocaleString()} อัตโนมัติ
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-orange-200/70 dark:border-orange-900/40">
                  <p className="text-xs text-stone-600 dark:text-stone-300 mb-2">
                    หรือสแกนผ่าน Thai QR PromptPay ของร้าน กดแล้วจบ (Kodraewjob):
                  </p>
                  <img
                    src={PROMPTPAY_ATTACHED_QR}
                    alt="Thai QR Payment PromptPay กดแล้วจบ"
                    referrerPolicy="no-referrer"
                    className="w-48 mx-auto rounded-xl border border-orange-200"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl bg-[#FFF7ED] dark:bg-[#2A201B] p-4 text-xs sm:text-sm space-y-1.5 text-stone-600 dark:text-stone-300">
                  <p className="font-semibold text-[#1E1B18] dark:text-white">
                    รองรับทุกแอปธนาคารชั้นนำ:
                  </p>
                  <p>K PLUS (กสิกรไทย) · SCB EASY · Krungthai NEXT · Bangkok Bank</p>
                  <p className="pt-1 text-xs text-stone-500">
                    ผู้สั่งซื้อ: {createdOrder.customerName} ({createdOrder.customerEmail})
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    แนบสลิปโอนเงิน (ไม่บังคับหากยืนยัน QR ทันที)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-800 cursor-pointer hover:border-orange-500 text-sm text-stone-600 dark:text-stone-300">
                    <Upload className="w-4 h-4 text-orange-500" />
                    <span>{slipFile ? slipFile.name : 'เลือกรูปภาพสลิป (.jpg / .png)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleUploadSlip(true)}
                    disabled={confirming}
                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
                  >
                    {confirming ? 'กำลังตรวจสอบ...' : 'ยืนยันการโอนเงิน & รับไฟล์ทันที'}
                  </button>
                  {slipFile && (
                    <button
                      onClick={() => handleUploadSlip(false)}
                      disabled={confirming}
                      className="w-full py-2.5 rounded-xl border border-orange-200 dark:border-orange-800 text-xs font-semibold text-stone-600 dark:text-stone-300"
                    >
                      ส่งสลิปให้แอดมินตรวจสอบภายหลัง
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div className="text-sm text-[#1E1B18] dark:text-orange-100">
                  <p className="font-semibold">
                    ระบบออกลิงก์ดาวน์โหลดที่ปลอดภัย (Secure Token 24 ชม.) เรียบร้อยแล้ว
                  </p>
                  <p className="text-xs mt-0.5 opacity-85">
                    กดปุ่มดาวน์โหลดด้านล่าง (ต้องล็อกอิน Gmail / บัญชี Google เพื่อยืนยันสิทธิ์ก่อนดาวน์โหลดไฟล์ .xlsx)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-orange-200 dark:border-orange-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-display font-bold text-base text-[#1E1B18] dark:text-white">
                        {item.productTitle}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 tabular-nums">
                        ราคา ฿{item.price.toLocaleString()} · ลิงก์หมดอายุใน 24 ชั่วโมง
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        downloadProtectedFile(
                          `/api/download/${item.downloadToken}`,
                          `${item.productSlug}.xlsx`
                        )
                      }
                      className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {dbUser ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {dbUser ? 'ดาวน์โหลดไฟล์ .xlsx' : 'ล็อกอินเพื่อดาวน์โหลด .xlsx'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-[#231915] dark:bg-[#2A201B] text-white text-sm font-semibold"
                >
                  ไปยังหน้าไฟล์ของฉัน
                </button>
                <button
                  onClick={() => navigate('/templates')}
                  className="px-5 py-2.5 rounded-xl border border-orange-200 dark:border-orange-800 text-sm font-semibold text-stone-700 dark:text-stone-200"
                >
                  เลือกชมเทมเพลตอื่นต่อ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // EMPTY CART STATE
  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-white">
          ตะกร้าสินค้าของคุณยังว่างอยู่
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
          เลือกเทมเพลต Excel หรือระบบอัตโนมัติที่ช่วยให้ธุรกิจทำงานเร็วขึ้นได้เลยครับ
        </p>
        <button
          onClick={() => navigate('/templates')}
          className="mt-6 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold inline-flex items-center gap-2"
        >
          เลือกชมเทมเพลตทั้งหมด
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-orange-600">
          หน้าแรก
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E1B18] dark:text-white font-medium">
          {mode === 'cart' ? 'ตะกร้าสินค้า' : 'ชำระเงิน'}
        </span>
      </nav>

      <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-white mb-8">
        {mode === 'cart' ? 'ตะกร้าสินค้าของคุณ' : 'ดำเนินการชำระเงิน'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items or Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 sm:p-6 soft-card space-y-4">
            <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-white">
              รายการสินค้า ({cart.length})
            </h2>
            <div className="divide-y divide-orange-100 dark:divide-orange-900/40">
              {cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <img
                    src={item.previewImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-16 rounded-xl object-cover shrink-0 bg-orange-50"
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/templates/${item.slug}`)}
                      className="font-display font-semibold text-sm sm:text-base text-[#1E1B18] dark:text-white hover:text-orange-600 text-left truncate block w-full"
                    >
                      {item.title}
                    </button>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.categoryName} · {item.fileSize}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="font-display font-bold text-base text-[#1E1B18] dark:text-amber-400 tabular-nums">
                      {item.price === 0 ? 'ฟรี' : `฿${item.price.toLocaleString()}`}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label="ลบสินค้าออก"
                      className="p-2 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            id="checkout-form"
            onSubmit={handlePlaceOrder}
            className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 sm:p-6 soft-card space-y-5"
          >
            <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-white">
              ข้อมูลผู้รับไฟล์ &amp; ช่องทางชำระเงิน
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  ชื่อ-นามสกุล / ชื่อบริษัท
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="เช่น คุณสมชาย ใจดี"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  อีเมลสำหรับรับลิงก์ดาวน์โหลด
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@company.co.th"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                เบอร์โทรศัพท์ หรือ LINE ID (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Payment Options */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                เลือกวิธีชำระเงิน
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'promptpay',
                    title: 'PromptPay QR Code',
                    sub: 'สแกนจ่ายทุกแอปธนาคาร ไม่มีค่าธรรมเนียม',
                    icon: QrCode,
                  },
                  {
                    id: 'bank_transfer',
                    title: 'โอนเงินธนาคาร + แนบสลิป',
                    sub: 'KBANK / SCB / BBL / KTB',
                    icon: Building2,
                  },
                  {
                    id: 'card',
                    title: 'บัตรเครดิต / เดบิต',
                    sub: 'Visa / Mastercard (อนุมัติทันที)',
                    icon: CreditCard,
                  },
                  {
                    id: 'truemoney',
                    title: 'TrueMoney Wallet',
                    sub: 'ชำระผ่านวอลเล็ททันที',
                    icon: Wallet,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id as any)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        active
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                          : 'border-orange-200 dark:border-orange-900/40 hover:border-orange-400'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          active ? 'text-orange-600' : 'text-stone-400'
                        }`}
                      />
                      <div>
                        <p className="font-display font-semibold text-sm text-[#1E1B18] dark:text-white">
                          {opt.title}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {opt.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card space-y-5">
          <h2 className="font-display font-bold text-lg text-[#1E1B18] dark:text-white">
            สรุปยอดคำสั่งซื้อ
          </h2>

          {/* Coupon input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="โค้ดส่วนลด (เช่น KODRAEWJOB10)"
                className="flex-1 px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 rounded-xl bg-[#231915] dark:bg-orange-600 text-white text-xs font-semibold"
              >
                ใช้โค้ด
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              โค้ดแนะนำ: <span className="font-mono text-orange-600">KODRAEWJOB10</span> (ลด 10%) ·{' '}
              <span className="font-mono text-orange-600">LAUNCH50</span> (ลด ฿50)
            </p>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-orange-100 dark:border-orange-900/40 text-sm">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>ยอดรวมสินค้า</span>
              <span className="tabular-nums">฿{subtotal.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>ส่วนลด ({appliedCoupon.code})</span>
                <span className="tabular-nums">-฿{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-orange-100 dark:border-orange-900/40 font-display font-bold text-lg text-[#1E1B18] dark:text-white">
              <span>ยอดสุทธิ</span>
              <span className="tabular-nums text-orange-600 dark:text-orange-400">
                ฿{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm sm:text-base transition-colors"
          >
            {submitting
              ? 'กำลังสร้างคำสั่งซื้อ...'
              : totalAmount === 0
              ? 'รับไฟล์ฟรีทันที'
              : `ยืนยันสั่งซื้อและชำระเงิน ฿${totalAmount.toLocaleString()}`}
          </button>

          <div className="pt-3 border-t border-orange-100 dark:border-orange-900/40 flex items-center gap-3">
            <img
              src={PROMPTPAY_ATTACHED_QR}
              alt="PromptPay Ready"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-lg object-cover border border-orange-200"
            />
            <div className="text-xs text-stone-500 dark:text-stone-400">
              <p className="font-semibold text-[#1E1B18] dark:text-stone-200">
                รองรับ Thai QR PromptPay
              </p>
              <p>ระบบสร้าง QR พร้อมยอดเงินอัตโนมัติในขั้นตอนถัดไป</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
