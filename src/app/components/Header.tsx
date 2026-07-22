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
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-sm bg-surface/95' : 'bg-surface/80'
      } glass-nav`}
    >
      <div className="flex flex-row-reverse justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-6 max-w-container-max mx-auto nav-container">
        {/* Desktop: Right Side / Mobile: Left Side (Actions) */}
        <div className="flex items-center gap-6 nav-actions">
          <button
            className="relative text-on-surface hover:text-brand-burgundy transition-colors duration-300"
            onClick={() => toggleCart(true)}
            aria-label="Shopping Bag"
          >
            <span className="material-symbols-outlined !scale-x-100">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-burgundy text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
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
              className="flex items-center gap-2 text-on-surface hover:text-brand-burgundy transition-colors duration-300 group"
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
          <span className="font-arabic-serif text-4xl text-brand-burgundy">أثر</span>
          <Link to="/" className="font-headline-xl text-headline-xl tracking-tight text-primary font-bold">
            ATHAR
          </Link>
        </div>
      </div>
    </nav>
  );
};
