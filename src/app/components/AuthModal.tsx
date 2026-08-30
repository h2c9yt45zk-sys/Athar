import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EGYPTIAN_GOVERNORATES } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, signUp } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form states
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up form states
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpGovernorate, setSignUpGovernorate] = useState('');
  const [signUpAddress, setSignUpAddress] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalMode);
      setErrorMessage('');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginPhone.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        phone: loginPhone,
        password: loginPassword,
      });
      // clear inputs
      setLoginPhone('');
      setLoginPassword('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signUpFullName.trim()) {
      setErrorMessage('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!signUpPhone.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف');
      return;
    }
    const cleanPhone = signUpPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 11) {
      setErrorMessage('رقم الهاتف يجب أن يكون 11 رقماً (مثال: 01012345678)');
      return;
    }
    if (!signUpGovernorate) {
      setErrorMessage('يرجى اختيار المحافظة');
      return;
    }
    if (!signUpAddress.trim()) {
      setErrorMessage('يرجى إدخال العنوان بالتفصيل');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        fullName: signUpFullName,
        phone: signUpPhone,
        governorate: signUpGovernorate,
        address: signUpAddress,
        password: signUpPassword,
      });
      // clear inputs
      setSignUpFullName('');
      setSignUpPhone('');
      setSignUpGovernorate('');
      setSignUpAddress('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div
        dir="rtl"
        className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#D4AF37]/30 bg-[#1b0910] text-right shadow-[0_32px_120px_rgba(0,0,0,0.85)] z-10 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#270913] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="font-arabic-serif text-3xl text-[#D4AF37]">أثر</span>
            <span className="text-xs uppercase tracking-widest text-[#f3e1c3]/70 font-semibold">بوابة الحساب</span>
          </div>
          <button
            onClick={closeAuthModal}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined !scale-x-100">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#220710]">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-3.5 text-center text-sm font-bold transition-all relative ${
              tab === 'login'
                ? 'text-[#D4AF37] bg-white/[0.04]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            تسجيل الدخول
            {tab === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-3.5 text-center text-sm font-bold transition-all relative ${
              tab === 'register'
                ? 'text-[#D4AF37] bg-white/[0.04]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            إنشاء حساب جديد
            {tab === 'register' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="rounded-2xl border border-red-500/40 bg-red-950/60 p-3.5 text-xs font-semibold text-red-200 shadow-sm animate-shake">
              {errorMessage}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#f2e0ce]">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="مثال: 01012345678"
                    value={loginPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setLoginPhone(val.slice(0, 11));
                    }}
                    maxLength={11}
                    className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    autoComplete="tel"
                    required
                  />
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-white/40 pointer-events-none !scale-x-100 text-lg">
                    phone_iphone
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#f2e0ce]">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 pl-11 text-right text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute left-3 top-3 text-white/50 hover:text-[#D4AF37] transition-colors"
                  >
                    <span className="material-symbols-outlined !scale-x-100 text-lg">
                      {showLoginPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-full bg-[#4A0E17] hover:bg-[#5b1f28] border border-[#D4AF37]/40 py-3.5 text-sm font-bold text-white transition-all shadow-lg hover:shadow-[#4A0E17]/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-[#f2e0ce]/70">
                  ليس لديك حساب بعد؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setErrorMessage('');
                    }}
                    className="font-bold text-[#D4AF37] underline hover:text-[#f3e1c3]"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#f2e0ce]">
                  الاسم الكامل <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#f2e0ce]">
                  رقم الهاتف (11 رقماً) <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="مثال: 01012345678"
                    value={signUpPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setSignUpPhone(val.slice(0, 11));
                    }}
                    maxLength={11}
                    className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    autoComplete="tel"
                    required
                  />
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-white/40 pointer-events-none !scale-x-100 text-lg">
                    phone_iphone
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#f2e0ce]">
                  المحافظة <span className="text-[#D4AF37]">*</span>
                </label>
                <select
                  value={signUpGovernorate}
                  onChange={(e) => setSignUpGovernorate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  required
                >
                  <option value="">اختر المحافظة</option>
                  {EGYPTIAN_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#f2e0ce]">
                  العنوان بالتفصيل <span className="text-[#D4AF37]">*</span>
                </label>
                <textarea
                  placeholder="المدينة، الحي، اسم الشارع، رقم العقار والشقة"
                  value={signUpAddress}
                  onChange={(e) => setSignUpAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-2.5 text-right text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#f2e0ce]">
                    كلمة المرور <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="6 أحرف على الأقل"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#f2e0ce]">
                    تأكيد كلمة المرور <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="أعد كتابة كلمة المرور"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showSignUpPassword}
                    onChange={(e) => setShowSignUpPassword(e.target.checked)}
                    className="rounded border-white/20 bg-[#13070e] text-[#D4AF37] focus:ring-0"
                  />
                  <span>إظهار كلمات المرور</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-full bg-[#4A0E17] hover:bg-[#5b1f28] border border-[#D4AF37]/40 py-3.5 text-sm font-bold text-white transition-all shadow-lg hover:shadow-[#4A0E17]/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب جديد'}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-[#f2e0ce]/70">
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setErrorMessage('');
                    }}
                    className="font-bold text-[#D4AF37] underline hover:text-[#f3e1c3]"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
