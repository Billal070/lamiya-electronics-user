'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
import { ShoppingCart, CheckCircle2, AlertCircle, Star, MessageSquarePlus, X } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
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

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500">{t('loading')}</div>;
  }

  if (!product) {
    return <div className="text-center py-20 font-bold text-red-500">{t('not_found')}</div>;
  }

  // গাণিতিক সংখ্যায় রূপান্তর
  const originalPrice = Number(product.price);
  const discountPrice = Number(product.discount_price);
  const hasDiscount = discountPrice > 0 && discountPrice < originalPrice;
  
  const defaultPlaceholder = 'https://placehold.co/500x500/e2e8f0/1e293b?text=Lamiya+Electronics';

  // Calculate Dynamic average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  // Calculate Star breakdown (5-star down to 1-star)
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });

  // Sort Reviews dynamically based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return new Date(b.created_at) - new Date(a.created_at); // Default: newest
  });

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
                    <span className="text-3xl font-extrabold text-brandOrange">৳{discountPrice.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">৳{originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-extrabold text-brandOrange">৳{originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-500">{t('quantity')}</span>
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
              {t('add_to_cart')}
            </button>
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
          /* B. REVIEWS & RATINGS VIEW (হুবহু স্ক্রিনশটের ডিজাইন) */
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

              {/* Right Side: Header + List (With Real Sorting) */}
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
