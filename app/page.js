'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, PackageOpen, BatteryCharging, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
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
    let query = supabase.from('products').select('*, categories(name)');

    if (selectedCategory) {
      query = query.eq('categories.slug', selectedCategory);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      // Filter clientside to handle relation match correctly if needed
      let filteredData = data;
      if (selectedCategory) {
        filteredData = data.filter(p => p.categories && p.categories.slug === selectedCategory);
      }
      setProducts(filteredData);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Hero / Promotion Banner */}
      <div className="bg-gradient-to-r from-brandBlue to-blue-900 rounded-2xl p-6 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
        <div className="space-y-4 max-w-lg">
          <span className="bg-brandOrange text-brandBlue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            সুপার অফার ধামাকা
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            ল্যামিয়া ইলেকট্রনিক্স এবং আইপিএস
          </h1>
          <p className="text-sm md:text-base text-gray-200">
            লো-ভোল্টেজ ও নিরবচ্ছিন্ন বিদ্যুৎ ব্যাকআপের জন্য আমাদের উন্নত প্রযুক্তির আইপিএস এবং সেরা ইলেকট্রনিক্স হোম অ্যাপ্লায়েন্স পণ্যগুলো কিনুন আকর্ষণীয় অফারে।
          </p>
          <div className="pt-2">
            <button className="bg-brandOrange text-brandBlue font-bold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow">
              পণ্যগুলো দেখুন
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative bg-white bg-opacity-10 p-6 rounded-2xl backdrop-blur-sm border border-white border-opacity-10 max-w-sm">
            <img 
              src="https://placehold.co/400x300/2d4087/ffffff?text=Premium+IPS+Systems" 
              alt="Promo IPS" 
              className="rounded-lg object-contain w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Brand Value Props */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center text-center p-3">
          <BatteryCharging className="text-brandBlue mb-2" size={32} />
          <h4 className="font-bold text-sm text-brandDark">নিরবচ্ছিন্ন ব্যাকআপ</h4>
          <p className="text-xs text-gray-400 mt-1">১০০% গ্যারান্টিড সেবা</p>
        </div>
        <div className="flex flex-col items-center text-center p-3">
          <ShieldCheck className="text-brandBlue mb-2" size={32} />
          <h4 className="font-bold text-sm text-brandDark">অরিজিনাল প্রোডাক্ট</h4>
          <p className="text-xs text-gray-400 mt-1">সরাসরি ব্র্যান্ড থেকে আমদানিকৃত</p>
        </div>
        <div className="flex flex-col items-center text-center p-3">
          <HeartHandshake className="text-brandBlue mb-2" size={32} />
          <h4 className="font-bold text-sm text-brandDark">দ্রুত হোম ডেলিভারি</h4>
          <p className="text-xs text-gray-400 mt-1">সমগ্র বাংলাদেশ জুড়ে</p>
        </div>
        <div className="flex flex-col items-center text-center p-3">
          <PackageOpen className="text-brandBlue mb-2" size={32} />
          <h4 className="font-bold text-sm text-brandDark">সহজ ইজি রিটার্ন</h4>
          <p className="text-xs text-gray-400 mt-1">৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি</p>
        </div>
      </div>

      {/* Main Grid: Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Categories */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b mb-4">
              <SlidersHorizontal size={18} className="text-brandBlue" />
              <h3 className="font-bold text-brandDark">ক্যাটাগরি সমূহ</h3>
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
                সব পণ্য
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

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-brandDark">
              {searchQuery ? `অনুসন্ধানের ফলাফল: "${searchQuery}"` : selectedCategory ? `${selectedCategory.toUpperCase()} ক্যাটাগরির পণ্য` : 'আমাদের পণ্যসমূহ'}
            </h2>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              মোট পণ্য: {products.length} টি
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-80"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4">
              <PackageOpen size={48} className="text-gray-300" />
              <h3 className="font-bold text-lg text-brandDark">কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
              <p className="text-sm text-gray-400">খুব শীঘ্রই এই ক্যাটাগরিতে প্রোডাক্ট যোগ করা হবে। অনুগ্রহ করে আমাদের সাথেই থাকুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}