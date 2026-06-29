'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function Login() {
  const { t } = useSettings();
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
      // 1. SIGN UP (নতুন অ্যাকাউন্ট তৈরি ও অটো-লগইন)
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
        setLoading(false);
      } else {
        // সুপাবেস স্বয়ংক্রিয়ভাবে লগইন করিয়ে দেওয়ায় আমরা সরাসরি নোটিশ দেখিয়ে প্রোফাইলে পাঠিয়ে দেব
        setSuccessMsg(t('register_success_msg') || 'Account created successfully! Logging you in...');
        
        // ১ সেকেন্ডের একটি অতি ক্ষুদ্র বিরতি যাতে কাস্টমার নোটিশটি দেখতে পারেন
        setTimeout(() => {
          router.push('/profile');
          router.refresh();
        }, 1000);
      }
    } else {
      // 2. SIGN IN (লগইন করা)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(t('login_error_msg'));
        setLoading(false);
      } else {
        router.push('/profile');
        router.refresh();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 my-10 select-none">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-brandBlue">
          {isSignUp ? t('register_header_title') : t('login_header_title')}
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          {isSignUp ? t('register_header_subtitle') : t('login_header_subtitle')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-start gap-2 text-xs font-bold">
          <AlertCircle className="shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded-lg flex items-start gap-2 text-xs font-bold animate-pulse">
          <CheckCircle2 className="shrink-0" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">{t('label_name_only')}</label>
            <input
              type="text"
              required
              placeholder="e.g. Billal Hossain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brandBlue bg-gray-50 text-gray-800"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">{t('label_email')}</label>
          <input
            type="email"
            required
            placeholder="e.g. username@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brandBlue bg-gray-50 text-gray-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">{t('label_password')}</label>
          <input
            type="password"
            required
            placeholder={t('placeholder_password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brandBlue bg-gray-50 text-gray-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brandBlue text-white font-bold rounded-xl hover:bg-opacity-95 transition-all text-sm flex items-center justify-center gap-2 shadow"
        >
          {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Login Now'}
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
          {isSignUp ? 'Already have an account? Login here' : "Don't have an account? Sign up here"}
        </button>
      </div>
    </div>
  );
}
