'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const { t } = useSettings();

  // 🚨 নির্দেশ: নিচে থাকা ডাবল কোটেশনের ("") ভেতরে আপনার Supabase থেকে কপি করা লোগো লিঙ্কটি বসিয়ে দিন
  const LOGO_IMAGE_URL = "https://gquovugjshkgvwfwdfti.supabase.co/storage/v1/object/public/lamiya-electronics/logo.png.png";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/');
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        
        {/* Logo & Mobile Icons Row */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link href="/" className="flex items-center gap-3 select-none">
            {/* Logo Image with perfect vertical centering fallback */}
            {!imgError && LOGO_IMAGE_URL ? (
              <img 
                src={LOGO_IMAGE_URL} 
                alt="Lamiya Logo" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="bg-brandOrange w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-brandBlue font-extrabold text-lg shrink-0 shadow-sm">
                L
              </div>
            )}
            <div className="flex flex-col justify-center">
              <h1 className="text-xl md:text-2xl font-extrabold text-brandBlue dark:text-brandOrange leading-none tracking-wide font-sans">LAMIYA</h1>
              <p className="text-[9px] uppercase font-bold text-brandOrange dark:text-gray-300 tracking-widest mt-1">Electronics & IPS</p>
            </div>
          </Link>

          {/* Mobile Only Quick Actions */}
          <div className="flex items-center space-x-3.5 md:hidden">
            <ThemeToggle />
            <Link href="/cart" className="relative p-1 text-brandBlue dark:text-brandOrange">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brandOrange text-brandBlue text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <Link href="/profile" className="text-brandBlue dark:text-brandOrange">
                <User size={22} />
              </Link>
            ) : (
              <Link href="/login" className="text-brandBlue dark:text-brandOrange">
                <User size={22} />
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar - Full width on mobile */}
        <form onSubmit={handleSearch} className="flex w-full md:max-w-md lg:max-w-lg border dark:border-slate-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-800 focus-within:border-brandBlue transition-all">
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 md:py-2 w-full bg-transparent focus:outline-none text-sm text-brandDark dark:text-white"
          />
          <button type="submit" className="bg-brandBlue text-white px-5 flex items-center justify-center hover:bg-opacity-90 transition-all">
            <Search size={16} />
          </button>
        </form>

        {/* Desktop Only Utilities */}
        <div className="hidden md:flex items-center space-x-6">
          <ThemeToggle />

          <Link href="/cart" className="relative p-2 text-brandBlue dark:text-brandOrange hover:text-brandOrange transition-colors">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 bg-brandOrange text-brandBlue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <Link href="/profile" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue dark:text-brandOrange hover:text-brandOrange transition-colors border-l pl-4 border-gray-200 dark:border-slate-800">
              <User size={20} />
              <span>{user.user_metadata?.full_name || t('nav_profile')}</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue dark:text-brandOrange hover:text-brandOrange transition-colors border-l pl-4 border-gray-200 dark:border-slate-800">
              <User size={20} />
              <span>{t('nav_login')}</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
