import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=80&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder';

const UnavailableCardOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/45 pointer-events-none">
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
);

function ProductCard({ product }: { product: any }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[14px] md:rounded-[24px] bg-[#FCF3E9] border border-[#D4AF37]/20 shadow-[0_8px_24px_rgba(0,0,0,0.14)] md:shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
      <div className="relative h-28 md:h-60 overflow-hidden bg-[#F4E8DA]">
        <img
          src={product.image || FALLBACK_IMG}
          alt={product.name}
          className="h-full w-full scale-[0.92] object-cover"
          style={{ opacity: (product.sizes ?? []).length === 0 ? 0.6 : 1 }}
          onError={(event) => {
            const img = event.currentTarget as HTMLImageElement;
            if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
          }}
        />
        {(product.sizes ?? []).length === 0 && <UnavailableCardOverlay />}
      </div>

      <div className="flex flex-1 flex-col justify-between p-2 md:p-4 text-right">
        <div>
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-black line-clamp-1">{product.tag}</p>
          <h3 className="mt-1 md:mt-2 text-[11px] md:text-lg font-semibold text-[#4A0E17] line-clamp-2 leading-tight">{product.name}</h3>
          <p className="hidden md:block mt-1 text-[11px] leading-5 text-black">{product.subtitle}</p>
        </div>

        <div className="mt-2 md:mt-4 flex flex-col md:flex-row items-end md:items-center justify-between gap-1 md:gap-3">
          <span className="text-[10px] md:text-base font-bold text-black">{product.price?.toLocaleString()} ج.م</span>
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center justify-center rounded-full bg-[#4A0E17] px-2 py-1 md:px-3.5 md:py-1.5 text-[9px] md:text-xs font-semibold text-white transition hover:bg-[#3b0b12]"
          >
            عرض
          </Link>
        </div>
      </div>
    </article>
  );
}


function CategorySection({ category }: { category: { id: string; title: string; description: string } }) {
  const { products } = useCart();

  // Only show products explicitly marked as best sellers by the admin
  const items = products.filter(
    (product) => product.category === category.id && product.isBestSeller === true
  );

  return (
    <section className="mb-8 md:mb-12">
      {/* Category header — always visible */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#D4AF37]">{category.title}</h2>
          <p className="mt-3 max-w-2xl text-sm text-[#F2E5CD]">{category.description}</p>
        </div>

        <Link
          to={category.id === 'women' ? '/women' : category.id === 'men' ? '/men' : '/islamic'}
          className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-[#4A0E17] transition hover:bg-[#c39f2f]"
        >
          تصفح كافة {category.title}
        </Link>
      </div>

      {/* Product grid — only rendered when the admin has marked best-seller products */}
      {items.length > 0 && (
        <div className="mt-6 grid gap-2 md:gap-4 grid-cols-4 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export const Home: React.FC = () => {
  const { categories } = useCart();
  const categoriesList = Object.values(categories);

  return (
    <main className="min-h-screen bg-[#4A0E17]" dir="rtl">
      <div className="max-w-container-max mx-auto px-4 py-6 lg:px-8 lg:py-10">
        {categoriesList.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </main>
  );
};

export default Home;
