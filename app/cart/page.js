'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { Trash2, ShieldCheck, BadgeCheck, UserCheck, Lock, AlertTriangle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '../../context/SettingsContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { lang, t } = useSettings();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // New States for Payment Information & Terms
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setEmail(user.email);
        setName(user.user_metadata?.full_name || '');
      }
      setAuthLoading(false);
    });
  }, []);

  const subtotal = cart.reduce((total, item) => {
    const price = item.discount_price && item.discount_price < item.price ? item.discount_price : item.price;
    return total + price * item.quantity;
  }, 0);

  const grandTotal = subtotal; 

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || !user) return;
    
    if (!agreeTerms) {
      alert(lang === 'bn' ? 'দয়া করে শর্তাবলীতে সম্মতি দিন।' : 'Please agree to the Terms & Conditions.');
      return;
    }

    if (paymentMethod !== 'cod') {
      alert(lang === 'bn' ? 'অনলাইন পেমেন্ট বর্তমানে সাময়িকভাবে বন্ধ রয়েছে।' : 'Online Payment is temporarily offline.');
      return;
    }

    if (!name || !phone || !address) {
      alert('Required fields must be filled.');
      return;
    }

    setSubmitting(true);
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: name,
        email: email || user.email,
        phone: phone,
        shipping_address: address,
        total_amount: grandTotal,
        order_status: 'Pending',
        payment_status: 'Unpaid'
      })
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      alert('Order Error: ' + orderError.message + ' (Code: ' + orderError.code + ')');
      setSubmitting(false);
      return;
    }

    const orderItemsToInsert = cart.map((item) => {
      const activePrice = item.discount_price && item.discount_price < item.price ? item.discount_price : item.price;
      return {
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: activePrice
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error(itemsError);
      alert('Database Error: ' + itemsError.message);
      setSubmitting(false);
      return;
    }

    setCreatedOrderId(orderData.id);
    setOrderSuccess(true);
    clearCart();
    setSubmitting(false);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-green-100 text-center shadow-sm space-y-6 my-10">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <BadgeCheck size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-brandDark">{t('order_success_title')}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {t('order_success_desc')} <strong className="text-brandBlue">#{createdOrderId}</strong>. 
          {t('order_success_note')}
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/" className="bg-brandBlue text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-95 transition-all text-sm shadow">
            {t('cart_home_btn')}
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm space-y-6 my-10">
        <div className="flex justify-center text-gray-300">
          <Trash2 size={48} />
        </div>
        <h2 className="text-xl font-bold text-brandDark">{t('cart_empty')}</h2>
        <p className="text-sm text-gray-400">{t('cart_empty_desc')}</p>
        <div className="flex justify-center pt-4">
          <Link href="/" className="bg-brandBlue text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-95 transition-all text-sm shadow">
            {t('cart_home_btn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-brandDark">{t('cart_title')}</h2>
        <div className="space-y-4">
          {cart.map((item) => {
            const hasDiscount = item.discount_price && item.discount_price < item.price;
            const currentPrice = hasDiscount ? item.discount_price : item.price;
            const itemImage = (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/100x100/e2e8f0/1e293b?text=Lamiya';

            return (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                <img
                  src={itemImage}
                  alt={item.name}
                  className="object-contain w-16 h-16 bg-gray-50 rounded-lg p-1 border"
                />
                <div className="flex-grow space-y-1">
                  <h3 className="font-bold text-sm md:text-base text-brandDark line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-brandBlue font-bold">৳{Number(currentPrice).toLocaleString()}</p>
                </div>

                <div className="flex border rounded-lg overflow-hidden w-24 bg-gray-50 h-8">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 hover:bg-gray-200 transition-colors font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-full flex items-center justify-center font-bold text-brandDark text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 hover:bg-gray-200 transition-colors font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Form Section */}
      <div className="space-y-6">
        {/* Price Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-brandDark border-b pb-2">{t('order_summary')}</h3>
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between text-gray-500 font-semibold">
              <span>{lang === 'bn' ? 'সাব-টোটাল:' : 'Subtotal:'}</span>
              <span className="text-brandDark">৳{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-gray-500 font-semibold border-b pb-3 border-dashed">
              <span>{lang === 'bn' ? 'ডেলিভারি চার্জ:' : 'Shipment:'}</span>
              <span className="text-brandBlue font-semibold text-xs md:text-sm">
                {lang === 'bn' ? 'আলোচনা সাপেক্ষ' : 'Subject to Discuss'}
              </span>
            </div>

            <div className="pt-1 flex justify-between font-extrabold text-base text-brandDark">
              <span>{t('total')}</span>
              <span className="text-brandBlue text-lg">৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Form Check */}
        {authLoading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center py-10 font-bold text-gray-400">
            Loading...
          </div>
        ) : user ? (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b pb-2 text-green-600">
              <UserCheck size={20} />
              <h3 className="text-lg font-bold text-brandDark">{t('delivery_info')}</h3>
            </div>
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t('label_name')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t('label_phone')}</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full border rounded-lg px-4 py-2 text-sm bg-gray-100 cursor-not-allowed text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t('label_address')}</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50 text-gray-800"
                />
              </div>

              {/* ======================================================== */}
              {/* NEW PAYMENT INFORMATION SECTION (Symmetrical Styling) */}
              {/* ======================================================== */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2 text-brandBlue">
                  <CreditCard size={20} />
                  <h3 className="text-lg font-bold text-brandDark">
                    {lang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Information'}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-brandBlue border-gray-300 focus:ring-brandBlue cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">
                      {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (Cash on delivery)' : 'Cash on delivery'}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 text-brandBlue border-gray-300 focus:ring-brandBlue cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">
                      {lang === 'bn' ? 'অনলাইন পেমেন্ট (Pay Online)' : 'Pay Online'}
                    </span>
                  </label>
                </div>

                {paymentMethod === 'online' && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-2 items-start text-xs text-amber-700 leading-relaxed animate-pulse">
                    <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={16} />
                    <p>
                      {lang === 'bn' 
                        ? 'দুঃখিত, আমাদের অনলাইন পেমেন্ট সিস্টেমটি বর্তমানে সাময়িকভাবে বন্ধ আছে। দয়া করে ক্যাশ অন ডেলিভারি (Cash on delivery) সিলেক্ট করুন।' 
                        : 'Online Payment is temporarily offline. Please select Cash on Delivery to place your order.'}
                    </p>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* TERMS & CONDITIONS CHECKBOX */}
              {/* ======================================================== */}
              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-brandBlue border-gray-300 rounded focus:ring-brandBlue cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {lang === 'bn' ? (
                      <span>
                        আমি ওয়েবসাইটের <span className="text-brandBlue underline font-bold">শর্তাবলী</span>, <span className="text-brandBlue underline font-bold">গোপনীয়তা নীতি</span>, এবং <span className="text-brandBlue underline font-bold">রিফান্ড নীতি</span> পড়েছি এবং সম্মতি দিচ্ছি *
                      </span>
                    ) : (
                      <span>
                        I have read and agree to the website <span className="text-brandBlue underline font-bold">Terms & Conditions</span>, <span className="text-brandBlue underline font-bold">Privacy Policy</span>, and <span className="text-brandBlue underline font-bold">Refund Policy</span> *
                      </span>
                    )}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !agreeTerms}
                className={`w-full py-3.5 font-extrabold text-sm rounded-xl transition-all shadow focus:outline-none ${
                  agreeTerms && !submitting
                    ? 'bg-brandOrange text-brandBlue hover:bg-opacity-95 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {submitting ? 'Processing...' : t('btn_place_order') + ' (৳' + grandTotal.toLocaleString() + ')'}
              </button>

              {/* স্থায়ী রেড সতর্কবার্তা */}
              <div className="mt-4 flex gap-2 items-start text-[11px] text-red-600 font-extrabold leading-relaxed bg-red-50/50 p-3 rounded-lg border border-red-100/35">
                <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={15} />
                <p>আপনার অর্ডারটি সম্পন্ন করুন । সম্পন্ন হয়ে গেলে আমাদের একজন প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm text-center space-y-4 py-8">
            <div className="flex justify-center text-brandBlue">
              <div className="bg-blue-50 p-4 rounded-full">
                <Lock size={32} />
              </div>
            </div>
            <h3 className="text-base font-extrabold text-brandDark">{t('login_required')}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('login_required_desc')}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="block w-full py-3 bg-brandBlue text-white font-bold rounded-xl hover:bg-opacity-95 text-xs transition-all shadow"
              >
                {t('login_btn')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
