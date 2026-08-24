import { CATEGORIES } from '../data/data';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80';

const generateProductId = (): string => `p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeCategory = (value: string): Product['category'] => {
  if (value === 'women' || value === 'men' || value === 'islamic') {
    return value;
  }

  return 'women';
};

const normalizeProduct = (row: any): Product => {
  const sizes = Array.isArray(row?.sizes)
    ? row.sizes
    : typeof row?.sizes === 'string'
      ? JSON.parse(row.sizes || '[]')
      : [];

  const thumbnails = Array.isArray(row?.thumbnails)
    ? row.thumbnails
    : typeof row?.thumbnails === 'string'
      ? JSON.parse(row.thumbnails || '[]')
      : [];

  return {
    id: String(row?.id ?? ''),
    name: String(row?.name ?? ''),
    subtitle: String(row?.subtitle ?? row?.name ?? ''),
    price: Number(row?.price ?? 0),
    oldPrice: row?.old_price ?? row?.oldPrice ?? undefined,
    image: String(row?.image ?? ''),
    tag: row?.tag ?? undefined,
    isBestSeller: Boolean(row?.is_best_seller ?? row?.isBestSeller ?? false),
    category: normalizeCategory(String(row?.category ?? 'women')),
    description: row?.description ?? '',
    sizes: sizes.filter(Boolean).map(String),
    thumbnails: thumbnails.filter(Boolean).map(String),
  };
};

const toDbProduct = (product: Product) => {
  const safeId = String(product.id ?? '').trim() || generateProductId();
  const safeName = String(product.name ?? '').trim();
  const safeSubtitle = String(product.subtitle ?? (safeName || 'Untitled Product')).trim();
  const safeDescription = String(product.description ?? '').trim();
  const safeImage = String(product.image ?? '').trim() || DEFAULT_PRODUCT_IMAGE;
  const safeCategory = normalizeCategory(String(product.category ?? 'women'));
  const safeSizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean).map(String) : [];
  const safeThumbnails = Array.isArray(product.thumbnails) ? product.thumbnails.filter(Boolean).map(String) : [];

  return {
    id: safeId,
    name: safeName || 'Untitled Product',
    subtitle: safeSubtitle || safeName || 'Untitled Product',
    price: Number(product.price ?? 0),
    old_price: product.oldPrice != null ? Number(product.oldPrice) : null,
    image: safeImage,
    tag: product.tag ? String(product.tag).trim() : null,
    category: safeCategory,
    description: safeDescription,
    sizes: safeSizes,
    thumbnails: safeThumbnails,
    is_best_seller: Boolean(product.isBestSeller),
  };
};

export class ProductService {
  static async fetchProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Failed to fetch products from Supabase:', error);
        return [];
      }

      return (data ?? []).map(normalizeProduct).filter((product: Product) => product.id);
    } catch (error) {
      console.error('Supabase products fetch failed:', error);
      return [];
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await this.fetchProducts();
    return products.filter((product) => product.category === category);
  }

  static async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.fetchProducts();
    return products.find((product) => product.id === id);
  }

  static async getAllProducts(): Promise<Product[]> {
    return this.fetchProducts();
  }

  static async uploadProductImage(file: File, fallbackUrl = ''): Promise<string> {
    const safeFallbackUrl = fallbackUrl.trim() || DEFAULT_PRODUCT_IMAGE;

    try {
      const sanitizedName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '');
      const filePath = `products/${Date.now()}-${sanitizedName}`;

      console.log('Uploading product image to Supabase storage:', { filePath, fileName: file.name, type: file.type });

      const { data, error } = await supabase.storage.from('product-images').upload(filePath, file, {
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

      if (error) {
        console.warn('Supabase storage upload failed; using fallback image URL instead.', error);
        return safeFallbackUrl;
      }

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(data?.path || filePath);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }

      console.warn('Supabase storage returned no public URL; using fallback image URL instead.');
      return safeFallbackUrl;
    } catch (error) {
      console.warn('Product image upload threw an unexpected error; using fallback image URL instead.', error);
      return safeFallbackUrl;
    }
  }

  static async createProduct(product: Product): Promise<Product> {
    const payload = toDbProduct(product);
    console.log('Creating product in Supabase with payload:', payload);

    const { data, error } = await supabase.from('products').insert([payload]).select().single();

    if (error) {
      console.error('Supabase createProduct failed with payload:', payload, error);
      throw new Error(error.message || 'Failed to create product in Supabase');
    }

    if (!data) {
      console.error('Supabase createProduct returned no data for payload:', payload);
      throw new Error('Supabase createProduct returned no product data');
    }

    return normalizeProduct(data);
  }

  static async updateProduct(product: Product): Promise<Product> {
    const payload = toDbProduct(product);
    console.log('Updating product in Supabase:', payload);

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', product.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateProduct failed:', error);
      throw new Error(error.message || 'Failed to update product in Supabase');
    }

    if (!data) {
      console.error('Supabase updateProduct returned no data for product id:', product.id);
      throw new Error('Supabase updateProduct returned no product data');
    }

    return normalizeProduct(data);
  }

  static async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      throw error;
    }
  }

  static getCategoryInfo(category: string) {
    return CATEGORIES[category] || CATEGORIES.women;
  }
}
