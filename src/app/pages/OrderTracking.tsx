import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OrderService } from "../services/orderService";
import type { Order, OrderStatus } from "../types";

const ORDER_STEPS: Array<{ key: OrderStatus; label: string; description: string; icon: string }> = [
  {
    key: "قيد الانتظار",
    label: "تم استلام الطلب",
    description: "تم تسجيل طلبك بنجاح وفي انتظار المراجعة والتأكيد.",
    icon: "receipt_long",
  },
  {
    key: "قيد التجهيز",
    label: "جاري التجهيز",
    description: "يتم الآن تجهيز وتطريز طلبك بعناية تامة.",
    icon: "inventory_2",
  },
  {
    key: "تم الشحن",
    label: "تم الشحن",
    description: "تم تسليم الشحنة لشركة الشحن وهي في طريقها إليك.",
    icon: "local_shipping",
  },
  {
    key: "تم التوصيل",
    label: "تم التوصيل",
    description: "تم تسليم طلبك بنجاح. نرجو أن تنال منتجاتنا إعجابكم.",
    icon: "task_alt",
  },
];

const STEP_INDEX_MAP: Record<OrderStatus, number> = {
  "قيد الانتظار": 0,
  "قيد التجهيز": 1,
  "تم الشحن": 2,
  "تم التوصيل": 3,
};

const statusBadgeStyles: Record<OrderStatus, string> = {
  "قيد الانتظار": "bg-amber-500/15 text-amber-300 border-amber-400/30",
  "قيد التجهيز": "bg-sky-500/15 text-sky-300 border-sky-400/30",
  "تم الشحن": "bg-violet-500/15 text-violet-300 border-violet-400/30",
  "تم التوصيل": "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
};

export const OrderTracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const executeSearch = useCallback(async (query: string) => {
    const value = query.trim();
    if (!value) {
      setError("يرجى إدخال رقم الهاتف للبحث عن طلبك.");
      setOrders([]);
      setSearched(true);
      return;
    }

    setIsLoading(true);
    setError("");
    setSearched(true);

    try {
        const matches = await OrderService.fetchOrdersByPhoneOrCode(value);
        // Remove personal/sensitive fields before storing results
        const sanitized = matches.map((o) => ({
          ...o,
          customerName: "",
          phone: "",
          address: "",
        } as Order));

        // Deduplicate orders by id / orderCode / fallback key and also dedupe items per order
        const orderMap = new Map<string, Order>();
        for (const o of sanitized) {
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
          } else {
            // merge items into existing order entry, deduping by composite key
            const existing = orderMap.get(keyId)!;
            const merged = Array.isArray(existing.items) ? [...existing.items] : [];
            if (Array.isArray(o.items)) merged.push(...o.items);

            const seen = new Set<string>();
            const deduped = merged.filter((it) => {
              const k = `${it.name}||${it.size}||${it.price}`;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });

            // prefer the most complete data (keep existing fields, but update items and status/date if newer)
            const updated = {
              ...existing,
              items: deduped,
              // if incoming createdAt is newer, prefer its timestamps and status
              ...(new Date(o.createdAt).getTime() > new Date(existing.createdAt).getTime()
                ? { createdAt: o.createdAt, status: o.status }
                : {}),
            } as Order;

            orderMap.set(keyId, updated);
          }
        }

        const uniqueSanitized = Array.from(orderMap.values());
        // sort by createdAt desc (newest first)
        uniqueSanitized.sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          return tb - ta;
        });
        setOrders(uniqueSanitized);

      if (matches.length === 0) {
        setError("لم نتمكن من العثور على أي طلبات مرتبطة بهذا الرقم. يرجى التأكد من رقم الهاتف.");
      }
    } catch (lookupError: any) {
      console.error("Order lookup failed:", lookupError);
      setError(lookupError?.message || "تعذر البحث عن الطلبات في الوقت الحالي.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setSearchValue(phoneParam);
      executeSearch(phoneParam);
    }
  }, [searchParams, executeSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      setSearchParams({ phone: searchValue.trim() });
    }
    executeSearch(searchValue);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "غير متوفر";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <main className="min-h-screen bg-[#4A0E17] px-4 py-20 text-[#F7E7CC] md:px-8" dir="rtl">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[#d8b56a]">
            Order Tracking System
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">تتبع حالة طلبك</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#e9d9c3]">
            أدخل رقم هاتفك المسجّل في الطلب لمتابعة حالة شحنتك مباشرةً.
          </p>
        </div>

        {/* Search Box */}
        <div className="mt-8 rounded-[28px] border border-[#d8b56a]/30 bg-[#1b0a12]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="tel"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="أدخل رقم هاتفك (01xxxxxxxxx)"
                className="w-full rounded-2xl border border-white/15 bg-[#12050b] px-4 py-3.5 text-right text-sm text-white placeholder-white/40 outline-none transition focus:border-[#d8b56a]"
                dir="ltr"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
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
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
            <span className="material-symbols-outlined text-red-400">error</span>
            <p className="flex-1 leading-6">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="mt-8 space-y-8">
          {!searched && !orders.length && !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-black/20 p-12 text-center text-[#e9d9c3]">
              <span className="material-symbols-outlined text-6xl text-white/40">local_shipping</span>
              <h3 className="mt-4 text-lg font-semibold text-white">ابحث عن طلبك</h3>
              <p className="mt-1 max-w-sm text-xs leading-6 text-[#e9d9c3]/70">
                أدخل رقم هاتفك المسجّل أثناء إتمام الطلب لمعرفة حالة شحنتك.
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
                {/* Order Header: date + status only — no personal info */}
                <div className="border-b border-white/10 bg-[#250d19] p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#d8b56a]">تاريخ الطلب</p>
                      <p className="mt-1 text-sm font-semibold text-white">{formatDate(order.createdAt)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                        statusBadgeStyles[order.status] ?? statusBadgeStyles["قيد الانتظار"]
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {order.status || "قيد الانتظار"}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="border-b border-white/10 bg-black/20 p-6 md:p-8">
                  <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-[#d8b56a]">
                    مراحل متابعة الشحنة
                  </h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {ORDER_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div
                          key={step.key}
                          className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                            isCurrent
                              ? "border-[#d8b56a] bg-[#d8b56a]/15 text-[#f3ce90] shadow-lg shadow-[#d8b56a]/10"
                              : isCompleted
                                ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                                : "border-white/5 bg-white/[0.02] text-white/40"
                          }`}
                        >
                          <div
                            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full text-base transition-colors ${
                              isCurrent
                                ? "bg-[#D4AF37] text-[#4A0E17] font-bold shadow-md"
                                : isCompleted
                                  ? "bg-emerald-500 text-black"
                                  : "border border-white/15 bg-white/5 text-white/40"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg !scale-x-100">
                              {isCompleted ? "check" : step.icon}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-semibold ${
                              isCurrent ? "text-[#f3ce90]" : isCompleted ? "text-emerald-300" : "text-white/60"
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

                {/* Order Items */}
                <div className="p-6 md:p-8">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#d8b56a]">محتويات الطلب</p>
                  {order.items && order.items.length > 0 ? (
                    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20">
                      {order.items.map((item, itemIdx) => {
                        const itemKey = `${item.productId || item.name}-${item.size || 'M'}-${item.price || 0}-${itemIdx}`;
                        return (
                          <div key={itemKey} className="flex items-center justify-between p-4 text-sm">
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
                        );
                      })}
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
