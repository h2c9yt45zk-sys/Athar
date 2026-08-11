import React, { useState } from 'react';

type CheckoutFormValues = {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: 'الدفع عند الاستلام' | 'دفع إلكتروني';
  electronicMethod?: 'إنستا باي' | 'فودافون كاش';
  screenshotUrl?: string;
};

interface CheckoutFormProps {
  itemCount: number;
  subtotal: number;
  onBack: () => void;
  onSubmit: (values: CheckoutFormValues) => void;
  isSubmitting: boolean;
}

const transferDetails: Record<'إنستا باي' | 'فودافون كاش', string> = {
  'إنستا باي': 'رقم الحساب / الإيميل: athar.store@instapay.com',
  'فودافون كاش': 'رقم الهاتف: 966555123456+',
};

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ itemCount, subtotal, onBack, onSubmit, isSubmitting }) => {
  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'الدفع عند الاستلام',
    electronicMethod: undefined,
    screenshotUrl: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});

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
    if (!formValues.address.trim()) nextErrors.address = 'يرجى إدخال العنوان بالتفصيل';
    if (formValues.paymentMethod === 'دفع إلكتروني' && !formValues.electronicMethod) {
      nextErrors.electronicMethod = 'يرجى اختيار طريقة الدفع الإلكترونية';
    }
    if (formValues.paymentMethod === 'دفع إلكتروني' && !(formValues.screenshotUrl ?? '').trim()) {
      nextErrors.screenshotUrl = 'يرجى رفع لقطة شاشة لإيصال التحويل';
    }
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

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setFormValues((prev) => ({ ...prev, screenshotUrl: dataUrl }));
      setErrors((prev) => ({ ...prev, screenshotUrl: undefined }));
    };
    reader.readAsDataURL(file);
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

          <div className="space-y-3 rounded-[24px] border border-white/10 bg-[#13070e] p-4 text-right">
            <p className="text-sm text-[#f2e0ce]">طريقة الدفع</p>
            <div className="grid gap-3 md:grid-cols-2">
              {(['الدفع عند الاستلام', 'دفع إلكتروني'] as const).map((method) => (
                <label key={method} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={formValues.paymentMethod === method}
                    onChange={() => {
                      setFormValues((prev) => ({
                        ...prev,
                        paymentMethod: method,
                        electronicMethod: method === 'دفع إلكتروني' ? prev.electronicMethod : undefined,
                        screenshotUrl: method === 'دفع إلكتروني' ? prev.screenshotUrl : '',
                      }));
                      setErrors((prev) => ({ ...prev, electronicMethod: undefined, screenshotUrl: undefined }));
                    }}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>

            {formValues.paymentMethod === 'دفع إلكتروني' && (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {(['إنستا باي', 'فودافون كاش'] as const).map((method) => (
                    <label key={method} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white">
                      <input
                        type="radio"
                        name="electronicMethod"
                        checked={formValues.electronicMethod === method}
                        onChange={() => {
                          setFormValues((prev) => ({ ...prev, electronicMethod: method }));
                          setErrors((prev) => ({ ...prev, electronicMethod: undefined }));
                        }}
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>

                {formValues.electronicMethod && (
                  <div className="rounded-2xl border border-[#d8b56a]/30 bg-[#15050c]/80 px-4 py-3 text-sm text-[#f1dfbd]">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b56a]">تفاصيل الحساب</p>
                    <p className="mt-2">{transferDetails[formValues.electronicMethod]}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm text-[#f2e0ce]">يرجى رفع لقطة شاشة (Screenshot) لإيصال التحويل لإتمام الطلب</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="w-full rounded-2xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm text-[#f2e0ce]"
                  />
                  {errors.screenshotUrl && <p className="text-xs text-[#ffb3b3]">{errors.screenshotUrl}</p>}
                  {formValues.screenshotUrl && (
                    <img src={formValues.screenshotUrl} alt="إيصال الدفع" className="mt-2 h-48 w-full rounded-2xl object-cover" />
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm text-[#f2e0ce] transition hover:border-[#d8b56a] hover:text-white sm:w-auto"
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
