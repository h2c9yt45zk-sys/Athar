import { CATEGORIES } from '../data/data';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80';

export const PRODUCT_STORAGE_BUCKET = 'images';

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
  let safeImage = String(product.image ?? '').trim();
  if (!safeImage || safeImage.startsWith('blob:') || safeImage.startsWith('data:')) {
    safeImage = DEFAULT_PRODUCT_IMAGE;
  }
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

  static async uploadProductImage(file: File): Promise<string> {
    if (!file) {
      throw new Error('No image file provided for upload');
    }

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `products/${uniqueSuffix}-${sanitizedBase || 'image'}.${fileExt || 'jpg'}`;

    console.log("Uploading product image to Supabase Storage bucket 'images':", {
      filePath,
      fileName: file.name,
      fileType: file.type,
      size: file.size,
    });

    // 1. Upload the selected image file directly to the 'images' Supabase Storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      console.error('Full Supabase Error:', uploadError);
      console.error("Supabase storage upload error in bucket 'images':", uploadError);
      const msg =
        uploadError.message ||
        (uploadError as any).error_description ||
        (uploadError as any).error ||
        "Failed to upload image to Supabase Storage bucket 'images'";
      throw new Error(msg);
    }

    // 2. Retrieve the permanent Public URL using supabase.storage.from('images').getPublicUrl(...)
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(uploadData?.path || filePath);

    if (!publicUrlData?.publicUrl) {
      const err = new Error("Supabase storage failed to return a public URL from bucket 'images'");
      console.error('Full Supabase Error:', err);
      throw err;
    }

    console.log("Successfully retrieved permanent public URL from 'images' bucket:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  }

  static async createProduct(product: Product): Promise<Product> {
    const payload = toDbProduct(product);
    console.log('Creating product in Supabase with payload:', payload);

    const { data, error } = await supabase.from('products').insert([payload]).select().single();

    if (error) {
      console.error('Full Supabase Error:', error);
      console.error('Supabase createProduct failed with payload:', payload, error);
      const msg = error.message || error.details || error.hint || 'Failed to create product in Supabase';
      throw new Error(msg);
    }

    if (!data) {
      const err = new Error('Supabase createProduct returned no product data');
      console.error('Full Supabase Error:', err);
      console.error('Supabase createProduct returned no data for payload:', payload);
      throw err;
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
      console.error('Full Supabase Error:', error);
      console.error('Supabase updateProduct failed:', error);
      const msg = error.message || error.details || error.hint || 'Failed to update product in Supabase';
      throw new Error(msg);
    }

    if (!data) {
      const err = new Error('Supabase updateProduct returned no product data');
      console.error('Full Supabase Error:', err);
      console.error('Supabase updateProduct returned no data for product id:', product.id);
      throw err;
    }

    return normalizeProduct(data);
  }

  static async deleteProduct(productId: string, imageUrl?: string): Promise<void> {
    // 1. Delete the associated image from Supabase Storage 'images' bucket
    if (imageUrl) {
      try {
        // Extract the storage file path from the public URL
        // Public URLs look like: https://<project>.supabase.co/storage/v1/object/public/images/products/...
        const bucketMarker = '/storage/v1/object/public/images/';
        const markerIndex = imageUrl.indexOf(bucketMarker);
        if (markerIndex !== -1) {
          const filePath = decodeURIComponent(imageUrl.substring(markerIndex + bucketMarker.length));
          console.log('Deleting image from Supabase Storage bucket "images":', filePath);

          const { error: storageError } = await supabase.storage
            .from('images')
            .remove([filePath]);

          if (storageError) {
            // Log but don't block product deletion if image removal fails
            console.error('Failed to delete image from storage:', storageError);
          } else {
            console.log('Successfully deleted image from storage:', filePath);
          }
        } else {
          console.log('Image URL does not point to Supabase Storage, skipping storage deletion:', imageUrl);
        }
      } catch (storageErr) {
        // Log but don't block product deletion
        console.error('Error during storage image deletion:', storageErr);
      }
    }

    // 2. Delete the product record from the 'products' table
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      console.error('Full Supabase Error:', error);
      throw error;
    }
  }

  static getCategoryInfo(category: string) {
    return CATEGORIES[category] || CATEGORIES.women;
  }
}
