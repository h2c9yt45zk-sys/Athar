import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OrderService } from '../services/orderService';
import { normalizeOrderStatus, type Order, type OrderStatus } from '../types';

const ORDER_STEPS: Array<{ key: OrderStatus; label: string; description: string; icon: string }> = [
  {
    key: 'جاري التأكيد',
    label: 'جاري التأكيد',
    description: 'تم استلام طلبك بنجاح، وجاري مراجعته وتأكيده.',
    icon: 'verified_user',
  },
  {
    key: 'تم التأكيد',
    label: 'تم التأكيد',
    description: 'تم تأكيد طلبك وجاري إرساله لقسم التجهيز.',
    icon: 'check_circle',
  },
  {
    key: 'قيد التجهيز',
    label: 'قيد التجهيز',
    description: 'يتم الآن تجهيز وتغليف طلبك بعناية تامة.',
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
    description: 'تم تسليم الطلب بنجاح. شكراً لتسوقك من أثر.',
    icon: 'task_alt',
  },
];

const STEP_INDEX_MAP: Record<OrderStatus, number> = {
  'جاري التأكيد': 0,
  'تم التأكيد': 1,
  'قيد التجهيز': 2,
  'تم الشحن': 3,
  'تم التوصيل': 4,
  'قيد الانتظار': 0,
};

const statusBadgeStyles: Record<OrderStatus, string> = {
  'جاري التأكيد': 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  'تم التأكيد': 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  'قيد التجهيز': 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  'تم الشحن': 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  'تم التوصيل': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  'قيد الانتظار': 'bg-amber-500/15 text-amber-300 border-amber-400/30',
};

// Mask phone: display 010****5678
const maskPhone = (phone?: string): string => {
  if (!phone) return '***';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 8) return '****';
  return `${clean.slice(0, 3)}****${clean.slice(-4)}`;
};

// Mask sensitive address: display governorate + protected note
const maskAddress = (governorate?: string): string => {
  if (governorate) {
    return `محافظة ${governorate} (العنوان التفصيلي مشفّر للخصوصية)`;
  }
  return 'العنوان مشفّر للخصوصية والأمان';
};

// No status filters: tracking shows all user orders sorted by recency

