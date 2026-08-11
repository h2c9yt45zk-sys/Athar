import { PRODUCTS, CATEGORIES, FEATURED_PRODUCT } from '../data/data';
import { Product } from '../types';

export class ProductService {
  static getProductsByCategory(category: string): Product[] {
    return PRODUCTS.filter((product) => product.category === category);
  }

  static getProductById(id: string): Product | undefined {
    if (id === FEATURED_PRODUCT.id || id === 'detail-1') {
      return FEATURED_PRODUCT;
    }
    return PRODUCTS.find((p) => p.id === id);
  }

  static getAllProducts(): Product[] {
    return PRODUCTS;
  }

  static getCategoryInfo(category: string) {
    return CATEGORIES[category] || CATEGORIES.women;
  }
}
