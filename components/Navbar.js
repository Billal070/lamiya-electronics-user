'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const { t } = useSettings();

  const LOGO_IMAGE_URL = "https://gquovugjshkgvwfwdfti.supabase.co/storage/v1/object/public/lamiya-electronics/logo_full.png.png";

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
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        
        {/* MOBILE HEADER (Absolute Centered Layout - No Theme Switcher) */}
        <div className="relative flex items-center justify-between w-full md:hidden select-none">
          
          {/* Left: Spacer to keep logo perfectly centered */}
          <div className="w-10"></div>

          {/* Center: Absolute Centered Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 py-1">
            <Link href="/">
              {!imgError && LOGO_IMAGE_URL ? (
                <img 
                  src={LOGO_IMAGE_URL} 
                  alt="Lamiya Electronics" 
                  className="h-16 w-auto object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-sm font-extrabold text-brandBlue">LAMIYA</span>
              )}
            </Link>
          </div>

          {/* Right: Cart & Profile */}
          <div className="relative z-20 flex items-center space-x-3.5">
            <Link href="/cart" className="relative p-1 text-brandBlue">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brandOrange text-brandBlue text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <Link href="/profile" className="text-brandBlue">
                <User size={22} />
              </Link>
            ) : (
              <Link href="/login" className="text-brandBlue">
                <User size={22} />
              </Link>
            )}
          </div>
        </div>

        {/* DESKTOP HEADER */}
        <div className="hidden md:flex justify-between items-center w-full md:w-auto select-none">
          <Link href="/">
            {!imgError && LOGO_IMAGE_URL ? (
              <img 
                src={LOGO_IMAGE_URL} 
                alt="Lamiya Electronics" 
                className="h-24 w-auto object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xl font-extrabold text-brandBlue">LAMIYA ELECTRONICS</span>
            )}
          </Link>
        </div>

        {/* Search Bar - Responsive */}
        <form onSubmit={handleSearch} className="flex w-full md:max-w-md lg:max-w-lg border rounded-lg overflow-hidden bg-gray-50 focus-within:border-brandBlue transition-all">
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 md:py-2 w-full bg-transparent focus:outline-none text-sm text-brandDark"
          />
          <button type="submit" className="bg-brandBlue text-white px-5 flex items-center justify-center hover:bg-opacity-90 transition-all">
            <Search size={16} />
          </button>
        </form>

        {/* Desktop Only Utilities */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/cart" className="relative p-2 text-brandBlue hover:text-brandOrange transition-colors">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 bg-brandOrange text-brandBlue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <Link href="/profile" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue hover:text-brandOrange transition-colors border-l pl-4 border-gray-200">
              <User size={20} />
              <span>{user.user_metadata?.full_name || t('nav_profile')}</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue hover:text-brandOrange transition-colors border-l pl-4 border-gray-200">
              <User size={20} />
              <span>{t('nav_login')}</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
