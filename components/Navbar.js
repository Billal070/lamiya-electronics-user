'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col gap-4">
        
        {/* ROW 1: UTILITIES ROW */}
        <div className="relative flex items-center justify-between w-full select-none h-14 md:h-16">
          
          {/* Left Side: Menu Button */}
          <div className="relative z-20 flex items-center">
            <button 
              onClick={() => alert('মেনু ফিচারটি শীঘ্রই আসছে!')} 
              className="p-2 text-brandBlue hover:text-brandOrange hover:bg-gray-50 rounded-full transition-all flex items-center gap-1.5"
            >
              <Menu size={24} />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Menu</span>
            </button>
          </div>

          {/* Absolute Centered Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center overflow-hidden">
            <Link href="/" className="flex items-center justify-center">
              {!imgError && LOGO_IMAGE_URL ? (
                <img 
                  src={LOGO_IMAGE_URL} 
                  alt="Lamiya Electronics" 
                  className="h-[120px] md:h-[200px] w-auto object-contain -my-8 md:-my-16"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-base md:text-2xl font-extrabold text-brandBlue">LAMIYA ELECTRONICS</span>
              )}
            </Link>
          </div>

          {/* Right Side: Cart & Profile */}
          <div className="relative z-20 flex items-center space-x-3.5">
            <Link href="/cart" className="relative p-1 text-brandBlue hover:text-brandOrange transition-all">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brandOrange text-brandBlue text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Desktop Profile */}
            {user ? (
              <Link href="/profile" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue hover:text-brandOrange transition-colors border-l pl-4 border-gray-200 hidden md:flex">
                <User size={20} />
                <span>{user.user_metadata?.full_name || t('nav_profile')}</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-1.5 text-sm font-bold text-brandBlue hover:text-brandOrange transition-colors border-l pl-4 border-gray-200 hidden md:flex">
                <User size={20} />
                <span>{t('nav_login')}</span>
              </Link>
            )}

            {/* Mobile Profile Icon */}
            <div className="md:hidden flex items-center">
              {user ? (
                <Link href="/profile" className="text-brandBlue">
                  <User size={24} />
                </Link>
              ) : (
                <Link href="/login" className="text-brandBlue">
                  <User size={24} />
                </Link>
              )}
            </div>
          </div>

        </div>

        {/* ROW 2: SEARCH BAR */}
        <div className="w-full flex justify-center">
          <form onSubmit={handleSearch} className="flex w-full max-w-lg border rounded-lg overflow-hidden bg-gray-50 focus-within:border-brandBlue transition-all shadow-sm">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2.5 md:py-2.5 w-full bg-transparent focus:outline-none text-sm text-brandDark"
            />
            <button type="submit" className="bg-brandBlue text-white px-5 flex items-center justify-center hover:bg-opacity-90 transition-all">
              <Search size={18} />
            </button>
          </form>
        </div>

      </div>
    </header>
  );
}
