'use client';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard';
import { Heart, PackageOpen } from 'lucide-react';
import Link from 'next/link';

export default function Wishlist() {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm space-y-6 my-10">
        <div className="flex justify-center text-gray-300">
          <Heart size={48} />
        </div>
        <h2 className="text-xl font-bold text-brandDark">আপনার ইচ্ছেতালিকাটি সম্পূর্ণ খালি!</h2>
        <p className="text-sm text-gray-400">হোমপেজ থেকে আপনার পছন্দের পণ্যের ওপর থাকা লাভ আইকনে ক্লিক করে এখানে যুক্ত করতে পারেন।</p>
        <div className="flex justify-center pt-4">
          <Link href="/" className="bg-brandBlue text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-95 transition-all text-sm shadow">
            প্রোডাক্ট দেখতে হোমপেজে যান
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
          আপনার ইচ্ছেতালিকা (Wishlist)
        </h1>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          মোট প্রোডাক্ট: {wishlist.length} টি
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
