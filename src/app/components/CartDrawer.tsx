import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { CheckoutForm } from './CheckoutForm';
import type { CustomerOrderPayload } from '../types';

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
  const [hasCopied, setHasCopied] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [checkoutInitialValues, setCheckoutInitialValues] = useState<CustomerOrderPayload>({
    fullName: '',
    phone: '',
    governorate: '',
    address: '',
    notes: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        if (stage === 'success' && !hasCopied) {
          return;
        }
        toggleCart(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, toggleCart, stage, hasCopied]);

  useEffect(() => {
    if (!isCartOpen) {
      setStage('cart');
      setOrderId(null);
      setOrderCode(null);
      setHasCopied(false);
      setIsCopied(false);
      setIsSubmitting(false);
      setCheckoutError('');
    }
  }, [isCartOpen]);

  const handleStartCheckout = () => {
    setCheckoutInitialValues({
      fullName: '',
      phone: '',
      governorate: '',
      address: '',
      notes: '',
    });
    setCheckoutError('');
    setStage('checkout');
  };

  const handleSubmitOrder = async (customer: CustomerOrderPayload) => {
    setIsSubmitting(true);
    setCheckoutError('');
    setCheckoutInitialValues(customer);

    try {
      const newOrder = await addOrder(customer, cart, cartSubtotal);
      setOrderId(newOrder.id);
      setOrderCode(newOrder.orderCode);
      if (typeof window !== 'undefined' && newOrder.orderCode) {
        sessionStorage.setItem('athar_last_order_code', newOrder.orderCode);
      }
      setStage('success');
    } catch (error: any) {
      console.error('Failed to submit order:', error);
      setCheckoutError(error?.message || 'تعذر حفظ الطلب، يرجى المحاولة مرة أخرى.');
      setStage('checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!orderCode) return;
    navigator.clipboard.writeText(orderCode);
    setHasCopied(true);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleTrackOrder = () => {
    if (!hasCopied) return;
    toggleCart(false);
    if (orderCode) {
      navigate(`/tracking?code=${encodeURIComponent(orderCode)}`);
    } else {
      navigate('/tracking');
    }
  };

  const handleReturnHome = () => {
    if (!hasCopied) return;
    toggleCart(false);
    navigate('/');
  };

  const handleBackToCart = () => {
    setStage('cart');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-500 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          if (stage === 'success' && !hasCopied) {
            return;
          }
          toggleCart(false);
        }}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-[80%] md:w-[34%] bg-[#1b0910] z-[70] transition-transform duration-500 ease-out shadow-[0_32px_120px_rgba(0,0,0,0.55)] flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#270913]">
          <h2 className="font-headline-md text-[#f3e1c3]">
            {stage === 'checkout' ? 'إتمام الطلب' : stage === 'success' ? (hasCopied ? 'تم تأكيد الطلب' : 'رمز تتبع الطلب') : 'حقيبة التسوق'}
          </h2>
          <button
            className={`transition-colors ${
              stage === 'success' && !hasCopied
                ? 'text-white/20 cursor-not-allowed'
                : 'text-[#f3e1c3] hover:text-[#d8b56a]'
            }`}
            onClick={() => {
              if (stage === 'success' && !hasCopied) {
                return;
              }
              toggleCart(false);
            }}
            disabled={stage === 'success' && !hasCopied}
            aria-label="Close Cart"
            title={stage === 'success' && !hasCopied ? 'يرجى نسخ رمز التتبع أولاً للمتابعة' : 'إغلاق'}
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
              initialValues={checkoutInitialValues}
              errorMessage={checkoutError}
            />
          )}

          {stage === 'success' && (
            <div className="space-y-4">
              {!hasCopied ? (
                /* Step 1: Simple Tracking Code View with Copy Prompt */
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-[28px] border border-[#d8b56a]/30 bg-[#220912]/95 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
                  {orderCode && (
                    <div className="w-full rounded-2xl border border-[#d8b56a]/40 bg-[#16060c] p-6 text-center shadow-lg">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#d8b56a]">كود التتبع</p>
                      
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
                        <span className="font-mono text-xl font-extrabold tracking-widest text-white sm:text-2xl">
                          {orderCode}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-[#4A0E17] transition hover:bg-[#c49e2f] active:scale-95 shadow-md"
                        >
                          <span className="material-symbols-outlined text-base !scale-x-100">content_copy</span>
                          <span>نسخ الكود</span>
                        </button>
                      </div>

                      <p className="mt-4 text-xs font-medium text-[#f1dfbd]">
                        يرجي نسخ الكود حتي نتمكن من استلام طلبك
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Confirmation Message & Order Summary */
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-6 rounded-[28px] border border-[#d8b56a]/30 bg-[#220912]/95 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
                  <span className="material-symbols-outlined text-7xl text-[#d8b56a]">check_circle</span>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">تم استلام طلبك بنجاح</h3>
                    <p className="text-sm leading-6 text-[#e7dcc8]">
                      شكراً لتسوقك من أثر. تم تأكيد طلبك وجارٍ تجهيزه بعناية.
                    </p>
                  </div>

                  {orderCode && (
                    <div className="w-full rounded-2xl border border-[#d8b56a]/40 bg-[#16060c] p-4 text-center shadow-lg">
                      <p className="text-xs font-medium uppercase tracking-wider text-[#d8b56a]">رمز تتبع طلبك</p>
                      <div className="mt-2 flex items-center justify-center gap-3">
                        <span className="font-mono text-xl font-bold tracking-widest text-white">{orderCode}</span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#f1dfbd] transition hover:bg-white/10"
                          title="نسخ مجدداً"
                        >
                          <span className="material-symbols-outlined text-sm !scale-x-100">
                            {isCopied ? 'done' : 'content_copy'}
                          </span>
                          <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex w-full flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleTrackOrder}
                      className="flex-1 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#4A0E17] transition hover:bg-[#c49e2f] shadow-md"
                    >
                      تتبع طلبك الآن
                    </button>
                    <button
                      type="button"
                      onClick={handleReturnHome}
                      className="flex-1 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      العودة للرئيسية
                    </button>
                  </div>
                </div>
              )}
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
