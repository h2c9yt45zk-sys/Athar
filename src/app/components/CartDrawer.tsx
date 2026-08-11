import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { CheckoutForm } from './CheckoutForm';

type CustomerFormValues = {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: 'الدفع عند الاستلام' | 'دفع إلكتروني';
  electronicMethod?: 'إنستا باي' | 'فودافون كاش';
  screenshotUrl?: string;
};

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    toggleCart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    addOrder,
  } = useCart();
  const [stage, setStage] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<string>('الدفع عند الاستلام');
  const [paymentStatus, setPaymentStatus] = useState<string>('جاري الفحص');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen && !isCodeModalOpen) {
        toggleCart(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, isCodeModalOpen, toggleCart]);

  useEffect(() => {
    if (!isCartOpen) {
      setStage('cart');
      setOrderId(null);
      setOrderCode(null);
      setPaymentSummary('الدفع عند الاستلام');
      setPaymentStatus('جاري الفحص');
      setScreenshotPreview(null);
      setIsSubmitting(false);
      setIsCodeModalOpen(false);
      setCopyMessage('');
    }
  }, [isCartOpen]);

  const handleStartCheckout = () => {
    setStage('checkout');
  };

  const handleSubmitOrder = (customer: CustomerFormValues) => {
    setIsSubmitting(true);

    try {
      const newOrder = addOrder(customer, cart, cartSubtotal);
      setOrderId(newOrder.id);
      setOrderCode(newOrder.orderCode);
      setPaymentSummary(
        newOrder.paymentMethod === 'دفع إلكتروني' && newOrder.electronicMethod
          ? `${newOrder.paymentMethod} - ${newOrder.electronicMethod}`
          : newOrder.paymentMethod
      );
      setPaymentStatus(newOrder.paymentStatus);
      setScreenshotPreview(newOrder.screenshotUrl ?? null);
      setStage('success');
      setCopyMessage('');
      setIsCodeModalOpen(true);
    } catch (error) {
      console.error('Failed to submit order:', error);
      setStage('checkout');
      setIsCodeModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnHome = () => {
    toggleCart(false);
    navigate('/');
  };

  const handleBackToCart = () => {
    setStage('cart');
  };

  const handleCopyCode = async () => {
    if (!orderCode) return;

    try {
      await navigator.clipboard.writeText(orderCode);
      sessionStorage.setItem('athar_last_order_code', orderCode);
      setCopyMessage('تم نسخ الكود بنجاح');
      setIsCodeModalOpen(false);
    } catch {
      setCopyMessage('تعذر نسخ الكود، حاول مرة أخرى');
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-500 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          if (!isCodeModalOpen) {
            toggleCart(false);
          }
        }}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-[80%] md:w-[34%] bg-[#1b0910] z-[70] transition-transform duration-500 ease-out shadow-[0_32px_120px_rgba(0,0,0,0.55)] flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {isCodeModalOpen && orderCode && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
            <div className="w-full max-w-md rounded-[28px] border border-[#d8b56a]/30 bg-[#18070d] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#d8b56a]">Order Code</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">#{orderCode}</h3>
              <p className="mt-3 text-sm leading-7 text-[#f1dfbd]">يرجى نسخ الكود قبل المتابعة. لا يمكنك إغلاق هذه النافذة إلا بعد النسخ.</p>
              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-5 w-full rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-[#4A0E17] transition hover:bg-[#c39f2f]"
              >
                نسخ الكود
              </button>
              {copyMessage && <p className="mt-3 text-sm text-[#f1dfbd]">{copyMessage}</p>}
            </div>
          </div>
        )}

        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#270913]">
          <h2 className="font-headline-md text-[#f3e1c3]">
            {stage === 'checkout' ? 'إتمام الطلب' : stage === 'success' ? 'تم تأكيد الطلب' : 'حقيبة التسوق'}
          </h2>
          <button
            className="text-[#f3e1c3] hover:text-[#d8b56a] transition-colors"
            onClick={() => {
              if (!isCodeModalOpen) {
                toggleCart(false);
              }
            }}
            aria-label="Close Cart"
          >
            <span className="material-symbols-outlined !scale-x-100">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {stage === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#d8c9b6] gap-4">
                  <span className="material-symbols-outlined text-5xl">shopping_bag</span>
                  <p className="font-body-md">حقيبتك فارغة حالياً</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center border-b border-white/10 pb-4">
                    <img src={item.image} alt={item.name} className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-xl" />
                    <div className="flex-1 text-right">
                      <h4 className="font-headline-md !text-sm md:!text-base mb-1 text-white">{item.name}</h4>
                      <p className="font-body-md !text-xs md:!text-sm text-[#d8b56a] font-bold mb-2">
                        {item.price.toLocaleString()} ج.م
                      </p>
                      {item.quantity && (
                        <div className="flex items-center gap-3 justify-start">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs text-white hover:bg-[#4a0e17] hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs text-white hover:bg-[#4a0e17] hover:text-white transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#d8c9b6] hover:text-[#ff9c9c] transition-colors"
                      title="حذف"
                    >
                      <span className="material-symbols-outlined text-sm !scale-x-100">delete</span>
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {stage === 'checkout' && (
            <CheckoutForm
              itemCount={cart.length}
              subtotal={cartSubtotal}
              onBack={handleBackToCart}
              onSubmit={handleSubmitOrder}
              isSubmitting={isSubmitting}
            />
          )}

          {stage === 'success' && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 rounded-[28px] border border-white/10 bg-[#220912]/90 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
              <span className="material-symbols-outlined text-7xl text-[#d8b56a]">check_circle</span>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">تم استلام طلبك بنجاح</h3>
                <p className="text-sm leading-7 text-[#e7dcc8]">
                  تم حفظ بيانات الطلب وسيتم التواصل معك قريباً. شكراً لاختيارك Athar.
                </p>
              </div>
              {orderCode && (
                <div className="rounded-2xl border border-[#d8b56a]/30 bg-[#15050c]/80 px-5 py-4 text-sm text-[#f1dfbd]">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b56a]">رمز الطلب</p>
                  <p className="mt-2 text-lg font-semibold text-white">{orderCode}</p>
                  <p className="mt-1 text-xs text-[#d8c9b6]">الحالة الحالية: قيد الانتظار</p>
                </div>
              )}
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#f1dfbd]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b56a]">طريقة الدفع</p>
                <p className="mt-2 text-white">{paymentSummary}</p>
                <p className="mt-2 text-xs text-[#d8c9b6]">حالة الدفع: {paymentStatus}</p>
              </div>

              {screenshotPreview && (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#f1dfbd]">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b56a]">إيصال الدفع</p>
                  <img src={screenshotPreview} alt="إيصال الدفع" className="mt-3 h-40 w-full rounded-2xl object-cover" />
                </div>
              )}
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/tracking?code=${orderCode ?? ''}`)}
                  className="flex-1 rounded-full border border-[#d8b56a]/40 bg-white/5 px-6 py-3 text-sm font-semibold text-[#f1dfbd] transition hover:bg-white/10"
                >
                  تتبع الطلب
                </button>
                <button
                  type="button"
                  onClick={handleReturnHome}
                  className="flex-1 rounded-full bg-[#4A0E17] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-[#5b1f28]"
                >
                  العودة إلى الصفحة الرئيسية
                </button>
              </div>
            </div>
          )}
        </div>

        {stage === 'cart' && cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#270913]">
            <div className="flex justify-between items-center mb-5">
              <span className="font-body-md text-[#d8c9b6]">المجموع الفرعي</span>
              <span className="font-headline-md text-[#d8b56a]">{cartSubtotal.toLocaleString()} ج.م</span>
            </div>
            <button
              onClick={handleStartCheckout}
              className="w-full bg-[#4A0E17] text-white py-4 rounded-full font-label-md uppercase tracking-widest hover:bg-[#5b1f28] transition-colors duration-300"
            >
              إتمام الطلب
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
