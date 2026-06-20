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
  const LOGO_IMAGE_URL = "https://gqogdffkmdsdygoxxeyv.supabase.co/storage/v1/object/public/lamiya-electronics/logo_full.png";

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
        
        {/* MOBILE HEADER (3-Column Layout: Center Logo) */}
        <div className="grid grid-cols-3 items-center w-full md:hidden select-none">
          {/* Column 1: Theme Toggle (Left) */}
          <div className="justify-self-start">
            <ThemeToggle />
          </div>

          {/* Column 2: Full PNG Logo in the absolute Middle (Size Increased to h-14) */}
          <div className="justify-self-center py-1">
            <Link href="/">
              {!imgError && LOGO_IMAGE_URL ? (
                <img 
                  src={LOGO_IMAGE_URL} 
                  alt="Lamiya Electronics" 
                  className="h-14 w-auto object-contain max-w-[150px]"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-sm font-extrabold text-brandBlue dark:text-brandOrange">LAMIYA</span>
              )}
            </Link>
          </div>

          {/* Column 3: Cart & Profile (Right) */}
          <div className="justify-self-end flex items-center space-x-3.5">
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

        {/* DESKTOP HEADER (Logo Size Increased to h-20) */}
        <div className="hidden md:flex justify-between items-center w-full md:w-auto select-none">
          <Link href="/">
            {!imgError && LOGO_IMAGE_URL ? (
              <img 
                src={LOGO_IMAGE_URL} 
                alt="Lamiya Electronics" 
                className="h-20 w-auto object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xl font-extrabold text-brandBlue dark:text-brandOrange">LAMIYA ELECTRONICS</span>
            )}
          </Link>
        </div>

        {/* Search Bar - Responsive */}
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
