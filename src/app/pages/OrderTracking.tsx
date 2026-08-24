import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderService } from '../services/orderService';
import type { Order, OrderStatus } from '../types';

const ORDER_STEPS: Array<{ key: OrderStatus; label: string; description: string; icon: string }> = [
  {
    key: 'قيد الانتظار',
    label: 'تم استلام الطلب',
    description: 'تم تسجيل طلبك بنجاح وفي انتظار المراجعة والتأكيد.',
    icon: 'receipt_long',
  },
  {
    key: 'قيد التجهيز',
    label: 'جاري التجهيز',
    description: 'يتم الآن تجهيز وتطريز طلبك بعناية تامة.',
    icon: 'inventory_2',
  },
  {
    key: 'تم الشحن',
    label: 'تم الشحن',
    description: 'تم تسليم الشحنة لشركة الشحن وهي في طريقها إليك.',
    icon: 'local_shipping',
  },
  {
    key: 'تم التوصيل',
    label: 'تم التوصيل',
    description: 'تم تسليم طلبك بنجاح. نرجو أن تنال منتجاتنا إعجابكم.',
    icon: 'task_alt',
  },
];

const STEP_INDEX_MAP: Record<OrderStatus, number> = {
  'قيد الانتظار': 0,
  'قيد التجهيز': 1,
  'تم الشحن': 2,
  'تم التوصيل': 3,
};

const statusBadgeStyles: Record<OrderStatus, string> = {
  'قيد الانتظار': 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  'قيد التجهيز': 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  'تم الشحن': 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  'تم التوصيل': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
};

const getPaymentStatusDisplay = (paymentMethod?: string, paymentStatus?: string) => {
  const method = paymentMethod || 'الدفع عند الاستلام';
  if (method === 'الدفع عند الاستلام') {
    return '-';
  }
  return paymentStatus || 'جاري الفحص';
};

