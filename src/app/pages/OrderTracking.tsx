import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const normalizeOrderCode = (value?: string | null) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value)
    .replace(/^#/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .trim()
    .toUpperCase();
};

const statusClasses: Record<string, string> = {
  'قيد الانتظار': 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  'قيد التجهيز': 'bg-sky-500/15 text-sky-200 border-sky-400/30',
  'تم الشحن': 'bg-violet-500/15 text-violet-200 border-violet-400/30',
  'تم التوصيل': 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
};

export const OrderTracking: React.FC = () => {
  const { orders } = useCart();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof orders>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const codeFromUrl = new URLSearchParams(location.search).get('code');
    const storedCode = sessionStorage.getItem('athar_last_order_code');
    const initialCode = codeFromUrl ?? storedCode ?? '';

    if (!initialCode) {
      return;
    }

    const normalized = normalizeOrderCode(initialCode);
    setQuery(initialCode);
    setResults(
      orders.filter((order) => normalizeOrderCode(order?.orderCode) === normalized)
    );
    setHasSearched(true);
  }, [location.search, orders]);

  const handleSearch = () => {
    const normalized = normalizeOrderCode(query);

    if (!normalized) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const matches = orders.filter((order) => normalizeOrderCode(order?.orderCode) === normalized);
    setResults(matches);
    setHasSearched(true);
  };

  return (
    <main className="min-h-screen bg-[#4A0E17] px-4 py-24 text-[#F7E7CC] md:px-8" dir="rtl">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-[#d8b56a]/20 bg-[#18070d]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#d8b56a]">Order Tracking</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">تتبع طلبك</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#e9d9c3]">
            أدخل رمز الطلب الخاص بك للبحث عنه فقط بعد الضغط على زر البحث.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <label className="block text-sm text-[#f2e1d0]">
            <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-[#d8b56a]">البحث برمز الطلب</span>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="اكتب رمز الطلب مثل ATHAR-1045"
                className="w-full rounded-2xl border border-white/10 bg-[#12070d]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8b56a]"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-[#4A0E17] transition hover:bg-[#c39f2f]"
              >
                بحث
              </button>
            </div>
          </label>
        </div>

        <div className="mt-6 grid gap-4">
          {!hasSearched && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-[#f2e1d0]">
              أدخل رمز الطلب الخاص بك للبحث عن طلبك.
            </div>
          )}

          {hasSearched && results.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-[#f2e1d0]">
              لم يتم العثور على طلب بهذا الكود، تأكد من نسخه بشكل صحيح.
            </div>
          )}

          {results.length > 0 && results.map((order, index) => {
            const orderCode = normalizeOrderCode(order?.orderCode);
            const items = Array.isArray(order?.items) ? order.items : [];

            return (
              <article key={order?.id ?? `${orderCode}-${index}`} className="rounded-[24px] border border-white/10 bg-[#1a0d13]/90 p-5 shadow-[0_16px_60px_rgba(0,0,0,0.25)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8b56a]">العميل</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">{order?.customerName ?? 'غير محدد'}</h2>
                    <p className="mt-2 text-sm text-[#f1dfbd]">{order?.phone ?? 'لا يوجد رقم'}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${statusClasses[order?.status ?? 'قيد الانتظار']}`}>{order?.status ?? 'غير محدد'}</span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#f2e1d0]">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#d8b56a]">العنوان</p>
                    <p className="mt-2 leading-7">{order?.address ?? 'غير متوفر'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#f2e1d0]">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#d8b56a]">الإجمالي</p>
                    <p className="mt-2 text-lg font-semibold text-white">{Number(order?.total ?? 0).toLocaleString()} ر.س</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#f2e1d0]">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#d8b56a]">طريقة الدفع</p>
                    <p className="mt-2 text-white">{order?.paymentMethod ?? 'غير محدد'}{order?.electronicMethod ? ` - ${order.electronicMethod}` : ''}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#f2e1d0]">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#d8b56a]">حالة الدفع</p>
                    <p className="mt-2 text-white">{order?.paymentStatus ?? 'غير محدد'}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d8b56a]">المنتجات</p>
                  <ul className="mt-3 space-y-2 text-sm text-[#f2e1d0]">
                    {items.length > 0 ? (
                      items.map((item, itemIndex) => (
                        <li key={`${order?.id ?? index}-${item?.name ?? itemIndex}-${itemIndex}`} className="flex items-center justify-between gap-3">
                          <span>{item?.name ?? 'منتج غير محدد'}</span>
                          <span>{Number(item?.quantity ?? 0)} × {Number(item?.price ?? 0).toLocaleString()} ج.م</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#f2e1d0]/80">لا توجد منتجات في هذا الطلب.</li>
                    )}
                  </ul>
                </div>

                {order?.screenshotUrl && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#d8b56a]">إيصال الدفع</p>
                    <img src={order.screenshotUrl} alt="إيصال الدفع" className="mt-3 h-56 w-full rounded-2xl object-cover" />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default OrderTracking;