export const OrderTracking: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  // removed status filter state: always show all orders sorted by recency
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUserOrders = useCallback(async () => {
    if (!user?.phone && !user?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const matches = await OrderService.fetchUserOrders(user.phone || '', user.id);

      // Deduplicate orders by id
      const orderMap = new Map<string, Order>();
      for (const o of matches) {
        const keyId = o.id || o.orderCode || `${o.createdAt}:${o.status}`;
        if (!orderMap.has(keyId)) {
          const seen = new Set<string>();
          const items = Array.isArray(o.items)
            ? o.items.filter((it) => {
                const k = `${it.name}||${it.size}||${it.price}`;
                if (seen.has(k)) return false;
                seen.add(k);
                return true;
              })
            : [];
          orderMap.set(keyId, { ...o, items });
        }
      }

      const uniqueOrders = Array.from(orderMap.values());
      uniqueOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(uniqueOrders);
    } catch (lookupError: any) {
      console.error('Order lookup failed:', lookupError);
      setError(lookupError?.message || 'تعذر استرجاع الطلبات في الوقت الحالي.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.phone]);

  // Automatically load all orders for the authenticated user on mount / user change
  useEffect(() => {
    if (isAuthenticated && user?.phone) {
      loadUserOrders();
    } else {
      setOrders([]);
      setError('');
    }
  }, [isAuthenticated, user?.phone, loadUserOrders]);

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

  // Always sort by createdAt descending (newest first)
  const filteredOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <main className="min-h-screen bg-[#4A0E17] px-4 py-20 text-[#F7E7CC] md:px-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[#d8b56a]">
            لوحة متابعة الطلبات • أثر
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">طلباتي ومتابعة الشحنات</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#e9d9c3]">
            متابعة حالة جميع طلباتك وشحناتك تلقائياً وبأعلى معايير الخصوصية.
          </p>
        </div>

        {/* Not Authenticated Guard */}
        {!isAuthenticated ? (
          <div className="mt-10 rounded-[28px] border border-[#d8b56a]/30 bg-[#1b0a12]/95 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#270913] text-[#D4AF37] shadow-inner mb-5">
              <span className="material-symbols-outlined text-4xl !scale-x-100">lock</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">تتبع الطلبات يتطلب تسجيل الدخول</h2>
            <p className="mx-auto max-w-md text-sm leading-6 text-[#e9d9c3]/80 mb-6">
              لحماية خصوصية مشترياتك، يتم ربط الطلبات بحسابك الشخصي تلقائياً. يرجى تسجيل الدخول لعرض وتتبع جميع طلباتك.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full sm:flex-1 rounded-full bg-[#D4AF37] hover:bg-[#c49e2f] px-6 py-3.5 text-sm font-bold text-[#4A0E17] transition shadow-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined !scale-x-100 text-lg">login</span>
                تسجيل الدخول لحسابك
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* User Account Info Card & Filter Tabs */}
            <div className="mt-8 rounded-[28px] border border-[#d8b56a]/30 bg-[#1b0a12]/90 p-5 md:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#4A0E17] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-base shadow-sm">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'أ'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{user?.fullName}</h3>
                    <p className="text-xs text-[#D4AF37] font-mono mt-0.5">
                      {maskPhone(user?.phone)} • {orders.length} {orders.length === 1 ? 'طلب' : 'طلبات'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadUserOrders}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-[#f3e1c3] hover:bg-white/10 hover:border-[#D4AF37]/40 transition-colors self-start sm:self-auto disabled:opacity-50"
                  title="تحديث قائمة الطلبات"
                >
                  <span className={`material-symbols-outlined text-sm !scale-x-100 ${isLoading ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  <span>{isLoading ? 'جارٍ التحديث...' : 'تحديث الطلبات'}</span>
                </button>
              </div>

              {/* No status filters — showing all orders by recency */}
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
                <span className="material-symbols-outlined text-red-400 !scale-x-100">error</span>
                <p className="flex-1 leading-6">{error}</p>
              </div>
            )}

            {/* Orders List */}
            <div className="mt-8 space-y-6">
              {isLoading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-black/20 p-12 text-center text-[#e9d9c3]">
                  <span className="h-8 w-8 animate-spin rounded-full border-3 border-[#D4AF37] border-t-transparent mb-4" />
                  <p className="text-sm font-semibold">جارٍ استرجاع طلباتك...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-black/20 p-12 text-center text-[#e9d9c3]">
                  <span className="material-symbols-outlined text-6xl text-white/30 mb-4 !scale-x-100">
                    shopping_bag
                  </span>
                  <h3 className="text-lg font-bold text-white">لا توجد لديك طلبات حالياً</h3>
                  <p className="mt-2 max-w-sm text-xs leading-6 text-[#e9d9c3]/70 mb-6">
                    ابدأ باكتشاف تشكيلاتنا الراقية من أثر وقم بالطلب لتظهر هنا تلقائياً.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] hover:bg-[#c49e2f] px-6 py-3 text-xs font-bold text-[#4A0E17] transition shadow-md"
                  >
                    <span>استكشف المنتجات</span>
                    <span className="material-symbols-outlined text-sm !scale-x-100">arrow_back</span>
                  </Link>
                </div>
              ) : (
                filteredOrders.map((order, orderIndex) => {
                  const normalizedStatus = normalizeOrderStatus(order.status);
                  const currentStepIdx = STEP_INDEX_MAP[normalizedStatus] ?? 0;

                  return (
                    <article
                      key={order.id || order.orderCode || orderIndex}
                      className="overflow-hidden rounded-[28px] border border-[#d8b56a]/30 bg-[#1b0a12]/95 shadow-[0_30px_90px_rgba(0,0,0,0.5)] transition-all hover:border-[#d8b56a]/50"
                    >
                      {/* Order Header: Order Reference + Date + Status */}
                      <div className="border-b border-white/10 bg-[#250d19] p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                      <p className="mt-1 text-xs text-white/70">
                                        تاريخ الطلب: <span className="text-white font-medium">{formatDate(order.createdAt)}</span>
                                      </p>
                                    </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold self-start sm:self-auto ${
                              statusBadgeStyles[normalizedStatus] ?? statusBadgeStyles['جاري التأكيد']
                            }`}
                          >
                            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                            {normalizedStatus}
                          </span>
                        </div>

                        {/* Masked destination info */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-[#e9d9c3]/80">
                          <span className="material-symbols-outlined text-[#D4AF37] text-sm !scale-x-100">location_on</span>
                          <span>{maskAddress(order.governorate)}</span>
                        </div>
                      </div>

                      {/* Visual Stepper */}
                      <div className="border-b border-white/10 bg-black/20 p-5 md:p-8">
                        <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-[#d8b56a]">
                          مراحل شحنتك
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {ORDER_STEPS.map((step, idx) => {
                            const isCompleted = idx < currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            return (
                              <div
                                key={step.key}
                                className={`flex flex-col items-center rounded-2xl border p-3.5 text-center transition-all ${
                                  isCurrent
                                    ? 'border-[#d8b56a] bg-[#d8b56a]/15 text-[#f3ce90] shadow-lg shadow-[#d8b56a]/10'
                                    : isCompleted
                                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                                      : 'border-white/5 bg-white/[0.02] text-white/40'
                                }`}
                              >
                                <div
                                  className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                                    isCurrent
                                      ? 'bg-[#D4AF37] text-[#4A0E17] font-bold shadow-md'
                                      : isCompleted
                                        ? 'bg-emerald-500 text-black font-bold'
                                        : 'border border-white/15 bg-white/5 text-white/40'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-base !scale-x-100">
                                    {isCompleted ? 'check' : step.icon}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs font-bold ${
                                    isCurrent ? 'text-[#f3ce90]' : isCompleted ? 'text-emerald-300' : 'text-white/60'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="mt-1 text-[10px] leading-3.5 text-[#e9d9c3]/70 hidden sm:block">
                                  {step.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items and Financial Summary */}
                      <div className="p-5 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#d8b56a]">المنتجات المطلوبة</p>
                          <p className="text-xs font-bold text-white">
                            إجمالي الطلب:{' '}
                            <span className="text-[#D4AF37] font-mono text-sm font-extrabold">
                              {Number(order.total || 0).toLocaleString()} ج.م
                            </span>
                          </p>
                        </div>

                        {order.items && order.items.length > 0 ? (
                          <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                            {order.items.map((item, itemIdx) => {
                              const itemKey = `${item.productId || item.name}-${item.size || 'M'}-${item.price || 0}-${itemIdx}`;
                              return (
                                <div key={itemKey} className="flex items-center justify-between p-3.5 text-xs md:text-sm">
                                  <div>
                                    <p className="font-bold text-white">{item.name}</p>
                                    <p className="mt-0.5 text-[11px] text-[#e9d9c3]/70">المقاس: {item.size || 'M'}</p>
                                  </div>
                                  <div className="text-left font-mono">
                                    <p className="text-white">
                                      {item.quantity} × {Number(item.price || 0).toLocaleString()} ج.م
                                    </p>
                                    <p className="text-xs font-bold text-[#D4AF37]">
                                      {(Number(item.quantity || 1) * Number(item.price || 0)).toLocaleString()} ج.م
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-white/50">تم تسجيل تفاصيل الطلب بنجاح.</p>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default OrderTracking;
