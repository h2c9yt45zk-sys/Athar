import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.name, product.price, product.image, { productId: product.id });
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card group cursor-pointer block rounded-[20px] overflow-hidden bg-[#FCF3E9] border border-[#D4AF37]/20">
      <div className="relative overflow-hidden aspect-[3/4] mb-0">
        <img
          className="product-image w-full h-full object-cover transition-transform duration-700"
          src={product.image}
          alt={product.name}
        />
        {product.tag && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#D4AF37] text-[#4A0E17] px-3 py-1.5 text-xs font-label-md tracking-widest uppercase hidden md:inline rounded">
              {product.tag}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleQuickAdd}
            className="bg-[#4A0E17] text-white px-6 py-2 rounded-full text-xs font-label-md uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-black"
          >
            إضافة سريعة
          </button>
        </div>
      </div>
      <div className="flex justify-between items-start gap-4 flex-col md:flex-row p-4">
        <div className="text-right flex-1">
          <h3 className="font-headline-md text-headline-md mb-2 group-hover:text-brand-burgundy transition-colors">
            {product.name}
          </h3>
          <p className="font-label-sm text-label-sm text-[#5A4A3F] tracking-widest uppercase">
            {product.subtitle}
          </p>
        </div>
        <span className="font-body-md text-body-md text-[#D4AF37] font-bold whitespace-nowrap price">
          {product.price.toLocaleString()} ج.م
        </span>
      </div>
    </Link>
  );
};
