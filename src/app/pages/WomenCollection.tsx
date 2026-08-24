import React from 'react';
import { ProductList } from '../components/ProductList';
import { useCart } from '../contexts/CartContext';

export const WomenCollection: React.FC = () => {
  const { categories, products } = useCart();
  const categoryInfo = categories.women;
  const visibleProducts = products.filter((product) => product.category === 'women');

  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-[#4A0E17] text-[#F7E7CC]">
      {/* Hero Header */}
      <header className="mb-6 text-right">
        <h1
          className="font-arabic-serif text-[#D4AF37] mb-2 leading-tight"
          style={{ fontSize: '4.2rem', lineHeight: 1.1 }}
        >
          {categoryInfo.title}
        </h1>
        <p
          className="font-body-lg text-[#F7E7CC] max-w-2xl mr-0"
          style={{ fontSize: '1.05rem', lineHeight: 1.6 }}
        >
          {categoryInfo.description}
        </p>
      </header>

      {/* Product Grid */}
      <ProductList products={visibleProducts} />
    </main>
  );
};
