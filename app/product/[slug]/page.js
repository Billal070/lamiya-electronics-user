'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
import { ShoppingCart, ShieldAlert, BadgeCheck, AlertCircle } from 'lucide-react';

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  async function fetchProduct() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0]);
      }
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500">লোডিং হচ্ছে...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 font-bold text-red-500">প্রোডাক্টটি খুঁজে পাওয়া যায়নি!</div>;
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const currentPrice = hasDiscount ? product.discount_price : product.price;

  const defaultPlaceholder = 'https://placehold.co/500x500/e2e8f0/1e293b?text=Lamiya+Electronics';

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 border rounded-xl overflow-hidden flex items-center justify-center p-4">
            <img
              src={activeImage || defaultPlaceholder}
              alt={product.name}
              className="object-contain max-h-full max-w-full"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`border rounded-lg p-1 w-16 h-16 flex-shrink-0 bg-white ${
                    activeImage === imgUrl ? 'border-brandBlue ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  <img src={imgUrl} alt="" className="object-contain w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="bg-brandBlue bg-opacity-10 text-brandBlue text-xs font-bold px-3 py-1.5 rounded-full">
              {product.categories?.name || 'Electronics'}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-brandDark">{product.name}</h1>

            <div className="flex items-center space-x-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? `স্টক আছে (${product.stock} টি)` : 'স্টক আউট'}
              </span>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              {hasDiscount ? (
                <div className="space-y-1">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-extrabold text-brandBlue">৳{Number(product.discount_price).toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-brandOrange font-bold">
                    আপনি পাচ্ছেন ৳{(product.price - product.discount_price).toLocaleString()} মূল্যছাড়!
                  </p>
                </div>
              ) : (
                <span className="text-3xl font-extrabold text-brandBlue">৳{Number(product.price).toLocaleString()}</span>
              )}
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-500">পরিমাণ:</span>
                <div className="flex border rounded-lg overflow-hidden w-32 bg-gray-50">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-gray-200 transition-colors font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent focus:outline-none font-bold text-brandDark text-sm"
                  />
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 hover:bg-gray-200 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock <= 0}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                product.stock > 0
                  ? 'bg-brandBlue text-white hover:bg-opacity-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingCart size={20} />
              কার্টে যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="pt-8 border-t border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-brandDark border-b pb-2">প্রোডাক্ট স্পেসিফিকেশন (Specifications)</h3>
          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-left text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-3 font-semibold text-brandDark w-1/3 border-r border-gray-100">{key}</td>
                    <td className="px-6 py-3 text-gray-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}