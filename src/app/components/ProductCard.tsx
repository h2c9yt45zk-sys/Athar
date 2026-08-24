import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const UnavailableCardOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/45 pointer-events-none">
    <svg
      viewBox="0 0 64 64"
      className="h-12 w-12 text-red-500 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="4" />
      <path d="M20 44L44 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </div>
);

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const isOutOfStock = (product.sizes ?? []).filter((size) => AVAILABLE_SIZES.includes(size)).length === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    addToCart(product.name, product.price, product.image, { productId: product.id });
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card group cursor-pointer block rounded-[20px] overflow-hidden bg-[#FCF3E9] border border-[#D4AF37]/20">
      <div className="relative overflow-hidden aspect-[3/4] mb-0">
        <img
          className="product-image h-full w-full scale-[0.92] object-cover transition-transform duration-700"
          src={product.image}
          alt={product.name}
          style={{ opacity: isOutOfStock ? 0.6 : 1 }}
        />
        {isOutOfStock && <UnavailableCardOverlay />}
        {product.tag && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-[#D4AF37] text-[#4A0E17] px-2.5 py-1 text-[10px] font-label-md tracking-widest uppercase hidden md:inline rounded">
              {product.tag}
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-200">
              منتج غير متوفر
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="bg-[#4A0E17] text-white px-5 py-1.5 rounded-full text-[10px] font-label-md uppercase tracking-widest transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOutOfStock ? 'غير متوفر' : 'إضافة سريعة'}
          </button>
        </div>
      </div>
      <div className="flex justify-between items-start gap-3 flex-col md:flex-row p-3">
        <div className="text-right flex-1">
          <h3 className="font-headline-md text-[17px] mb-1 text-[#4A0E17] leading-tight">
            {product.name}
          </h3>
          <p className="font-label-sm text-[10px] text-black tracking-widest uppercase">
            {product.subtitle}
          </p>
        </div>
        <span className="font-body-md text-[12px] text-black font-bold whitespace-nowrap price">
          {product.price.toLocaleString()} ج.م
        </span>
      </div>
    </Link>
  );
};
