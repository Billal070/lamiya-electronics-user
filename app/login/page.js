'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to profile
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/profile');
      }
    });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isSignUp) {
      // Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('রেজিস্ট্রেশন সফল হয়েছে! অনুগ্রহ করে অ্যাকাউন্ট সচল করতে আপনার ইমেইলে পাঠানো লিঙ্কটি ক্লিক করুন।');
      }
    } else {
      // Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      } else {
        router.push('/profile');
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 my-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-brandBlue">
          {isSignUp ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
        </h1>
        <p className="text-xs text-gray-400">
          {isSignUp ? 'ল্যামিয়া ইলেকট্রনিক্স-এ কেনাকাটা এবং ট্র্যাক করার জন্য অ্যাকাউন্ট তৈরি করুন' : 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-start gap-2 text-xs">
          <AlertCircle className="shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded-lg text-xs">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">আপনার নাম</label>
            <input
              type="text"
              required
              placeholder="যেমন: মোঃ করিম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">ইমেইল ঠিকানা</label>
          <input
            type="email"
            required
            placeholder="যেমন: username@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">পাসওয়ার্ড</label>
          <input
            type="password"
            required
            placeholder="কমপক্ষে ৬টি ক্যারেক্টার"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brandBlue bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brandBlue text-white font-bold rounded-xl hover:bg-opacity-95 transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? 'প্রসেসিং হচ্ছে...' : isSignUp ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-gray-100">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setSuccessMsg('');
          }}
          className="text-xs font-bold text-brandBlue hover:text-brandOrange transition-colors"
        >
          {isSignUp ? 'আগের অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করতে চান? এখানে ক্লিক করুন'}
        </button>
      </div>
    </div>
  );
}
