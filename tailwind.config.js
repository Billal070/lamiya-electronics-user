/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // এই লাইনটি যোগ করুন
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: '#2D4087',
        brandOrange: '#FBB13A',
        brandDark: '#1E293B',
      },
    },
  },
  plugins: [],
}
