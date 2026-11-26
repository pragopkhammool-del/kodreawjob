import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Heart,
  Lock,
  ShieldCheck,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Review } from '../types';

interface ProductDetailData extends Product {
  reviews: Review[];
}

export function ProductDetailPage({ slug }: { slug: string }) {
  const {
    navigate,
    addToCart,
    cart,
    wishlist,
    toggleWishlist,
    dbUser,
    getIdToken,
    setAuthModalOpen,
    showToast,
    downloadFreeProduct,
  } = useApp();

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFreeDownload = async () => {
    if (!product) return;
    await downloadFreeProduct(product);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!product) return;
    setSubmittingReview(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setProduct((prev) =>
          prev ? { ...prev, reviews: [data, ...prev.reviews] } : prev
        );
        setCommentInput('');
        showToast({ type: 'success', title: 'บันทึกรีวิวเรียบร้อยแล้ว' });
      } else {
        showToast({ type: 'error', title: data.error || 'ไม่สามารถบันทึกรีวิวได้' });
      }
    } catch {
      showToast({ type: 'error', title: 'เกิดข้อผิดพลาด' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-4 w-48 bg-orange-100 dark:bg-[#2A201B] rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[4/3] bg-orange-100 dark:bg-[#2A201B] rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 bg-orange-100 dark:bg-[#2A201B] rounded w-3/4" />
            <div className="h-24 bg-orange-100 dark:bg-[#2A201B] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display font-bold text-2xl text-[#1E1B18] dark:text-white">
          ไม่พบเทมเพลตนี้ในระบบ
        </h1>
        <button
          onClick={() => navigate('/templates')}
          className="mt-5 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold"
        >
          กลับไปหน้าคลังสินค้า
        </button>
      </div>
    );
  }

  const inCart = cart.some((item) => item.id === product.id);
  const isWished = wishlist.includes(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-orange-600">
          หน้าแรก
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate('/templates')} className="hover:text-orange-600">
          เทมเพลต
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E1B18] dark:text-white font-medium truncate max-w-xs sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Gallery + Sheet Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 soft-card">
            <div className="aspect-[4/3] bg-orange-50 dark:bg-[#2A201B]">
              <img
                src={product.previewImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Interactive Sample Table Preview */}
          <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 soft-card">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                <h2 className="font-display font-bold text-base text-[#1E1B18] dark:text-white">
                  โครงสร้างชีตและสูตรคำนวณภายในไฟล์
                </h2>
              </div>
              <span className="font-mono text-xs text-stone-500">.xlsx</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-orange-200 dark:border-orange-900/40">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-[#FFEDD5] dark:bg-[#2A201B] text-[#1E1B18] dark:text-orange-100">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">ชีต (Worksheet)</th>
                    <th className="px-3 py-2.5 font-semibold">หน้าที่หลัก</th>
                    <th className="px-3 py-2.5 font-semibold">สูตรอัตโนมัติ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 dark:divide-orange-900/40 text-stone-600 dark:text-stone-300">
                  <tr>
                    <td className="px-3 py-2.5 font-medium text-[#1E1B18] dark:text-white">Dashboard สรุปผล</td>
                    <td className="px-3 py-2.5">สรุปยอด KPI, ผลรวม, ค่าเฉลี่ยอัตโนมัติ</td>
                    <td className="px-3 py-2.5 font-mono text-orange-600 dark:text-orange-400">SUM, AVERAGE, COUNTA</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-medium text-[#1E1B18] dark:text-white">ฐานข้อมูลและคำนวณ</td>
                    <td className="px-3 py-2.5">คำนวณข้อมูลตรงตามงาน (สต๊อก/เงินเดือน/ภาษี/เกรด/BOM)</td>
                    <td className="px-3 py-2.5 font-mono text-orange-600 dark:text-orange-400">IF, MIN, ROUND, BAHTTEXT</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-medium text-[#1E1B18] dark:text-white">คู่มือสูตรและวิธีใช้</td>
                    <td className="px-3 py-2.5">คำอธิบายสูตรและการปรับใช้งานจริง</td>
                    <td className="px-3 py-2.5 font-mono text-orange-600 dark:text-orange-400">พร้อมพิมพ์ A4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sticky Purchase Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-6 sm:p-8 soft-card space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span>{product.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span>ขนาด {product.fileSize}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-amber-500 font-semibold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {product.ratingAvg.toFixed(1)} ({product.reviews.length} รีวิว)
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1E1B18] dark:text-white mt-2 leading-snug">
              {product.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              {product.price === 0 ? (
                <span className="font-display font-bold text-3xl text-orange-600 dark:text-orange-400 tabular-nums">
                  ฟรี ฿0
                </span>
              ) : (
                <span className="font-display font-bold text-3xl text-[#1E1B18] dark:text-amber-400 tabular-nums">
                  ฿{product.price.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-stone-500 tabular-nums">
                ดาวน์โหลดแล้ว {product.downloadCount} ครั้ง
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-2.5 pt-2">
            <p className="font-display font-semibold text-sm text-[#1E1B18] dark:text-white">
              จุดเด่นและความสามารถหลัก
            </p>
            <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
              {product.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Primary Buy / Download CTA */}
          <div className="space-y-3 pt-2">
            {product.price === 0 ? (
              <div className="space-y-2">
                <button
                  onClick={handleFreeDownload}
                  className="w-full py-3.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  {dbUser ? <Download className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  {dbUser
                    ? 'ดาวน์โหลดไฟล์ .xlsx ฟรีทันที'
                    : 'เข้าสู่ระบบ Gmail / LINE / Facebook เพื่อดาวน์โหลด'}
                </button>
                {!dbUser && (
                  <p className="text-[11px] text-center text-orange-600 dark:text-orange-400">
                    ระบบกำหนดให้ยืนยันตัวตนด้วย Gmail (Google) ก่อนดาวน์โหลดไฟล์ทุกครั้ง
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (!inCart) addToCart(product);
                    navigate('/checkout');
                  }}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
                >
                  ซื้อและสแกน PromptPay ทันที
                </button>
                <button
                  onClick={() => addToCart(product)}
                  className="px-4 py-3.5 rounded-xl bg-[#231915] dark:bg-[#2A201B] hover:bg-orange-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {inCart ? 'อยู่ในตะกร้า' : 'ใส่ตะกร้า'}
                </button>
              </div>
            )}

            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-2.5 px-4 rounded-xl border border-orange-200 dark:border-orange-900/50 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:border-rose-400 flex items-center justify-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isWished ? 'บันทึกในรายการโปรดแล้ว' : 'เพิ่มในรายการโปรด'}
            </button>
          </div>

          <div className="pt-4 border-t border-orange-100 dark:border-orange-900/40 flex items-center gap-2.5 text-xs text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              ล็อกอินเพื่อรับลิงก์ดาวน์โหลดที่ปลอดภัย · มีสูตรคำนวณครบ ไม่ล็อกสูตร ปรับแต่งต่อได้
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-14 pt-12 border-t border-orange-200 dark:border-orange-900/40 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <h2 className="font-display font-bold text-xl text-[#1E1B18] dark:text-white">
            รีวิวจากผู้ใช้งานจริง ({product.reviews.length})
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            แบ่งปันประสบการณ์การใช้งานเพื่อช่วยผู้ประกอบการท่านอื่นตัดสินใจ
          </p>

          <form
            onSubmit={handleReviewSubmit}
            className="mt-6 rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-5 soft-card space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                ให้คะแนนเทมเพลต
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= ratingInput
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 dark:text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                ความคิดเห็นของคุณ
              </label>
              <textarea
                rows={3}
                required
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="เล่าประสบการณ์การใช้งานจริง เช่น สูตรใช้งานง่าย ประหยัดเวลา..."
                className="w-full px-3 py-2 rounded-lg bg-[#FFF7ED] dark:bg-[#2A201B] border border-orange-200 dark:border-orange-900/50 text-sm text-[#1E1B18] dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
            >
              {dbUser
                ? submittingReview
                  ? 'กำลังบันทึก...'
                  : 'ส่งรีวิว'
                : 'เข้าสู่ระบบด้วย Google เพื่อเขียนรีวิว'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {product.reviews.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-8 text-center text-sm text-stone-500">
              ยังไม่มีรีวิวสำหรับสินค้านี้ เป็นคนแรกที่เขียนรีวิวได้เลยครับ
            </div>
          ) : (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/80 dark:border-orange-900/40 p-5 soft-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-sm text-[#1E1B18] dark:text-white">
                      {rev.authorName}
                    </p>
                    <p className="text-[11px] text-orange-600 dark:text-orange-400">
                      {rev.verifiedPurchase ? 'ยืนยันการสั่งซื้อ/ดาวน์โหลดจริง' : 'ผู้ใช้งาน'}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
