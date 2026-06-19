'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  // Calculate discount percentage
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  // Render first product image or fallback placeholder
  const imageUrl = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : 'https://placehold.co/300x300/e2e8f0/1e293b?text=Lamiya+Electronics';

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col group transition-all duration-300">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden aspect-square bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-brandOrange text-brandBlue text-xs font-bold px-2 py-1 rounded">
            {discountPercent}% OFF
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center font-bold text-red-600 text-sm">
            স্টক আউট
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
          {product.categories?.name || 'Electronics'}
        </span>
        <Link href={`/product/${product.slug}`} className="font-semibold text-brandDark hover:text-brandBlue line-clamp-2 text-sm md:text-base leading-tight mb-2 h-10">
          {product.name}
        </Link>

        {/* Pricing */}
        <div className="mt-auto mb-4">
          {hasDiscount ? (
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-brandBlue">৳{Number(product.discount_price).toLocaleString()}</span>
              <span className="text-xs text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-brandBlue">৳{Number(product.price).toLocaleString()}</span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.stock <= 0}
          className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            product.stock > 0 
              ? 'bg-brandBlue text-white hover:bg-opacity-95' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={16} />
          কার্টে যোগ করুন
        </button>
      </div>
    </div>
  );
}