'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
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

    supabase.from('categories')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setCategories(data);
        }
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
              onClick={() => setIsMenuOpen(true)} 
              className="p-2 text-brandBlue hover:text-brandOrange hover:bg-gray-50 rounded-full transition-all flex items-center gap-1.5"
            >
              <Menu size={24} />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Menu</span>
            </button>
          </div>

          {/* Absolute Centered Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center overflow-hidden">
            <Link href="/">
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

          {/* Right Side: Cart, Wishlist & Profile */}
          <div className="relative z-20 flex items-center space-x-2 md:space-x-3.5">
            {/* Mobile Wishlist (Heart Icon with standardized w-5 h-5 blue circle badge) */}
            <Link href="/wishlist" className="relative p-1 text-brandBlue hover:text-brandOrange transition-all md:hidden">
              <Heart size={22} className={wishlist.length > 0 ? 'text-brandOrange fill-brandOrange' : ''} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brandBlue text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Mobile Cart */}
            <Link href="/cart" className="relative p-1 text-brandBlue hover:text-brandOrange transition-all">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brandOrange text-brandBlue text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Desktop Utilities */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Desktop Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-brandBlue hover:text-brandOrange transition-colors flex items-center gap-1">
                <Heart size={24} className={wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brandOrange text-brandBlue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {wishlist.length}
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

            {/* Mobile Profile Icon */}
            <div className="md:hidden flex items-center pl-1">
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

      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sliding Drawer Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-extrabold text-brandBlue text-base leading-none">LAMIYA</h3>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Navigation Menu</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 bg-gray-200 hover:bg-brandOrange hover:text-brandBlue rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          
          {/* Section A: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">Quick Links</h4>
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-brandDark hover:bg-gray-50 transition-colors"
            >
              {t('nav_home')}
            </Link>
            <Link 
              href="/wishlist" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-brandDark hover:bg-gray-50 transition-colors"
            >
              Wishlist ({wishlist.length})
            </Link>
            <Link 
              href="/cart" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-brandDark hover:bg-gray-50 transition-colors"
            >
              {t('nav_cart')} ({totalItems})
            </Link>
            {user ? (
              <Link 
                href="/profile" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-brandDark hover:bg-gray-50 transition-colors"
              >
                {t('nav_profile')}
              </Link>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-brandDark hover:bg-gray-50 transition-colors"
              >
                {t('nav_login')}
              </Link>
            )}
          </div>

          {/* Section B: Categories */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">{t('cat_title')}</h4>
            <div className="flex flex-col space-y-1">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t('all_products')}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors capitalize"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t text-[10px] text-gray-400 text-center bg-gray-50 select-none">
          <p>&copy; {new Date().getFullYear()} Lamiya Electronics & IPS</p>
        </div>
      </div>
    </header>
  );
}
