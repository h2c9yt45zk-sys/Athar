import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=80&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder';

const ensureFour = (list: any[]) => {
  if (list.length >= 4) return list.slice(0, 4);
  const output = [...list];
  let index = 0;
  while (output.length < 4 && list.length > 0) {
    output.push(list[index % list.length]);
    index += 1;
  }
  return output;
};

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

function CategorySection({ category }: { category: { id: string; title: string; description: string } }) {
  const { products } = useCart();
  const items = ensureFour(products.filter((product) => product.category === category.id && !product.isBestSeller));

  return (
    <section className="mb-16">
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

      <div className="mt-8 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-stretch">
        {items.map((product) => (
          <article
            key={product.id}
            className="flex h-full flex-col overflow-hidden rounded-[24px] bg-[#FCF3E9] border border-[#D4AF37]/20 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
          >
            <div className="relative h-60 overflow-hidden bg-[#F4E8DA]">
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

            <div className="flex flex-1 flex-col justify-between p-4 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black">{product.tag || 'الأكثر مبيعاً'}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#4A0E17]">{product.name}</h3>
                <p className="mt-1 text-[11px] leading-5 text-black">{product.subtitle}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-base font-bold text-black">{product.price?.toLocaleString()} ج.م</span>
                <Link
                  to={`/product/${product.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#4A0E17] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3b0b12]"
                >
                  عرض
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export const Home: React.FC = () => {
  const { categories, products } = useCart();
  const categoriesList = Object.values(categories);
  const bestSellerProducts = products.filter((product) => product.isBestSeller).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#4A0E17]" dir="rtl">
      <div className="max-w-container-max mx-auto px-4 py-10 lg:px-8 lg:py-14">
        {bestSellerProducts.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">Best Sellers</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#D4AF37]">الأكثر مبيعا</h2>
              </div>
            </div>

            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-stretch">
              {bestSellerProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex h-full flex-col overflow-hidden rounded-[24px] bg-[#FCF3E9] border border-[#D4AF37]/20 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
                >
                  <div className="relative h-60 overflow-hidden bg-[#F4E8DA]">
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

                  <div className="flex flex-1 flex-col justify-between p-4 text-right">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-black">{product.tag || 'الأكثر مبيعاً'}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[#4A0E17]">{product.name}</h3>
                      <p className="mt-1 text-[11px] leading-5 text-black">{product.subtitle}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-base font-bold text-black">{product.price?.toLocaleString()} ج.م</span>
                      <Link
                        to={`/product/${product.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-[#4A0E17] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3b0b12]"
                      >
                        عرض
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {categoriesList.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </main>
  );
};

export default Home;
