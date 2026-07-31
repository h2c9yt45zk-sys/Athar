import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
