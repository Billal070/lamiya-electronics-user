'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { SlidersHorizontal, PackageOpen, BadgeCheck, Headphones, Truck, ShieldCheck } from 'lucide-react';

function HomeContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { t } = useSettings();
  
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error && data) {
      setCategories(data);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    let query;

    if (selectedCategory) {
      query = supabase
        .from('products')
        .select('*, categories!inner(name, slug)')
        .eq('categories.slug', selectedCategory);
    } else {
      query = supabase
        .from('products')
        .select('*, categories(name, slug)');
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setProducts(data);
    } else {
      console.error('প্রোডাক্ট লোড করার সময় ভুল হয়েছে:', error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brandBlue to-blue-900 rounded-2xl p-6 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="space-y-3 md:space-y-4 max-w-lg text-center md:text-left">
          <span className="inline-block bg-brandOrange text-brandBlue text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {t('banner_badge')}
          </span>
          <h1 className="text-2xl md:text-5xl font-extrabold leading-tight">
            {t('banner_title')}
          </h1>
          <p className="text-xs md:text-base text-gray-200">
            {t('banner_subtitle')}
          </p>
          <div className="pt-2">
            <button className="bg-brandOrange text-brandBlue font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow">
              {t('banner_btn')}
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 hidden md:flex justify-center">
          <div className="relative bg-white bg-opacity-10 p-6 rounded-2xl backdrop-blur-sm border border-white border-opacity-10 max-w-sm">
            <img 
              src="https://placehold.co/400x300/2d4087/ffffff?text=Premium+IPS+Systems" 
              alt="Promo IPS" 
              className="rounded-lg object-contain w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Mobile Only: Horizontal Swipeable Categories */}
      <div className="lg:hidden space-y-2">
        <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">{t('cat_title')}</h3>
        <div className="overflow-x-auto whitespace-nowrap pb-2 -mx-4 px-4 scrollbar-none flex gap-2">
          <a 
            href="/" 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border inline-block ${
              !selectedCategory 
                ? 'bg-brandBlue text-white border-brandBlue' 
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {t('all_products')}
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border inline-block ${
                selectedCategory === cat.slug 
                  ? 'bg-brandBlue text-white border-brandBlue' 
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>

      {/* Main Grid: Sidebar (Desktop) + Products (Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Categories - Hidden on Mobile */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b mb-4">
              <SlidersHorizontal size={18} className="text-brandBlue" />
              <h3 className="font-bold text-brandDark">{t('cat_title')}</h3>
            </div>
            <div className="flex flex-col space-y-1">
              <a 
                href="/" 
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  !selectedCategory 
                    ? 'bg-brandBlue text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('all_products')}
              </a>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/?category=${cat.slug}`}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory === cat.slug 
                      ? 'bg-brandBlue text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid - Double column on Mobile */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm md:text-xl font-bold text-brandDark">
              {searchQuery ? `${t('total_products')}: "${searchQuery}"` : selectedCategory ? `${selectedCategory.toUpperCase()}` : t('all_products')}
            </h2>
            <span className="text-[10px] md:text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              {t('total_products')}: {products.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-64"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4">
              <PackageOpen size={48} className="text-gray-300" />
              <h3 className="font-bold text-lg">{t('no_products')}</h3>
              <p className="text-sm text-gray-400">{t('no_products_desc')}</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW BRAND VALUE PROPS AT THE VERY BOTTOM */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center text-center p-2">
          <BadgeCheck className="text-brandBlue mb-1.5" size={28} />
          <h4 className="font-bold text-xs md:text-sm text-brandDark">{t('prop_quality')}</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">{t('prop_quality_desc')}</p>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <Headphones className="text-brandBlue mb-1.5" size={28} />
          <h4 className="font-bold text-xs md:text-sm text-brandDark">{t('prop_support')}</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">{t('prop_support_desc')}</p>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <Truck className="text-brandBlue mb-1.5" size={28} />
          <h4 className="font-bold text-xs md:text-sm text-brandDark">{t('prop_delivery')}</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">{t('prop_delivery_desc')}</p>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <ShieldCheck className="text-brandBlue mb-1.5" size={28} />
          <h4 className="font-bold text-xs md:text-sm text-brandDark">{t('prop_secure')}</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">{t('prop_secure_desc')}</p>
        </div>
      </div>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold text-gray-500">লোডিং হচ্ছে...</div>}>
      <HomeContent />
    </Suspense>
  );
}
