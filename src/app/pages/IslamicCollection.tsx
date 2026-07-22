import React from 'react';
import { ProductService } from '../services/productService';
import { ProductList } from '../components/ProductList';

export const IslamicCollection: React.FC = () => {
  const categoryInfo = ProductService.getCategoryInfo('islamic');
  const products = ProductService.getProductsByCategory('islamic');

  return (
    <main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Hero Header */}
      <header className="mb-section-gap text-right">
        <h1 className="font-arabic-serif text-6xl md:text-8xl text-brand-burgundy mb-4 leading-tight">
          {categoryInfo.title}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mr-0">
          {categoryInfo.description}
        </p>
      </header>

      {/* Product Grid */}
      <ProductList products={products} />

      {/* Pagination / Load More */}
      <div className="mt-section-gap flex justify-center">
        <button className="group relative px-12 py-4 rounded-full overflow-hidden bg-brand-burgundy text-white transition-all duration-300 hover:pl-16">
          <span className="font-label-md uppercase tracking-widest relative z-10">
            اكتشف المزيد من القطع
          </span>
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            arrow_forward
          </span>
        </button>
      </div>
    </main>
  );
};
