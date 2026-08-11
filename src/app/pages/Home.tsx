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

function CategorySection({ category }: { category: { id: string; title: string; description: string } }) {
  const { products } = useCart();
  const items = ensureFour(products.filter((product) => product.category === category.id));

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

      <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-stretch">
        {items.map((product) => (
          <article
            key={product.id}
            className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[#FCF3E9] border border-[#D4AF37]/20 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
          >
            <div className="h-72 overflow-hidden bg-[#F4E8DA]">
              <img
                src={product.image || FALLBACK_IMG}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  const img = event.currentTarget as HTMLImageElement;
                  if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
                }}
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-5 text-right">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#4A0E17]">{product.tag || 'الأكثر مبيعاً'}</p>
                <h3 className="mt-3 text-xl font-semibold text-[#4A0E17]">{product.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5A4A3F]">{product.subtitle}</p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-lg font-bold text-[#D4AF37]">{product.price?.toLocaleString()} ج.م</span>
                <Link
                  to={`/product/${product.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#4A0E17] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3b0b12]"
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
  const { categories } = useCart();
  const categoriesList = Object.values(categories);

  return (
    <main className="min-h-screen bg-[#4A0E17]" dir="rtl">
      <div className="max-w-container-max mx-auto px-4 py-10 lg:px-8 lg:py-14">
        {categoriesList.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </main>
  );
};

export default Home;
