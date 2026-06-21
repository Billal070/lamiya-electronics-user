import './globals.css';
import { CartProvider } from '../context/CartContext';
import { SettingsProvider } from '../context/SettingsContext';
import { WishlistProvider } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Lamiya Electronics & IPS - সেরা দামে আইপিএস ও ইলেকট্রনিক্স পণ্য',
  description: 'উন্নতমানের ইলেকট্রনিক্স পণ্য এবং বিশ্বস্ত আইপিএস ও ব্যাটারি সলিউশন সেরা মূল্যে উপভোগ করুন।',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <SettingsProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow max-w-7xl w-full mx-auto px-2.5 sm:px-4 py-4 md:py-8">
                  {children}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
