'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function WhatsAppButton() {
  const [phone, setPhone] = useState('01813747741'); // ডিফল্ট আপনার নাম্বার

  useEffect(() => {
    // ডাটাবেজ থেকে রিয়েল-টাইমে সেটিংসের মোবাইল নাম্বার নিয়ে আসা
    supabase.from('settings')
      .select('phone')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (!error && data && data.phone) {
          setPhone(data.phone);
        }
      });
  }, []);

  // নাম্বার থেকে স্পেস, হাইফেন বা জিরো ক্লিন করে পারফেক্ট হোয়াটসঅ্যাপ লিঙ্ক তৈরি করা
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=Hello%20Lamiya%20Electronics%2C%20I%20have%20an%20inquiry%20about%20your%20products.`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center select-none">
      {/* Dynamic Ripple glowing effect (স্মুথ গ্লোয়িং বাবল অ্যানিমেশন) */}
      <span className="absolute inline-flex h-12 w-14 md:h-16 md:w-16 animate-ping rounded-full bg-green-400 opacity-75"></span>
      
      {/* Main Official WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 hover:bg-[#20ba5a] cursor-pointer"
        title="Chat on WhatsApp"
      >
        <svg 
          fill="currentColor" 
          viewBox="0 0 24 24" 
          className="w-6 h-6 md:w-8 md:h-8"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.05-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-2.078l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.135-1.612a11.822 11.822 0 005.91 1.587h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
