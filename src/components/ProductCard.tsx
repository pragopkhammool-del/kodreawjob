import React, { useState } from 'react';
import { Check, Download, Heart, ShoppingCart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { navigate, addToCart, cart, wishlist, toggleWishlist, downloadFreeProduct } = useApp();
  const [imgError, setImgError] = useState(false);

  const inCart = cart.some((item) => item.id === product.id);
  const isWished = wishlist.includes(product.id);

  const handleInstantFreeDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadFreeProduct(product);
  };

  return (
    <article
      onClick={() => navigate(`/templates/${product.slug}`)}
      className="group cursor-pointer rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200/70 dark:border-orange-900/40 soft-card overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-orange-400"
    >
      {/* 4:3 Image Frame */}
      <div className="relative aspect-[4/3] bg-orange-50 dark:bg-[#2A201B] overflow-hidden">
        {!imgError && product.previewImage ? (
          <img
            src={product.previewImage}
            alt={product.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-[#2A201B] dark:to-[#1F1815] p-4 text-center">
            <span className="font-display font-semibold text-sm text-stone-600 dark:text-stone-300 line-clamp-2">
              {product.title}
            </span>
          </div>
        )}

        {/* Single quiet tag only when bestseller or advanced */}
        {(product.isBestseller || product.level === 'advanced') && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide ${
              product.isBestseller
                ? 'bg-[#1E1B18]/90 text-white'
                : 'bg-amber-400 text-[#1E1B18]'
            }`}
          >
            {product.isBestseller ? 'ขายดี' : 'ขั้นสูง'}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="บันทึกในรายการโปรด"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-[#1F1815]/90 text-stone-600 dark:text-stone-300 hover:text-rose-500 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Hover quick-action bar */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hidden sm:block">
          {product.price === 0 ? (
            <button
              onClick={handleInstantFreeDownload}
              className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              ล็อกอินเพื่อดาวน์โหลดฟรี (.xlsx)
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg transition-colors ${
                inCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1E1B18] hover:bg-orange-600 text-white'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  อยู่ในตะกร้าแล้ว
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  เพิ่มลงตะกร้า
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Zero-pill clean unboxed metadata */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 truncate">
          <span>{product.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{product.fileSize}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-0.5 tabular-nums text-amber-600 dark:text-amber-400 font-medium">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.ratingAvg.toFixed(1)}
          </span>
        </div>

        <h3 className="font-display font-semibold text-[15px] sm:text-base text-[#1E1B18] dark:text-orange-50 mt-1.5 line-clamp-2 leading-snug">
          {product.title}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1.5 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price + Mobile Action */}
        <div className="mt-4 pt-3 border-t border-orange-100 dark:border-orange-900/40 flex items-center justify-between gap-2">
          <div>
            {product.price === 0 ? (
              <span className="font-display font-bold text-base text-orange-600 dark:text-orange-400 tabular-nums">
                ฟรี ฿0
              </span>
            ) : (
              <span className="font-display font-bold text-base text-[#1E1B18] dark:text-amber-400 tabular-nums">
                ฿{product.price.toLocaleString()}
              </span>
            )}
            <span className="ml-2 text-[11px] text-stone-400 tabular-nums">
              {product.downloadCount} โหลด
            </span>
          </div>

          {product.price === 0 ? (
            <button
              onClick={handleInstantFreeDownload}
              className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 hover:bg-orange-500 hover:text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              ดาวน์โหลด
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                inCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {inCart ? 'ในตะกร้า' : 'ซื้อเลย'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
