'use client';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { Trash2, ShieldCheck, BadgeCheck, PhoneCall, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const subtotal = cart.reduce((total, item) => {
    const price = item.discount_price && item.discount_price < item.price ? item.discount_price : item.price;
    return total + price * item.quantity;
  }, 0);

  const deliveryCharge = subtotal > 0 ? 100 : 0; // Standard Delivery charge
  const grandTotal = subtotal + deliveryCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!name || !phone || !address) {
      alert('দয়া করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।');
      return;
    }

    setSubmitting(true);
    
    // 1. Create order record
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: name,
        email: email || 'no-email@lamiya.com',
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
      alert('অর্ডার করার সময় ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।');
      setSubmitting(false);
      return;
    }

    // 2. Create order items records
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
      alert('অর্ডারের পণ্যগুলো সংরক্ষণ করতে সমস্যা হয়েছে।');
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
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-green-100 text-center shadow-sm space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <BadgeCheck size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-brandDark">আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          ধন্যবাদ আমাদের সাথে থাকার জন্য। আপনার অর্ডার আইডি: <strong className="text-brandBlue">#{createdOrderId}</strong>। 
          খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার দেওয়া মোবাইল নম্বরে কল করে অর্ডারটি নিশ্চিত করবেন।
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/" className="bg-brandBlue text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-95 transition-all text-sm shadow">
            আরও কেনাকাটা করুন
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm space-y-6">
        <div className="flex justify-center text-gray-300">
          <Trash2 size={48} />
        </div>
        <h2 className="text-xl font-bold text-brandDark">আপনার শপিং কার্টটি খালি!</h2>
        <p className="text-sm text-gray-400">কার্টে পণ্য যোগ করতে প্রথমে হোমপেজ থেকে আপনার পছন্দের পণ্যগুলো বেছে নিন।</p>
        <div className="flex justify-center pt-4">
          <Link href="/" className="bg-brandBlue text-white font-bold px-6 py-3 rounded-lg hover:bg-opacity-95 transition-all text-sm shadow">
            পণ্য দেখতে হোমপেজে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-brandDark">শপিং কার্ট</h2>
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

                {/* Quantity Editor */}
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

                {/* Delete Button */}
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

      {/* Checkout Section */}
      <div className="space-y-6">
        {/* Price Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-brandDark border-b pb-2">অর্ডার সারাংশ</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>সাব-টোটাল:</span>
              <span className="font-semibold text-brandDark">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-semibold text-brandDark">৳{deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base text-brandDark">
              <span>সর্বমোট মূল্য:</span>
              <span className="text-brandBlue text-lg">৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-brandDark border-b pb-2">ডেলিভারি তথ্য দিন</h3>
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">আপনার নাম (আবশ্যক)</label>
              <input
                type="text"
                required
                placeholder="যেমন: মোঃ করিম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">মোবাইল নম্বর (আবশ্যক)</label>
              <input
                type="tel"
                required
                placeholder="যেমন: 017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ইমেইল (ঐচ্ছিক)</label>
              <input
                type="email"
                placeholder="যেমন: user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ডেলিভারির সম্পূর্ণ ঠিকানা (আবশ্যক)</label>
              <textarea
                required
                rows="3"
                placeholder="যেমন: গ্রাম, ডাকঘর, থানা, জেলা"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-2 items-start text-xs text-blue-700 leading-relaxed">
              <ShieldCheck className="shrink-0 text-brandBlue" size={16} />
              <span>পেমেন্ট পদ্ধতি: <strong>ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে পেমেন্ট করুন)</strong>। আমরা খুব দ্রুত আপনার সাথে যোগাযোগ করব।</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brandOrange text-brandBlue font-extrabold text-sm rounded-xl hover:bg-opacity-95 transition-all shadow shadow-brandOrange/20 uppercase"
            >
              {submitting ? 'অর্ডার হচ্ছে...' : 'অর্ডার নিশ্চিত করুন (৳' + grandTotal.toLocaleString() + ')'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}