'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
import { ShoppingCart, CheckCircle2, AlertCircle, Star, MessageSquarePlus } from 'lucide-react';

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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
      // Fetch Reviews for this product
      fetchReviews(data.id);
    }
    
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    
    setLoading(false);
  }

  async function fetchReviews(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || !comment) return;
    setSubmittingReview(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: product.id,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || 'Anonymous Customer',
        rating: Number(rating),
        comment: comment
      });

    if (!error) {
      setComment('');
      setRating(5);
      fetchReviews(product.id);
      alert('আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!');
    } else {
      alert('রিভিউ যুক্ত করতে সমস্যা হয়েছে: ' + error.message);
    }
    setSubmittingReview(false);
  };

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

            {/* Stock status - Responsive */}
            <div className="flex items-center space-x-3 text-sm">
              {product.stock > 0 ? (
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={16} /> In stock
                </span>
              ) : (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle size={16} /> Out of Stock
                </span>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              {hasDiscount ? (
                <div className="space-y-1">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-extrabold text-brandOrange">৳{Number(product.discount_price).toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">৳{Number(product.price).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-extrabold text-brandOrange">৳{Number(product.price).toLocaleString()}</span>
              )}
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
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

      {/* REVIEWS & RATINGS SYSTEM (নতুন রিভিউ ও রেটিং ডাইনামিক সেকশন) */}
      <div className="pt-8 border-t border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-brandDark border-b pb-2 flex items-center gap-2">
          <MessageSquarePlus size={20} className="text-brandBlue" />
          গ্রাহকদের মতামত ও রেটিং ({reviews.length})
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Submission Form */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 h-fit">
            <h4 className="font-bold text-brandDark text-sm mb-3">একটি রিভিউ দিন</h4>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">রেটিং (Rating Stars)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-white text-gray-700"
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                    <option value="2">★★☆☆☆ (2 Stars)</option>
                    <option value="1">★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">আপনার মন্তব্য</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="পণ্যটি সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-white text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-brandBlue text-white text-xs font-bold rounded-lg hover:bg-opacity-95 transition-all"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-gray-400">রিভিউ দিতে প্রথমে আপনার কাস্টমার অ্যাকাউন্টে লগইন করুন।</p>
                <a href="/login" className="inline-block py-2 px-4 bg-brandBlue text-white text-xs font-bold rounded-lg hover:bg-opacity-95">লগইন করুন</a>
              </div>
            )}
          </div>

          {/* Past Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-sm text-brandDark">{rev.user_name}</h5>
                      <span className="text-[10px] text-gray-400">{new Date(rev.created_at).toLocaleDateString('bn-BD')}</span>
                    </div>
                    {/* Stars display */}
                    <div className="flex items-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-xs ${star <= rev.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 font-semibold text-sm">
                এই প্রোডাক্টের জন্য এখনও কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনি দিন!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
