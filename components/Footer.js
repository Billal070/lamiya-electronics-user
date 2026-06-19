import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brandDark text-gray-300 pt-12 pb-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">LAMIYA Electronics & IPS</h2>
          <p className="text-sm leading-relaxed mb-4 text-gray-400">
            আমরা দিচ্ছি উন্নতমানের ইলেকট্রনিক্স পণ্য, হোম অ্যাপ্লায়েন্স এবং নির্ভরযোগ্য আইপিএস (IPS) ও ব্যাটারি সলিউশন। 
          </p>
          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brandOrange hover:text-brandBlue transition-all">
              <Facebook size={18} />
            </a>
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brandOrange hover:text-brandBlue transition-all">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">গুরুত্বপূর্ণ লিঙ্ক</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-brandOrange transition-colors">হোম</Link></li>
            <li><Link href="/cart" className="hover:text-brandOrange transition-colors">শপিং কার্ট</Link></li>
            <li><a href="#" className="hover:text-brandOrange transition-colors">আমাদের সম্পর্কে</a></li>
            <li><a href="#" className="hover:text-brandOrange transition-colors">শর্তাবলী</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">জনপ্রিয় ক্যাটাগরি</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/?category=ips" className="hover:text-brandOrange transition-colors">IPS & UPS</Link></li>
            <li><Link href="/?category=battery" className="hover:text-brandOrange transition-colors">IPS Battery</Link></li>
            <li><Link href="/?category=solar" className="hover:text-brandOrange transition-colors">Solar Panel</Link></li>
            <li><Link href="/?category=appliances" className="hover:text-brandOrange transition-colors">Home Appliances</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">যোগাযোগ করুন</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={18} className="text-brandOrange shrink-0" />
              <span>ল্যামিয়া ইলেকট্রনিক্স এন্ড আইপিএস, বাংলাদেশ</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-brandOrange shrink-0" />
              <span>+880 1XXX-XXXXXX</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="text-brandOrange shrink-0" />
              <span>info@lamiyaelectronics.com</span>
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