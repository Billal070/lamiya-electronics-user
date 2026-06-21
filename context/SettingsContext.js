'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const translations = {
  en: {
    nav_home: "Home",
    nav_cart: "Cart",
    nav_login: "Login / Register",
    nav_profile: "My Profile",
    search_placeholder: "Search products...",
    topbar_slogan: "A trusted name in pure and reliable IPS & Electronics services",
    banner_title: "Lamiya Electronics and IPS",
    banner_subtitle: "Buy our advanced IPS systems and home appliances at attractive offers for low-voltage and uninterrupted power backup.",
    banner_badge: "Super Offer Dhamaka",
    banner_btn: "View Products",
    // New Footer value props
    prop_quality: "Best Quality",
    prop_quality_desc: "100% Original Products",
    prop_support: "24/7 Support",
    prop_support_desc: "Dedicated Customer Care",
    prop_delivery: "Fast Home Delivery",
    prop_delivery_desc: "Across Bangladesh",
    prop_secure: "Secure Payments",
    prop_secure_desc: "Safe Cash on Delivery",
    cat_title: "Categories",
    all_products: "All Products",
    total_products: "Total Products",
    no_products: "No products found!",
    no_products_desc: "Products will be added to this category soon. Please stay tuned.",
    add_to_cart: "Add to Cart",
    stock_out: "Stock Out",
    off: "OFF",
    // Cart Page
    cart_title: "Shopping Cart",
    cart_empty: "Your shopping cart is empty!",
    cart_empty_desc: "Choose products from homepage to add them to your cart.",
    cart_home_btn: "Go to Homepage",
    order_summary: "Order Summary",
    subtotal: "Sub-total:",
    delivery: "Delivery Charge:",
    total: "Grand Total:",
    delivery_info: "Delivery Information",
    label_name: "Your Name (Required)",
    label_phone: "Mobile Number (Required)",
    label_address: "Full Delivery Address (Required)",
    cod_info: "Payment Method: Cash on Delivery (Pay after receiving product). We will contact you shortly.",
    btn_place_order: "Confirm Order",
    order_success_title: "Your order has been completed successfully!",
    order_success_desc: "Thank you for staying with us. Your Order ID is:",
    order_success_note: "One of our representatives will call your mobile number shortly to confirm the order.",
    login_required: "Login Required to Order",
    login_required_desc: "Please log in to your customer account to place an order and track it later.",
    login_btn: "Login / Create Account",
    // Profile Page
    profile_title: "Customer Profile",
    profile_logout: "Logout",
    orders_history: "Your Past Orders",
    total_orders: "Total Orders:",
    order_id: "Order ID",
    status_pending: "Pending",
    status_processing: "Processing",
    status_shipped: "Shipped",
    status_delivered: "Delivered",
    status_cancelled: "Cancelled",
    account_created: "Account Created:",
    no_orders: "No orders found!",
    no_orders_desc: "You will see your orders here once you place them.",
    settings_lang: "Language",
    settings_theme: "Theme",
    // Footer translations
    footer_quick_links: "Quick Links",
    footer_popular_categories: "Popular Categories",
    footer_contact_us: "Contact Us"
  },
  bn: {
    nav_home: "হোম",
    nav_cart: "কার্ট",
    nav_login: "লগইন / রেজিস্টার",
    nav_profile: "আমার প্রোফাইল",
    search_placeholder: "সার্চ করুন প্রোডাক্ট...",
    topbar_slogan: "বিশুদ্ধ ও নির্ভরযোগ্য আইপিএস এবং ইলেকট্রনিক্স সেবায় বিশ্বস্ত নাম",
    banner_title: "ল্যামিয়া ইলেকট্রনিক্স এবং আইপিএস",
    banner_subtitle: "লো-ভোল্টেজ ও নিরবচ্ছিন্ন বিদ্যুৎ ব্যাকআপের জন্য আমাদের উন্নত প্রযুক্তির আইপিএস এবং সেরা ইলেকট্রনিক্স হোম অ্যাপ্লায়েন্স পণ্যগুলো কিনুন আকর্ষণীয় অফারে।",
    banner_badge: "সুপার অফার ধামাকা",
    banner_btn: "পণ্যগুলো দেখুন",
    // New Footer value props
    prop_quality: "সেরা কোয়ালিটি",
    prop_quality_desc: "১০০% অরিজিনাল পণ্য",
    prop_support: "সার্বক্ষণিক সাপোর্ট",
    prop_support_desc: "ডেডিকেটেড কাস্টমার কেয়ার",
    prop_delivery: "দ্রুত হোম ডেলিভারি",
    prop_delivery_desc: "সমগ্র বাংলাদেশ জুড়ে",
    prop_secure: "নিরাপদ পেমেন্ট",
    prop_secure_desc: "নিরাপদ ক্যাশ অন ডেলিভারি",
    cat_title: "ক্যাটাগরি সমূহ",
    all_products: "সব পণ্য",
    total_products: "মোট পণ্য",
    no_products: "কোনো প্রোডাক্ট পাওয়া যায়নি!",
    no_products_desc: "খুব শীঘ্রই এই ক্যাটাগরিতে প্রোডাক্ট যোগ করা হবে। অনুগ্রহ করে আমাদের সাথেই থাকুন।",
    add_to_cart: "কার্টে যোগ করুন",
    stock_out: "স্টক আউট",
    off: "ছাড়",
    // Cart Page
    cart_title: "শপিং কার্ট",
    cart_empty: "আপনার শপিং কার্টটি খালি!",
    cart_empty_desc: "কার্টে পণ্য যোগ করতে প্রথমে হোমপেজ থেকে আপনার পছন্দের পণ্যগুলো বেছে নিন।",
    cart_home_btn: "পণ্য দেখতে হোমপেজে যান",
    order_summary: "অর্ডার সারাংশ",
    subtotal: "সাব-টোটাল:",
    delivery: "ডেলিভারি চার্জ:",
    total: "সর্বমোট মূল্য:",
    delivery_info: "ডেলিভারি তথ্য দিন",
    label_name: "আপনার নাম (আবশ্যক)",
    label_phone: "মোবাইল নম্বর (আবশ্যক)",
    label_address: "ডেলিভারির সম্পূর্ণ ঠিকানা (আবশ্যক)",
    cod_info: "পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে পেমেন্ট করুন)। আমরা খুব দ্রুত আপনার সাথে যোগাযোগ করব।",
    btn_place_order: "অর্ডার নিশ্চিত করুন",
    order_success_title: "আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!",
    order_success_desc: "ধন্যবাদ আমাদের সাথে থাকার জন্য। আপনার অর্ডার আইডি:",
    order_success_note: "খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার দেওয়া মোবাইল নম্বরে কল করে অর্ডারটি নিশ্চিত করবেন।",
    login_required: "অর্ডার করতে লগইন করা আবশ্যক",
    login_required_desc: "অর্ডার করতে এবং অর্ডারটি পরবর্তী সময়ে ট্র্যাক করতে অনুগ্রহ করে আপনার কাস্টমার অ্যাকাউন্ট দিয়ে লগইন করুন।",
    login_btn: "লগইন / অ্যাকাউন্ট তৈরি করুন",
    // Profile Page
    profile_title: "গ্রাহক প্রোফাইল",
    profile_logout: "লগআউট করুন",
    orders_history: "আপনার পূর্ববর্তী অর্ডারসমূহ",
    total_orders: "মোট অর্ডার:",
    order_id: "অর্ডার",
    status_pending: "পেন্ডিং",
    status_processing: "প্রসেসিং",
    status_shipped: "পাঠানো হয়েছে",
    status_delivered: "ডেলিভার্ড",
    status_cancelled: "বাতিল",
    account_created: "অ্যাকাউন্ট তৈরি:",
    no_orders: "আপনার কোনো অর্ডার পাওয়া যায়নি!",
    no_orders_desc: "আপনার কার্টে থাকা পণ্যগুলো অর্ডার করলেই সেই অর্ডারগুলো এখানে দেখতে পাবেন।",
    settings_lang: "ভাষা",
    settings_theme: "থিম",
    // Footer translations
    footer_quick_links: "গুরুত্বপূর্ণ লিঙ্ক",
    footer_popular_categories: "জনপ্রিয় ক্যাটাগরি",
    footer_contact_us: "যোগাযোগ করুন"
  }
};

export function SettingsProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('lamiya_lang') || 'en';
    setLang(savedLang);
    document.documentElement.classList.remove('dark');
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lamiya_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
