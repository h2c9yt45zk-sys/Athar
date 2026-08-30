import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
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
  const { user } = useAuth();

  const [stage, setStage] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [orderPhone, setOrderPhone] = useState<string | null>(null);
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
        toggleCart(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, toggleCart, stage]);

  useEffect(() => {
    if (!isCartOpen) {
      setStage('cart');
      setOrderId(null);
      setOrderCode(null);
      setOrderPhone(null);
      setIsSubmitting(false);
      setCheckoutError('');
    }
  }, [isCartOpen]);

  const handleStartCheckout = () => {
    setCheckoutInitialValues({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      governorate: user?.governorate || '',
      address: user?.address || '',
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
      const newOrder = await addOrder(customer, cart, cartSubtotal, user?.id);
      setOrderId(newOrder.id);
      setOrderCode(newOrder.orderCode || newOrder.id || null);
      setOrderPhone(newOrder.phone || customer.phone || null);
      setStage('success');
    } catch (error: any) {
      console.error('Failed to submit order:', error);
      setCheckoutError(error?.message || 'تعذر حفظ الطلب، يرجى المحاولة مرة أخرى.');
      setStage('checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackOrder = () => {
    toggleCart(false);
    if (orderPhone) {
      navigate(`/tracking?phone=${encodeURIComponent(orderPhone)}`);
    } else {
      navigate('/tracking');
    }
  };

  const handleReturnHome = () => {
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
        onClick={() => toggleCart(false)}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-[75%] md:w-[38%] lg:w-[32%] bg-[#1b0910] z-[70] transition-transform duration-500 ease-out shadow-[0_32px_120px_rgba(0,0,0,0.55)] flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#270913]">
          <h2 className="font-headline-md text-[#f3e1c3]">
            {stage === 'checkout' ? 'إتمام الطلب' : stage === 'success' ? 'تم تأكيد الطلب' : 'حقيبة التسوق'}
          </h2>
          <button
            className="transition-colors text-[#f3e1c3] hover:text-[#d8b56a]"
            onClick={() => toggleCart(false)}
            aria-label="Close Cart"
            title="إغلاق"
          >
            <span className="material-symbols-outlined !scale-x-100">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {stage === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#d8c9b6] gap-4 py-16">
                  <span className="material-symbols-outlined text-5xl text-[#D4AF37]/60 !scale-x-100">shopping_bag</span>
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
                      className="text-[#d8c9b6] hover:text-[#d8b56a] transition-colors"
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
              <div className="flex min-h-[380px] flex-col items-center justify-center gap-5 rounded-[28px] border border-[#d8b56a]/30 bg-[#220912]/95 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined text-4xl !scale-x-100">check_circle</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">تم استلام طلبك بنجاح!</h3>
                  <p className="text-sm leading-6 text-[#e7dcc8]">
                    شكراً لتسوقك من أثر. جاري مراجعة وتجهيز طلبك وسيتم التواصل معك عند الشحن.
                  </p>
                </div>

                {orderCode && (
                  <div className="w-full rounded-2xl bg-[#1b070f] border border-white/10 p-3.5 text-center">
                    <p className="text-xs text-[#d8b56a] mb-1">رقم الطلب</p>
                    <p className="font-mono text-sm font-bold text-white tracking-wider">{orderCode}</p>
                  </div>
                )}

                <div className="flex w-full flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleTrackOrder}
                    className="w-full rounded-full bg-[#D4AF37] hover:bg-[#c49e2f] px-6 py-3.5 text-sm font-bold text-[#4A0E17] transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined !scale-x-100 text-lg">local_shipping</span>
                    تتبع طلبك الآن
                  </button>

                  <button
                    type="button"
                    onClick={handleReturnHome}
                    className="w-full rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-semibold text-white transition"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {stage === 'cart' && cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#270913]">
            <div className="flex justify-between items-center mb-5">
              <span className="font-body-md text-[#d8c9b6]">المجموع الفرعي</span>
              <span className="font-headline-md text-[#d8b56a] font-bold">{cartSubtotal.toLocaleString()} ج.م</span>
            </div>
            <button
              onClick={handleStartCheckout}
              className="w-full bg-[#4A0E17] text-white py-4 rounded-full font-label-md uppercase tracking-widest hover:bg-[#5b1f28] transition-colors duration-300 border border-[#D4AF37]/30 shadow-lg"
            >
              إتمام الطلب
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
