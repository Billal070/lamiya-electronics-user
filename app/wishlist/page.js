'use client';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '../../context/SettingsContext';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const { t } = useSettings();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm space-y-6 my-10">
        <div className="flex justify-center text-gray-300">
          <Heart size={48} />
        </div>
        <h2 className="text-xl font-bold text-brandDark">{t('wishlist_empty')}</h2>
        <p className="text-sm text-gray-400">{t('wishlist_empty_desc')}</p>
        <div className="flex justify-center pt-4">
          <Link href="/" className="bg-brandBlue text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-95 transition-all text-sm shadow">
            {t('cart_home_btn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 my-5">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-brandDark flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500" size={24} />
          {t('wishlist_title')}
        </h1>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          {t('wishlist_total')} {wishlist.length}
        </span>
      </div>

      {/* Grid displays liked products */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
