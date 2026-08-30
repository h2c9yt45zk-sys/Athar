import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EGYPTIAN_GOVERNORATES } from '../types';

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, closeProfileModal, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user && isProfileModalOpen) {
      setFullName(user.fullName || '');
      setGovernorate(user.governorate || '');
      setAddress(user.address || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsEditingPassword(false);
      setStatusMessage(null);
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال الاسم الكامل' });
      return;
    }
    if (!governorate) {
      setStatusMessage({ type: 'error', text: 'يرجى اختيار المحافظة' });
      return;
    }
    if (!address.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال العنوان' });
      return;
    }

    if (isEditingPassword) {
      if (!currentPassword) {
        setStatusMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية' });
        return;
      }
      if (newPassword.length < 6) {
        setStatusMessage({ type: 'error', text: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف' });
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setStatusMessage({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        fullName,
        governorate,
        address,
        ...(isEditingPassword
          ? {
              currentPassword,
              newPassword,
            }
          : {}),
      });

      setStatusMessage({ type: 'success', text: 'تم تحديث بيانات الحساب بنجاح!' });
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'تعذر تحديث البيانات' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOrders = () => {
    closeProfileModal();
    navigate(`/tracking?phone=${encodeURIComponent(user.phone)}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeProfileModal}
      />

      {/* Modal Content */}
      <div
        dir="rtl"
        className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#D4AF37]/30 bg-[#1b0910] text-right shadow-[0_32px_120px_rgba(0,0,0,0.85)] z-10 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#270913] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A0E17] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-lg">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'أ'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">{user.fullName}</h3>
              <p className="text-xs text-[#D4AF37] mt-1 font-mono">{user.phone}</p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined !scale-x-100">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {statusMessage && (
            <div
              className={`rounded-2xl border p-3.5 text-xs font-semibold shadow-sm ${
                statusMessage.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
                  : 'border-red-500/40 bg-red-950/60 text-red-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Quick Orders Button */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#270913]/60 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#D4AF37] !scale-x-100">local_shipping</span>
              <div>
                <p className="text-xs font-bold text-white">تتبع طلباتي</p>
                <p className="text-[11px] text-[#f2e0ce]/60">عرض جميع الطلبات المرتبطة برقمك</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleViewOrders}
              className="rounded-full bg-[#4A0E17] hover:bg-[#5b1f28] border border-[#D4AF37]/30 px-3.5 py-1.5 text-xs font-semibold text-[#f3e1c3] transition-colors"
            >
              عرض
            </button>
          </div>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#f2e0ce]">الاسم الكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#D4AF37]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#f2e0ce]">رقم الهاتف</label>
              <input
                type="text"
                value={user.phone}
                disabled
                className="w-full rounded-2xl border border-white/5 bg-[#13070e]/50 px-4 py-3 text-right text-sm text-white/50 cursor-not-allowed"
              />
              <span className="text-[10px] text-white/40 block">رقم الهاتف هو المعرف الرئيسي لحسابك ولا يمكن تغييره مباشرة</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#f2e0ce]">المحافظة الافتراضية</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-3 text-right text-sm text-white outline-none transition focus:border-[#D4AF37]"
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
              <label className="block text-xs font-semibold text-[#f2e0ce]">عنوان الشحن الافتراضي</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full rounded-2xl border border-white/10 bg-[#13070e] px-4 py-2.5 text-right text-sm text-white outline-none transition focus:border-[#D4AF37]"
              />
            </div>

            {/* Password Change Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsEditingPassword(!isEditingPassword)}
                className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1.5 font-bold"
              >
                <span className="material-symbols-outlined !scale-x-100 text-sm">lock_reset</span>
                {isEditingPassword ? 'إلغاء تغيير كلمة المرور' : 'تغيير كلمة المرور'}
              </button>
            </div>

            {isEditingPassword && (
              <div className="p-4 rounded-2xl bg-[#220710] border border-white/10 space-y-3 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="block text-xs text-[#f2e0ce]">كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    className="w-full rounded-xl border border-white/10 bg-[#13070e] px-3.5 py-2.5 text-right text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-[#f2e0ce]">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    className="w-full rounded-xl border border-white/10 bg-[#13070e] px-3.5 py-2.5 text-right text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-[#f2e0ce]">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full rounded-xl border border-white/10 bg-[#13070e] px-3.5 py-2.5 text-right text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 rounded-full bg-[#4A0E17] hover:bg-[#5b1f28] border border-[#D4AF37]/40 py-3 text-sm font-bold text-white transition-all shadow-md disabled:opacity-60"
              >
                {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full sm:w-auto px-5 py-3 rounded-full border border-red-500/30 text-red-300 hover:bg-red-950/40 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined !scale-x-100 text-base">logout</span>
                تسجيل الخروج
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
