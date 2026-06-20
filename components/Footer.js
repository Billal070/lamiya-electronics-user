'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';
import { MapPin, Phone, Mail, Facebook, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { lang, t } = useSettings();
  const [settings, setSettings] = useState({
    phone: '+880 1XXX-XXXXXX',
    email: 'info@lamiyaelectronics.com',
    address_en: 'Lamiya Electronics and IPS, Bangladesh',
    address_bn: 'ল্যামিয়া ইলেকট্রনিক্স এন্ড আইপিএস, বাংলাদেশ',
    footer_desc_en: 'We provide high-quality electronics, home appliances, and reliable IPS & battery solutions.',
    footer_desc_bn: 'আমরা দিচ্ছি উন্নতমানের ইলেকট্রনিক্স পণ্য, হোম অ্যাপ্লায়েন্স এবং নির্ভরযোগ্য আইপিএস (IPS) ও ব্যাটারি সলিউশন।',
    facebook_url: '#',
    youtube_url: '#'
  });

  useEffect(() => {
    // ডাটাবেজ থেকে সেটিংস ডাটা রিয়েল-টাইমে নিয়ে আসা
    supabase.from('settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setSettings(data);
        }
      });
  }, []);

  return (
    <footer className="bg-brandDark text-gray-300 pt-12 pb-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">LAMIYA Electronics</h2>
          <p className="text-sm leading-relaxed mb-4 text-gray-400">
            {lang === 'bn' ? settings.footer_desc_bn : settings.footer_desc_en}
          </p>
          <div className="flex space-x-4">
            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-brandOrange hover:text-brandBlue transition-all">
              <Facebook size={18} />
            </a>
            <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-brandOrange hover:text-brandBlue transition-all">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t('footer_quick_links')}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-brandOrange transition-colors">{t('nav_home')}</Link></li>
            <li><Link href="/cart" className="hover:text-brandOrange transition-colors">{t('nav_cart')}</Link></li>
            <li><a href="#" className="hover:text-brandOrange transition-colors">Our Services</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t('footer_popular_categories')}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/?category=ips" className="hover:text-brandOrange transition-colors">IPS & UPS</Link></li>
            <li><Link href="/?category=battery" className="hover:text-brandOrange transition-colors">IPS Battery</Link></li>
            <li><Link href="/?category=solar" className="hover:text-brandOrange transition-colors">Solar Panel</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{t('footer_contact_us')}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={18} className="text-brandOrange shrink-0" />
              <span>{lang === 'bn' ? settings.address_bn : settings.address_en}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-brandOrange shrink-0" />
              <span>{settings.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="text-brandOrange shrink-0" />
              <span>{settings.email}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Lamiya Electronics & IPS. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
