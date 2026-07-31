import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  const isProductDetailsPage = location.pathname.startsWith('/product');

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#4A0E17] border-b border-[#00000020] shadow-sm"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex flex-row-reverse justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto nav-container">
        {/* Desktop: Right Side / Mobile: Left Side (Actions) */}
        <div className="flex items-center gap-6 nav-actions">
          <Link
            to="/tracking"
            className="flex items-center gap-2 text-white hover:text-[#D4AF37] transition-colors duration-300"
            aria-label="Track Order"
          >
            <span className="material-symbols-outlined !scale-x-100">local_shipping</span>
            <span className="text-sm font-semibold">تتبع طلبك</span>
          </Link>

          <button
            className="relative text-white hover:text-[#D4AF37] transition-colors duration-300"
            onClick={() => toggleCart(true)}
            aria-label="Shopping Bag"
          >
            <span className="material-symbols-outlined !scale-x-100">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-[#4A0E17] text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {!isHomePage && (
            <button
              onClick={() => {
                if (isProductDetailsPage) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-2 text-white hover:text-[#D4AF37] transition-colors duration-300 group"
            >
              <span className="material-symbols-outlined">
                {isProductDetailsPage ? 'arrow_forward' : 'arrow_back'}
              </span>
              <span className="font-label-md uppercase tracking-widest hidden sm:inline">العودة</span>
            </button>
          )}
        </div>

        {/* Desktop: Left Side / Mobile: Right Side (Logo) */}
        <div className="flex items-center gap-4 nav-brand">
          <span className="font-arabic-serif text-4xl text-[#D4AF37]">أثر</span>
          <Link to="/" className="font-headline-xl text-headline-xl tracking-tight text-white font-bold">
            ATHAR
          </Link>
        </div>
      </div>
    </nav>
  );
};
