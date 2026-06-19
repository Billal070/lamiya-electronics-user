'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Phone, Mail, Zap, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { t } = useSettings();

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
      {/* Top bar */}
      <div className="bg-brandBlue text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1"><Phone size={12} /> +880 1XXX-XXXXXX</span>
            <span className="flex items-center gap-1"><Mail size={12} /> info@lamiyaelectronics.com</span>
          </div>
          <div className="hidden md:block">
            <span>{t('topbar_slogan')}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex justify-between items-center w-full md:w-auto">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-brandOrange p-2 rounded-full text-brandBlue">
                <Zap size={24} fill="#2D4087" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-brandBlue dark:text-brandOrange leading-none">LAMIYA</h1>
                <p className="text-[10px] uppercase font-semibold text-brandOrange dark:text-gray-300 tracking-wider">Electronics and IPS</p>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex w-full max-w-lg border dark:border-slate-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-800 focus-within:border-brandBlue transition-all">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-full bg-transparent focus:outline-none text-sm text-brandDark dark:text-white"
            />
            <button type="submit" className="bg-brandBlue text-white px-5 flex items-center justify-center hover:bg-opacity-90 transition-all">
              <Search size={18} />
            </button>
          </form>

          {/* Utilities */}
          <div className="flex items-center space-x-6">
            {/* Sliding Theme Toggle */}
            <ThemeToggle />

            <Link href="/cart" className="relative p-2 text-brandBlue dark:text-brandOrange hover:text-brandOrange transition-colors">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brandOrange text-brandBlue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <Link href="/profile" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue dark:text-brandOrange hover:text-brandOrange transition-colors border-l pl-4 border-gray-200 dark:border-slate-800">
                <User size={20} />
                <span className="hidden md:inline">{user.user_metadata?.full_name || t('nav_profile')}</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue dark:text-brandOrange hover:text-brandOrange transition-colors border-l pl-4 border-gray-200 dark:border-slate-800">
                <User size={20} />
                <span>{t('nav_login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
