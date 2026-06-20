'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { t } = useSettings();
  
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  const imageUrl = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : 'https://placehold.co/300x300/e2e8f0/1e293b?text=Lamiya+Electronics';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col group transition-all duration-300">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden aspect-square bg-gray-50 dark:bg-slate-950">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-contain w-full h-full p-2 md:p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-1.5 left-1.5 bg-brandOrange text-brandBlue text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded">
            {discountPercent}% {t('off')}
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 bg-white dark:bg-slate-950 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center font-bold text-red-600 text-xs md:text-sm">
            {t('stock_out')}
          </span>
        )}
      </Link>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
          {product.categories?.name || 'Electronics'}
        </span>
        <Link href={`/product/${product.slug}`} className="font-semibold text-brandDark dark:text-white hover:text-brandBlue dark:hover:text-brandOrange line-clamp-2 text-xs md:text-base leading-tight mb-2 h-8 md:h-10">
          {product.name}
        </Link>

        {/* Pricing */}
        <div className="mt-auto mb-3">
          {hasDiscount ? (
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm md:text-lg font-extrabold text-brandBlue dark:text-brandOrange">৳{Number(product.discount_price).toLocaleString()}</span>
              <span className="text-[10px] md:text-xs text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>
            </div>
          ) : (
            <span className="text-sm md:text-lg font-extrabold text-brandBlue dark:text-brandOrange">৳{Number(product.price).toLocaleString()}</span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.stock <= 0}
          className={`w-full py-2 md:py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            product.stock > 0 
              ? 'bg-brandBlue text-white hover:bg-opacity-95' 
              : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={14} />
          <span className="hidden xs:inline">{t('add_to_cart')}</span>
        </button>
      </div>
    </div>
  );
}
