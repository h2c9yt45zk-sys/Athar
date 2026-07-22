import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductService } from '../services/productService';
import { useCart } from '../contexts/CartContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = ProductService.getProductById(id || '') || ProductService.getProductById('detail-lotus')!;
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('#0B1621');
  const [activeImage, setActiveImage] = useState<string>(product.image);

  const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const colors = product.colors || ['#0B1621', '#5D0F22', '#1A3A3A'];
  const thumbnails = product.thumbnails || [product.image];

  const handleAddToCart = () => {
    addToCart(product.name, product.price, activeImage, {
      size: selectedSize,
      color: selectedColor,
      productId: product.id,
    });
  };

  return (
    <main className="pt-24 pb-section-gap">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-mobile md:px-margin-desktop w-full">
        {/* Hero Section: Product Image */}
        <div className="md:col-span-7 lg:col-span-8">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg group">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={activeImage}
              alt={product.name}
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {thumbnails.map((thumb, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-md overflow-hidden border transition-all ${
                  activeImage === thumb ? 'border-brand-burgundy ring-2 ring-brand-burgundy' : 'border-outline-variant/30'
                }`}
                onClick={() => setActiveImage(thumb)}
              >
                <img
                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  src={thumb}
                  alt={`Thumbnail ${idx + 1}`}
                />
              </div>
            ))}
            <div className="aspect-square rounded-md overflow-hidden border border-outline-variant/30 bg-surface-container-low flex items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">play_circle</span>
            </div>
          </div>
        </div>

        {/* Product Info & Selection */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md text-secondary tracking-[0.3em]">
              {product.subtitle || 'المجموعة التراثية'}
            </span>
            <h1 className="font-headline-xl text-headline-xl arabic-serif text-primary">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="font-headline-md text-headline-md text-brand-burgundy">
                {product.price.toLocaleString()} ج.م
              </p>
              {product.oldPrice && (
                <span className="text-on-surface-variant line-through font-body-md">
                  {product.oldPrice.toLocaleString()} ج.م
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-label-md text-label-md border-b border-outline-variant pb-2">عن القطعة</h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-label-md text-label-md">اختر المقاس</h3>
              <button className="text-label-sm font-label-sm underline text-on-surface-variant">
                جدول المقاسات
              </button>
            </div>
            <div className="flex gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedSize === size
                      ? 'border-2 border-primary bg-primary text-white'
                      : 'border border-outline-variant hover:border-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-4">
            <h3 className="font-label-md text-label-md">اللون</h3>
            <div className="flex gap-4">
              {colors.map((colorHex) => (
                <button
                  key={colorHex}
                  onClick={() => setSelectedColor(colorHex)}
                  style={{ backgroundColor: colorHex }}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === colorHex ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:ring-2 hover:ring-offset-2 hover:ring-brand-burgundy'
                  }`}
                  aria-label={`Color ${colorHex}`}
                />
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-brand-burgundy text-white py-5 rounded-full font-label-md text-label-md flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg mt-4"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            إضافة إلى حقيبة التسوق
          </button>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 mt-8 py-8 border-t border-b border-outline-variant/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary">local_shipping</span>
              <div>
                <p className="font-label-sm text-label-sm">شحن سريع</p>
                <p className="text-[10px] text-on-surface-variant">٢-٣ أيام عمل</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <div>
                <p className="font-label-sm text-label-sm">ضمان الجودة</p>
                <p className="text-[10px] text-on-surface-variant">تطريز يدوي أصلي</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
