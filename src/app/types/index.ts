export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: string;
  category: 'women' | 'men' | 'islamic';
  description?: string;
  sizes?: string[];
  colors?: string[];
  thumbnails?: string[];
}

export interface CartItem {
  id: number | string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  size?: string;
  color?: string;
}

export interface CategoryInfo {
  id: string;
  title: string;
  description: string;
}
