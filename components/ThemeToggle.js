'use client';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none dark:bg-gray-700"
    >
      <span className="sr-only">Toggle Theme</span>
      <span
        className={`pointer-events-none relative inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
        } flex items-center justify-center`}
      >
        {theme === 'dark' ? (
          <Moon size={11} className="text-brandBlue" />
        ) : (
          <Sun size={11} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
}
