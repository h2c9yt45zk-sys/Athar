import React, { useEffect, useState } from 'react';
import { EGYPTIAN_GOVERNORATES } from '../types';
import type { CustomerOrderPayload } from '../types';

export { EGYPTIAN_GOVERNORATES };

export type CheckoutFormValues = CustomerOrderPayload;

export interface CheckoutFormProps {
  itemCount: number;
  subtotal: number;
  onBack: () => void;
  onSubmit: (values: CheckoutFormValues) => void;
  isSubmitting: boolean;
  initialValues?: Partial<CheckoutFormValues>;
  errorMessage?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  itemCount,
  subtotal,
  onBack,
  onSubmit,
  isSubmitting,
  initialValues,
  errorMessage,
}) => {
  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    fullName: '',
    phone: '',
    governorate: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      fullName: initialValues?.fullName ?? prev.fullName,
      phone: initialValues?.phone ?? prev.phone,
      governorate: initialValues?.governorate ?? prev.governorate,
      address: initialValues?.address ?? prev.address,
      notes: initialValues?.notes ?? prev.notes,
    }));
  }, [initialValues]);

  const handleChange = (field: keyof CheckoutFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};
    if (!formValues.fullName.trim()) nextErrors.fullName = 'يرجى إدخال الاسم الكامل';
    if (!formValues.phone.trim()) {
      nextErrors.phone = 'يرجى إدخال رقم الهاتف';
    } else if (!/^[0-9]{11}$/.test(formValues.phone)) {
      nextErrors.phone = 'رقم الهاتف يجب أن يكون 11 رقماً صحيحاً';
    }
    if (!formValues.governorate.trim()) nextErrors.governorate = 'يرجى اختيار المحافظة';
    if (!formValues.address.trim()) nextErrors.address = 'يرجى إدخال العنوان بالتفصيل';
    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(formValues);
  };


  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[#1b0b12]/90 p-5 shadow-xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#d8b56a]">معلومات الطلب</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">أكمل بياناتك</h2>
          </div>
          <div className="rounded-2xl bg-[#2f1220] px-3 py-2 text-sm text-[#f4dfc9]">
            {itemCount} منتج • {subtotal.toLocaleString()} ج.م
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-right">
            <label className="block text-sm text-[#f2e0ce]">الاسم الكامل</label>
            <input
              type="text"
              value={formValues.fullName}
              onChange={(event) => handleChange('fullName', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#d8b56a]"
              placeholder="أدخل اسمك الكامل"
              autoComplete="name"
            />
            {errors.fullName && <p className="text-xs text-[#ffb3b3]">{errors.fullName}</p>}
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm text-[#f2e0ce]">رقم الهاتف</label>
            <input
              type="tel"
              value={formValues.phone}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              onChange={(event) => {
                const rawValue = event.target.value.replace(/[^0-9]/g, '');
                handleChange('phone', rawValue.slice(0, 11));
              }}
              className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#d8b56a]"
              placeholder="أدخل رقم الهاتف"
              autoComplete="tel"
            />
            {errors.phone && <p className="text-xs text-[#ffb3b3]">{errors.phone}</p>}
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm text-[#f2e0ce]">المحافظة</label>
            <select
              value={formValues.governorate}
              onChange={(event) => handleChange('governorate', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#d8b56a]"
            >
              <option value="">اختر المحافظة</option>
              {EGYPTIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
            {errors.governorate && <p className="text-xs text-[#ffb3b3]">{errors.governorate}</p>}
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm text-[#f2e0ce]">العنوان بالتفصيل</label>
            <textarea
              value={formValues.address}
              onChange={(event) => handleChange('address', event.target.value)}
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#d8b56a]"
              placeholder="المدينة، المحافظة، تفاصيل العنوان"
            />
            {errors.address && <p className="text-xs text-[#ffb3b3]">{errors.address}</p>}
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-sm text-[#f2e0ce]">ملاحظات إضافية (اختياري)</label>
            <textarea
              value={formValues.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#d8b56a]"
              placeholder="مثلاً: أوقات التسليم المفضلة أو ملاحظات خاصة"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm text-[#f2e0ce] transition hover:border-white/30 hover:text-white sm:w-auto"
            >
              العودة إلى السلة
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#4A0E17] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-[#5b1f28] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? 'جارٍ الإرسال...' : 'إتمام الطلب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
