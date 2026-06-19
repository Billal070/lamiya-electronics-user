'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Package, User, Clock } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    fetchUserOrders(user.email);
  }

  async function fetchUserOrders(email) {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return <div className="text-center py-20 font-bold text-gray-500">লোডিং হচ্ছে...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* User Details Sidebar */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 h-fit">
        <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b">
          <div className="bg-brandBlue bg-opacity-10 p-4 rounded-full text-brandBlue">
            <User size={32} />
          </div>
          <h2 className="text-lg font-bold text-brandDark">
            {user.user_metadata?.full_name || 'গ্রাহক প্রোফাইল'}
          </h2>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-xs text-gray-500">
            <span>অ্যাকাউন্ট তৈরি:</span>
            <span className="font-semibold text-brandDark">
              {new Date(user.created_at).toLocaleDateString('bn-BD')}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <LogOut size={16} />
          লগআউট করুন
        </button>
      </div>

      {/* Orders History */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center pb-2 border-b">
          <h2 className="text-xl font-bold text-brandDark flex items-center gap-2">
            <Package size={22} className="text-brandBlue" />
            আপনার পূর্ববর্তী অর্ডারসমূহ
          </h2>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            মোট অর্ডার: {orders.length} টি
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-24"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-blue-100 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brandDark">অর্ডার #{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.order_status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      order.order_status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.order_status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                      order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.order_status === 'Pending' ? 'পেন্ডিং' :
                       order.order_status === 'Processing' ? 'প্রসেসিং' :
                       order.order_status === 'Shipped' ? 'পাঠানো হয়েছে' :
                       order.order_status === 'Delivered' ? 'ডেলিভার্ড' : 'বাতিল'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>{new Date(order.created_at).toLocaleDateString('bn-BD')}</span>
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm line-clamp-1">{order.shipping_address}</p>
                </div>

                <div className="flex justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                  <span className="text-xs text-gray-400 md:hidden">সর্বমোট:</span>
                  <span className="font-bold text-brandBlue text-base">৳{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4">
            <Package size={48} className="text-gray-300" />
            <h3 className="font-bold text-lg text-brandDark">আপনার কোনো অর্ডার পাওয়া যায়নি!</h3>
            <p className="text-sm text-gray-400">আপনার কার্টে থাকা পণ্যগুলো অর্ডার করলেই সেই অর্ডারগুলো এখানে দেখতে পাবেন।</p>
          </div>
        )}
      </div>
    </div>
  );
}
