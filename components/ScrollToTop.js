'use client';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // ইউজার ৩০০ পিক্সেল নিচে স্ক্রল করলে বাটনটি দেখাবে
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // অত্যন্ত স্মুথলি স্ক্রল করে উপরে উঠবে
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 right-6 z-40 p-3 bg-brandBlue text-white rounded-full shadow-lg border border-blue-900 transition-all duration-300 transform focus:outline-none hover:bg-brandOrange hover:text-brandBlue hover:scale-110 active:scale-95 ${
        isVisible 
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 scale-75 translate-y-10 pointer-events-none'
      }`}
      title="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
