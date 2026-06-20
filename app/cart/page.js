'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { Trash2, ShieldCheck, BadgeCheck, UserCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '../../context/SettingsContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { t } = useSettings();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

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

  const deliveryCharge = subtotal > 0 ? 100 : 0; 
  const grandTotal = subtotal + deliveryCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || !user) return;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-brandDark border-b pb-2">{t('order_summary')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>{t('subtotal')}</span>
              <span className="font-semibold text-brandDark">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>{t('delivery')}</span>
              <span className="font-semibold text-brandDark">৳{deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base text-brandDark">
              <span>{t('total')}</span>
              <span className="text-brandBlue text-lg">৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {authLoading ? (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center py-10 font-bold text-gray-400">
            Loading...
          </div>
        ) : user ? (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2 text-green-600">
              <UserCheck size={20} />
              <h3 className="text-lg font-bold text-brandDark">{t('delivery_info')}</h3>
            </div>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t('label_name')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
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
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
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
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-2 items-start text-xs text-blue-700 leading-relaxed">
                <ShieldCheck className="shrink-0 text-brandBlue" size={16} />
                <span>{t('cod_info')}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-brandOrange text-brandBlue font-extrabold text-sm rounded-xl hover:bg-opacity-95 transition-all shadow"
              >
                {submitting ? 'Processing...' : t('btn_place_order') + ' (৳' + grandTotal.toLocaleString() + ')'}
              </button>
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
