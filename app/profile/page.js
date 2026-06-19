'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Package, User, Clock, Languages } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { lang, changeLanguage, t } = useSettings();

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
    return <div className="text-center py-20 font-bold text-gray-500">{t('loading_etc') || 'Loading...'}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* User Details Sidebar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-6 h-fit">
        <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b dark:border-slate-800">
          <div className="bg-brandBlue bg-opacity-10 p-4 rounded-full text-brandBlue dark:text-brandOrange">
            <User size={32} />
          </div>
          <h2 className="text-lg font-bold text-brandDark dark:text-white">
            {user.user_metadata?.full_name || t('profile_title')}
          </h2>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>

        {/* Language Selection */}
        <div className="space-y-3 pb-4 border-b dark:border-slate-800">
          <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
            <Languages size={14} />
            {t('settings_lang')} / Language
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                lang === 'en'
                  ? 'bg-brandBlue text-white border-brandBlue'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
              }`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => changeLanguage('bn')}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                lang === 'bn'
                  ? 'bg-brandBlue text-white border-brandBlue'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
              }`}
            >
              বাংলা (BANGLA)
            </button>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>{t('account_created')}</span>
            <span className="font-semibold text-brandDark dark:text-gray-300">
              {lang === 'bn' 
                ? new Date(user.created_at).toLocaleDateString('bn-BD') 
                : new Date(user.created_at).toLocaleDateString('en-US')}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/35 font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <LogOut size={16} />
          {t('profile_logout')}
        </button>
      </div>

      {/* Orders History */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center pb-2 border-b dark:border-slate-800">
          <h2 className="text-xl font-bold text-brandDark dark:text-white flex items-center gap-2">
            <Package size={22} className="text-brandBlue dark:text-brandOrange" />
            {t('orders_history')}
          </h2>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {t('total_orders')} {orders.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl h-24"></div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-blue-100 dark:hover:border-blue-900 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-brandDark dark:text-white">{t('order_id')} #{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.order_status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      order.order_status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.order_status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                      order.order_status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.order_status === 'Pending' ? t('status_pending') :
                       order.order_status === 'Processing' ? t('status_processing') :
                       order.order_status === 'Shipped' ? t('status_shipped') :
                       order.order_status === 'Delivered' ? t('status_delivered') : t('status_cancelled')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>{lang === 'bn' ? new Date(order.created_at).toLocaleDateString('bn-BD') : new Date(order.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm line-clamp-1">{order.shipping_address}</p>
                </div>

                <div className="flex justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50 dark:border-slate-800">
                  <span className="font-bold text-brandBlue dark:text-brandOrange text-base">৳{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4">
            <Package size={48} className="text-gray-300" />
            <h3 className="font-bold text-lg text-brandDark dark:text-white">{t('no_orders')}</h3>
            <p className="text-sm text-gray-400">{t('no_orders_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
