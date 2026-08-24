import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart } = useCart();
  const product = products.find((item) => item.id === id) ?? products[0];
  const relatedScrollRef = useRef<HTMLDivElement | null>(null);
  const relatedCardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>(product.image);

  const sizes = (product.sizes ?? []).filter((size) => AVAILABLE_SIZES.includes(size));
  const isOutOfStock = sizes.length === 0;
  const relatedProducts = products.filter((item) => item.category === product.category && item.id !== product.id);

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);

  useEffect(() => {
    if (!sizes.length) {
      setSelectedSize('');
      return;
    }

    setSelectedSize((current) => (sizes.includes(current) ? current : sizes[0]));
  }, [sizes]);

  useEffect(() => {
    if (!relatedScrollRef.current || relatedProducts.length === 0) {
      return;
    }

    const updateRelatedCardOpacity = () => {
      const container = relatedScrollRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      relatedCardRefs.current.forEach((card) => {
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const isFullyVisible = cardRect.left >= containerRect.left && cardRect.right <= containerRect.right;

        card.style.opacity = isFullyVisible ? '1' : '0.4';
      });
    };

    updateRelatedCardOpacity();
    relatedScrollRef.current.addEventListener('scroll', updateRelatedCardOpacity, { passive: true });
    window.addEventListener('resize', updateRelatedCardOpacity);

    return () => {
      relatedScrollRef.current?.removeEventListener('scroll', updateRelatedCardOpacity);
      window.removeEventListener('resize', updateRelatedCardOpacity);
    };
  }, [relatedProducts]);

  const handleAddToCart = () => {
    if (!selectedSize || isOutOfStock) {
      return;
    }

    addToCart(product.name, product.price, activeImage, {
      size: selectedSize,
      productId: product.id,
    });
  };

  const handleRelatedProductClick = (itemId: string) => {
    navigate(`/product/${itemId}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <main className="min-h-screen bg-[#4A0E17] pt-24 pb-section-gap text-[#D4AF37]">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 md:items-center gap-gutter px-margin-mobile md:px-margin-desktop w-full">
        {/* Hero Section: Product Image */}
        <div className="md:col-span-7 lg:col-span-8">
          <div className="mx-auto w-[70%] max-w-[720px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg group" style={{ transform: 'scale(0.85)' }}>
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={activeImage}
                alt={product.name}
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="relative mt-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-[#4A0E17] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-[#4A0E17] to-transparent" />

              <div className="mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">منتجات من نفس القسم</h3>
              </div>

              <div
                ref={relatedScrollRef}
                className="flex gap-4 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {relatedProducts.map((item, index) => {
                  const itemIsOutOfStock = !item.sizes || item.sizes.length === 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      ref={(node) => {
                        relatedCardRefs.current[index] = node;
                      }}
                      onClick={() => handleRelatedProductClick(item.id)}
                      className="group block min-w-[162px] max-w-[162px] overflow-hidden rounded-[18px] border border-[#D4AF37]/20 bg-[#FCF3E9] text-left shadow-sm opacity-100 text-left transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[18px]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          style={{
                            transform: 'scale(0.9)',
                            transformOrigin: 'center',
                            opacity: itemIsOutOfStock ? 0.6 : 1,
                          }}
                        />
                        {itemIsOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
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
                        )}
                      </div>
                      <div className="space-y-1 p-3">
                        <h4 className="line-clamp-2 text-sm font-semibold text-[#4A0E17]">{item.name}</h4>
                        <p className="text-xs text-[#5A4A3F]">{item.price.toLocaleString()} ج.م</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Product Info & Selection */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-center gap-8 w-full pt-4 md:pt-6" style={{ transform: 'translateY(0)' }}>
          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md text-[#D4AF37] tracking-[0.3em] uppercase">
              {product.subtitle || 'المجموعة التراثية'}
            </span>
            <h1 className="font-headline-xl text-headline-xl arabic-serif text-[#D4AF37]">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="font-headline-md text-headline-md text-[#D4AF37] font-bold">
                {product.price.toLocaleString()} ج.م
              </p>
              {product.oldPrice && (
                <span className="text-[#D4AF37]/70 line-through font-body-md">
                  {product.oldPrice.toLocaleString()} ج.م
                </span>
              )}
            </div>
          </div>

          {/* Size Selection */}
          {!isOutOfStock && sizes.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-label-md text-label-md text-[#D4AF37]">اختر المقاس</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'border-2 border-[#D4AF37] bg-[#D4AF37] text-[#4A0E17]'
                        : 'border border-[#D4AF37]/60 text-[#D4AF37] hover:border-[#D4AF37] hover:bg-white/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || !selectedSize}
            className="w-full bg-white text-[#4A0E17] py-5 rounded-full font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-[#f3f0e5] active:scale-95 transition-all shadow-lg mt-4 disabled:cursor-not-allowed disabled:bg-[#d9d0c5] disabled:text-[#4A0E17]/70"
          >
            {!isOutOfStock ? (
              <>
                <span className="material-symbols-outlined">shopping_bag</span>
                {selectedSize ? 'إضافة إلى حقيبة التسوق' : 'لا توجد مقاسات متاحة'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">block</span>
                منتج غير متوفر
              </>
            )}
          </button>

        </div>
      </div>
    </main>
  );
};
