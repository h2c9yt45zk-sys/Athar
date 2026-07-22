import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartSubtotal } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        toggleCart(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, toggleCart]);

  return (
    <>
      {/* Cart Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-500 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => toggleCart(false)}
      />

      {/* Cart Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-[80%] md:w-[30%] bg-surface z-[70] transition-transform duration-500 ease-out shadow-2xl flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="font-headline-md text-brand-burgundy">حقيبة التسوق</h2>
          <button
            className="text-on-surface hover:text-brand-burgundy transition-colors"
            onClick={() => toggleCart(false)}
            aria-label="Close Cart"
          >
            <span className="material-symbols-outlined !scale-x-100">close</span>
          </button>
        </div>

        {/* Cart Items Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-muted gap-4">
              <span className="material-symbols-outlined text-4xl">shopping_bag</span>
              <p className="font-body-md">حقيبتك فارغة حالياً</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b border-outline-variant/10 pb-4">
                <img src={item.image} alt={item.name} className="w-16 h-20 md:w-20 md:h-24 object-cover rounded" />
                <div className="flex-1 text-right">
                  <h4 className="font-headline-md !text-sm md:!text-base mb-1">{item.name}</h4>
                  <p className="font-body-md !text-xs md:!text-sm text-brand-gold font-bold mb-2">
                    {item.price.toLocaleString()} ج.م
                  </p>
                  {item.quantity && (
                    <div className="flex items-center gap-3 justify-start">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-xs hover:bg-brand-burgundy hover:text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-xs hover:bg-brand-burgundy hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-on-surface-variant hover:text-error transition-colors"
                  title="حذف"
                >
                  <span className="material-symbols-outlined text-sm !scale-x-100">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-outline-variant bg-surface-container-low">
            <div className="flex justify-between items-center mb-6">
              <span className="font-body-md text-on-surface-variant">المجموع الفرعي</span>
              <span className="font-headline-md text-brand-burgundy">{cartSubtotal.toLocaleString()} ج.م</span>
            </div>
            <button
              onClick={() => alert('شكرًا لك! سيتم نقلك لمتابعة عملية الدفع.')}
              className="w-full bg-brand-burgundy text-white py-4 rounded-full font-label-md uppercase tracking-widest hover:bg-black transition-colors duration-300"
            >
              إتمام الشراء
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
