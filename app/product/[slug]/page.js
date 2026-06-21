'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useSettings } from '../../../context/SettingsContext';
import { 
  ShoppingCart, CheckCircle2, AlertCircle, Star, 
  MessageSquarePlus, X, Heart, Eye, Maximize2, 
  Facebook, Twitter, Linkedin, Send, MessageCircle 
} from 'lucide-react';

export default function ProductDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { lang, t } = useSettings();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Tab State: 'description' | 'reviews'
  const [activeTab, setActiveTab] = useState('description');

  // Review states
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Conversion Boosters states
  const [viewersCount, setViewersCount] = useState(10);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetchProduct();
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, [slug]);

  // ডাইনামিক রিয়েল-টাইম ভিউয়ার হিসাব
  useEffect(() => {
    if (product) {
      const baseId = Number(product.id) || 1;
      const currentMinute = new Date().getMinutes();
      const calculatedViewers = 5 + ((baseId + currentMinute) % 11);
      setViewersCount(calculatedViewers);
    }
  }, [product]);

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
      fetchReviews(data.id);
    }
    
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

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/cart');
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500">{t('loading')}</div>;
  }

  if (!product) {
    return <div className="text-center py-20 font-bold text-red-500">{t('not_found')}</div>;
  }

  const originalPrice = Number(product.price);
  const discountPrice = Number(product.discount_price);
  const hasDiscount = discountPrice > 0 && discountPrice < originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;
  
  const defaultPlaceholder = 'https://placehold.co/500x500/e2e8f0/1e293b?text=Lamiya+Electronics';

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const isLiked = isInWishlist(product.id);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-8 my-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Product Gallery & Badges */}
        <div className="space-y-4 relative">
          {hasDiscount && (
            <span className="absolute top-4 right-4 z-20 bg-brandOrange text-brandBlue text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md select-none">
              -{discountPercent}%
            </span>
          )}

          <div className="relative aspect-square bg-gray-50 border rounded-xl overflow-hidden flex items-center justify-center p-4">
            <img
              src={activeImage || defaultPlaceholder}
              alt={product.name}
              className="object-contain max-h-full max-w-full"
            />
            <button className="absolute bottom-4 left-4 p-2.5 bg-white rounded-full shadow-md text-gray-400 hover:text-brandBlue transition-all">
              <Maximize2 size={16} />
            </button>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
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

        {/* Right Side: Product Information Panel */}
        <div className="space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-xl md:text-3xl font-bold text-brandBlue leading-tight">{product.name}</h1>

            {/* Ratings Header */}
            <div className="flex items-center space-x-2 text-xs md:text-sm">
              <div className="flex items-center space-x-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-base ${star <= Math.round(avgRating) ? 'text-amber-400 font-bold' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
              <span className="text-gray-400 font-semibold select-none">({reviews.length} customer reviews)</span>
            </div>

            {/* Pricing Section (Strikethrough Price made Larger for Pro Look) */}
            <div className="border-y py-4 border-gray-100 flex items-center space-x-4">
              {hasDiscount ? (
                <div className="flex items-baseline space-x-3.5">
                  <span className="text-base md:text-lg text-gray-400 line-through font-bold">৳{originalPrice.toLocaleString()}</span>
                  <span className="text-2xl md:text-3xl font-extrabold text-brandOrange">৳{discountPrice.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-extrabold text-brandOrange">৳{originalPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Dynamic Key Features Bullet Points */}
            <div className="space-y-2 pt-1">
              {product.key_features && product.key_features.length > 0 ? (
                /* যদি অ্যাডমিন প্যানেল থেকে কাস্টম কুইক স্পেকস দেওয়া থাকে */
                product.key_features.map((feature, idx) => (
                  <div key={idx} className="text-xs md:text-sm text-gray-600 flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brandOrange shrink-0"></span>
                    <span className="font-semibold text-gray-700">{feature}</span>
                  </div>
                ))
              ) : (
                /* ব্যাকআপ লজিক: কাস্টম কুইক স্পেকস না থাকলে টেবিলের প্রথম ৪টি আইটেম দেখাবে */
                product.specifications && Object.keys(product.specifications).length > 0 && (
                  Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="text-xs md:text-sm text-gray-500 flex gap-1">
                      <span className="font-bold text-gray-600">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t border-gray-100">
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('quantity')}</span>
                <div className="flex border rounded-lg overflow-hidden w-28 bg-gray-50">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-gray-200 transition-colors font-bold text-sm"
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
                    className="px-3 py-1.5 hover:bg-gray-200 transition-colors font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock <= 0}
                className={`py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none ${
                  product.stock > 0
                    ? 'bg-brandBlue text-white hover:bg-opacity-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <ShoppingCart size={16} />
                {t('add_to_cart')}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className={`py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none ${
                  product.stock > 0
                    ? 'bg-brandOrange text-brandBlue hover:bg-opacity-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Wishlist & Social Sharing */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs select-none">
              <button
                onClick={() => toggleWishlist(product)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 font-bold transition-colors focus:outline-none"
              >
                <Heart size={16} className={isLiked ? 'text-red-500 fill-red-500' : ''} />
                <span>{isLiked ? 'Remove from wishlist' : 'Add to wishlist'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-400">Share:</span>
                <div className="flex items-center space-x-2">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                    target="_blank" rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-all"
                  >
                    <Facebook size={14} />
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`} 
                    target="_blank" rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 text-gray-500 hover:bg-slate-200 hover:text-black rounded-full transition-all"
                  >
                    <Twitter size={14} />
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
                    target="_blank" rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-all"
                  >
                    <Linkedin size={14} />
                  </a>
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' ' + shareUrl)}`} 
                    target="_blank" rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600 rounded-full transition-all"
                  >
                    <MessageCircle size={14} />
                  </a>
                  <a 
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`} 
                    target="_blank" rel="noopener noreferrer"
                    className="p-1.5 bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-500 rounded-full transition-all"
                  >
                    <Send size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Real-time Viewer Counter */}
            <div className="bg-blue-50/50 border border-blue-100/50 p-3 rounded-lg flex items-center gap-2 text-xs text-brandBlue font-bold select-none">
              <Eye size={16} />
              <span>{viewersCount} people watching this product right now!</span>
            </div>

          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="pt-8 border-t border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-brandDark border-b pb-2">{t('specs_title')}</h3>
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

      {/* REVIEWS & RATINGS SYSTEM */}
      <div className="pt-10 border-t border-gray-100 space-y-6">
        <div className="flex justify-center space-x-8 border-b pb-3 mb-6 select-none font-bold text-sm tracking-wider">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'description' 
                ? 'border-brandBlue text-brandBlue' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            DESCRIPTION
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-all uppercase ${
              activeTab === 'reviews' 
                ? 'border-brandBlue text-brandBlue' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            REVIEWS ({reviews.length})
          </button>
        </div>

        {/* Dynamic Tab Rendering */}
        {activeTab === 'description' ? (
          /* A. DESCRIPTION VIEW */
          <div className="p-4 bg-gray-50 rounded-xl border leading-relaxed text-sm text-gray-600">
            {product.description || 'No description available.'}
          </div>
        ) : (
          /* B. REVIEWS & RATINGS VIEW */
          <div className="space-y-10 animate-fade-in">
            {/* Top Stats Summary Block */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              {/* Average Box */}
              <div className="text-center space-y-1.5 md:border-r pr-0 md:pr-12 md:w-1/3 flex flex-col items-center">
                <h2 className="text-6xl font-extrabold text-brandDark tracking-tight">{avgRating}</h2>
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xl ${star <= Math.round(avgRating) ? 'text-amber-400 font-bold' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-bold">{reviews.length} reviews</p>
              </div>

              {/* Star Progress Bars breakdown */}
              <div className="flex-grow w-full md:w-2/3 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = starCounts[star] || 0;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center text-xs md:text-sm gap-3">
                      {/* Stars label */}
                      <div className="flex items-center shrink-0 w-24">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-sm ${s <= star ? 'text-amber-400 font-bold' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                      {/* Progress bar */}
                      <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${percentage}%` }} 
                          className={`h-full rounded-full transition-all duration-500 ${
                            count > 0 ? 'bg-emerald-500' : 'bg-transparent'
                          }`}
                        />
                      </div>
                      {/* Count */}
                      <span className="w-5 text-right font-bold text-gray-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Reviews Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side: Submit Form */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 h-fit">
                <h4 className="font-bold text-brandDark text-sm mb-3">{t('give_review')}</h4>
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t('rating_label')}</label>
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
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t('comment_label')}</label>
                      <textarea
                        rows="3"
                        required
                        placeholder={t('comment_placeholder')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-white text-gray-700"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-2 bg-brandBlue text-white text-xs font-bold rounded-lg hover:bg-opacity-95 transition-all"
                    >
                      {submittingReview ? t('submitting_review') : t('submit_review_btn')}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-gray-400">{t('login_to_review')}</p>
                    <a href="/login" className="inline-block py-2 px-4 bg-brandBlue text-white text-xs font-bold rounded-lg hover:bg-opacity-95">{t('login_btn_review')}</a>
                  </div>
                )}
              </div>

              {/* Right Side: Header + List */}
              <div className="lg:col-span-2 space-y-6">
                {/* List Header with Sorting */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
                  <h4 className="font-bold text-sm text-gray-800">
                    {lang === 'bn' 
                      ? `${product.name} এর জন্য ${reviews.length} টি রিভিউ` 
                      : `${reviews.length} reviews for ${product.name}`}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border rounded-lg px-3 py-1.5 text-xs bg-white text-gray-700 focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="newest">Default (Newest)</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>

                {/* Reviews Loop Cards */}
                {sortedReviews.length > 0 ? (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                    {sortedReviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-1.5 hover:border-blue-100 transition-all">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-sm text-brandDark">{rev.user_name}</h5>
                          <span className="text-[11px] text-gray-400 font-semibold">
                            {new Date(rev.created_at).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        {/* Stars */}
                        <div className="flex items-center space-x-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-xs ${star <= rev.rating ? 'text-amber-400 font-bold' : 'text-gray-200'}`}>★</span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed pt-1">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 font-semibold text-sm">
                    {t('no_reviews_yet')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