export const OrderTracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [recentOrderCode, setRecentOrderCode] = useState<string | null>(null);

  const executeSearch = useCallback(async (query: string) => {
    const value = query.trim();
    if (!value) {
      setError('يرجى إدخال رقم الهاتف أو رمز تتبع الطلب.');
      setOrders([]);
      setSearched(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setSearched(true);

    try {
      const matches = await OrderService.fetchOrdersByPhoneOrCode(value);
      setOrders(matches);

      if (matches.length === 0) {
        setError('لم نتمكن من العثور على أي طلبات مطابقة. يرجى التأكد من رقم الهاتف أو رمز التتبع.');
      }
    } catch (lookupError: any) {
      console.error('Order lookup failed:', lookupError);
      setError(lookupError?.message || 'تعذر البحث عن الطلبات في الوقت الحالي.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastCode = sessionStorage.getItem('athar_last_order_code');
      if (lastCode) {
        setRecentOrderCode(lastCode);
      }
    }

    const codeParam = searchParams.get('code') || searchParams.get('search') || searchParams.get('phone');
    if (codeParam) {
      setSearchValue(codeParam);
      executeSearch(codeParam);
    }
  }, [searchParams, executeSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      setSearchParams({ code: searchValue.trim() });
    }
    executeSearch(searchValue);
  };

  const handleRecentCodeClick = (code: string) => {
    setSearchValue(code);
    setSearchParams({ code });
    executeSearch(code);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'غير متوفر';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <main className="min-h-screen bg-[#4A0E17] px-4 py-20 text-[#F7E7CC] md:px-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        {/* Header Title Section */}
        <div className="text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[#d8b56a]">
            Order Tracking System
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">تتبع حالة طلبك</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#e9d9c3]">
            تابع مراحل تجهيز وشحن طلبك بكل سهولة وبشكل مباشر من قاعدة البيانات، دون الحاجة لتسجيل الدخول أو كلمات مرور.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="mt-8 rounded-[28px] border border-[#d8b56a]/30 bg-[#1b0a12]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="أدخل رقم هاتفك (01xxxxxxxxx) أو رمز التتبع (ATHAR-XXXX)"
                className="w-full rounded-2xl border border-white/15 bg-[#12050b] px-4 py-3.5 text-right text-sm text-white placeholder-white/40 outline-none transition focus:border-[#d8b56a]"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  title="مسح"
                >
                  <span className="material-symbols-outlined text-sm !scale-x-100">close</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-8 py-3.5 text-sm font-bold text-[#4A0E17] transition hover:bg-[#c49e2f] disabled:cursor-not-allowed disabled:opacity-60 shadow-md"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#4A0E17] border-t-transparent" />
                  <span>جارٍ البحث...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg !scale-x-100">search</span>
                  <span>بحث</span>
                </>
              )}
            </button>
          </form>

          {recentOrderCode && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#e9d9c3]">
              <span>طلبك الأخير:</span>
              <button
                type="button"
                onClick={() => handleRecentCodeClick(recentOrderCode)}
                className="inline-flex items-center gap-1 rounded-full border border-[#d8b56a]/30 bg-[#d8b56a]/10 px-3 py-1 font-mono font-semibold text-[#f3ce90] transition hover:bg-[#d8b56a]/20"
              >
                <span>{recentOrderCode}</span>
                <span className="material-symbols-outlined text-xs !scale-x-100">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
            <span className="material-symbols-outlined text-red-400">error</span>
            <p className="flex-1 leading-6">{error}</p>
          </div>
        )}

        {/* Results Container */}
        <div className="mt-8 space-y-8">
          {!searched && !orders.length && !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-black/20 p-12 text-center text-[#e9d9c3]">
              <span className="material-symbols-outlined text-6xl text-white/40">local_shipping</span>
              <h3 className="mt-4 text-lg font-semibold text-white">ابحث عن طلبك</h3>
              <p className="mt-1 max-w-sm text-xs leading-6 text-[#e9d9c3]/70">
                أدخل رقم هاتفك أو رمز تتبع الطلب الذي حصلت عليه أثناء إتمام الطلب لمعرفة خط سير شحنتك.
              </p>
            </div>
          )}

          {orders.map((order, orderIndex) => {
            const currentStepIdx = STEP_INDEX_MAP[order.status] ?? 0;

            return (
              <article
                key={order.id || order.orderCode || orderIndex}
                className="overflow-hidden rounded-[28px] border border-[#d8b56a]/30 bg-[#1b0a12]/95 shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
              >
                {/* Order Top Bar */}
                <div className="border-b border-white/10 bg-[#250d19] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#d8b56a]">
                          رمز التتبع:
                        </span>
                        <span className="font-mono text-xl font-bold tracking-widest text-[#D4AF37]">
                          {order.orderCode || order.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(order.orderCode || order.id)}
                          className="text-[#d8b56a]/60 transition hover:text-[#d8b56a]"
                          title="نسخ الرمز"
                        >
                          <span className="material-symbols-outlined text-sm !scale-x-100">
                            {copiedCode === (order.orderCode || order.id) ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-[#e9d9c3]/70">
                        تاريخ الطلب: {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                          statusBadgeStyles[order.status] ?? statusBadgeStyles['قيد الانتظار']
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {order.status || 'قيد الانتظار'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="border-b border-white/10 bg-black/20 p-6 md:p-8">
                  <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-[#d8b56a]">
                    مراحل متابعة الشحنة
                  </h4>

                  <div className="relative">
                    {/* Stepper Grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div
                            key={step.key}
                            className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                              isCurrent
                                ? 'border-[#d8b56a] bg-[#d8b56a]/15 text-[#f3ce90] shadow-lg shadow-[#d8b56a]/10'
                                : isCompleted
                                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                                  : 'border-white/5 bg-white/[0.02] text-white/40'
                            }`}
                          >
                            <div
                              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full text-base transition-colors ${
                                isCurrent
                                  ? 'bg-[#D4AF37] text-[#4A0E17] font-bold shadow-md'
                                  : isCompleted
                                    ? 'bg-emerald-500 text-black'
                                    : 'border border-white/15 bg-white/5 text-white/40'
                              }`}
                            >
                              <span className="material-symbols-outlined text-lg !scale-x-100">
                                {isCompleted ? 'check' : step.icon}
                              </span>
                            </div>
                            <p
                              className={`text-xs font-semibold ${
                                isCurrent ? 'text-[#f3ce90]' : isCompleted ? 'text-emerald-300' : 'text-white/60'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-[#e9d9c3]/70 hidden sm:block">
                              {step.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Information */}
                <div className="grid gap-6 border-b border-white/10 p-6 sm:grid-cols-2 md:p-8">
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#d8b56a]">بيانات العميل والتوصيل</p>
                    <div className="space-y-2 text-sm text-[#f1dfbd]">
                      <div className="flex justify-between">
                        <span className="text-white/60">الاسم:</span>
                        <span className="font-semibold text-white">{order.customerName || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">رقم الهاتف:</span>
                        <span className="font-mono text-white" dir="ltr">{order.phone || 'غير متوفر'}</span>
                      </div>
                      {order.governorate && (
                        <div className="flex justify-between">
                          <span className="text-white/60">المحافظة:</span>
                          <span className="text-white">{order.governorate}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/60">العنوان:</span>
                        <span className="text-right text-white max-w-[200px] sm:max-w-none">{order.address || 'غير محدد'}</span>
                      </div>
                      {order.notes && (
                        <div className="mt-2 border-t border-white/10 pt-2 text-xs text-[#e9d9c3]">
                          <span className="text-white/60">ملاحظات: </span>
                          <span>{order.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#d8b56a]">بيانات الدفع والإجمالي</p>
                    <div className="space-y-2 text-sm text-[#f1dfbd]">
                      <div className="flex justify-between">
                        <span className="text-white/60">طريقة الدفع:</span>
                        <span className="text-white">{order.paymentMethod || (order as any).payment_method || 'الدفع عند الاستلام'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">حالة الدفع:</span>
                        <span className="text-white">
                          {getPaymentStatusDisplay(
                            order.paymentMethod || (order as any).payment_method,
                            order.paymentStatus || (order as any).payment_status
                          )}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-base font-bold text-white">المبلغ الإجمالي:</span>
                        <span className="text-xl font-extrabold text-[#D4AF37]">
                          {Number(order.total || 0).toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="p-6 md:p-8">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#d8b56a]">المنتجات المطلوبة</p>
                  {order.items && order.items.length > 0 ? (
                    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20">
                      {order.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center justify-between p-4 text-sm">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-0.5 text-xs text-[#e9d9c3]/70">المقاس: {item.size || 'M'}</p>
                          </div>
                          <div className="text-left font-mono">
                            <p className="text-white">
                              {item.quantity} × {Number(item.price || 0).toLocaleString()} ج.م
                            </p>
                            <p className="text-xs text-[#D4AF37]">
                              {(Number(item.quantity || 1) * Number(item.price || 0)).toLocaleString()} ج.م
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">لا توجد تفاصيل للمنتجات في هذا السجل.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default OrderTracking;

