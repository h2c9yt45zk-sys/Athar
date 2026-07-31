import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Order, Product, CategoryInfo, PaymentMethod, ElectronicPaymentMethod, PaymentStatus } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/data';

type CategoryKey = 'women' | 'men' | 'islamic';

interface CustomerOrderPayload {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
  electronicMethod?: ElectronicPaymentMethod;
  screenshotUrl?: string;
  paymentStatus?: PaymentStatus;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  toggleCart: (open?: boolean) => void;
  addToCart: (name: string, price: number, image: string, options?: { size?: string; color?: string; productId?: string }) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, delta: number) => void;
  cartSubtotal: number;
  cartCount: number;
  clearCart: () => void;
  addOrder: (customer: CustomerOrderPayload, items: CartItem[], total: number) => Order;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Record<CategoryKey, CategoryInfo>;
  setCategories: React.Dispatch<React.SetStateAction<Record<CategoryKey, CategoryInfo>>>;
}

const initialOrders: Order[] = [
  {
    id: 'ORD-1042',
    orderCode: 'ATHAR-1042',
    customerName: 'سارة المزروعي',
    phone: '0501234567',
    address: 'الرياض، حي العليا، شارع الملك فهد',
    notes: 'أرجو التواصل قبل التسليم.',
    total: 1280,
    status: 'قيد الانتظار',
    createdAt: '2026-07-28T10:45:00.000Z',
    items: [
      { name: 'فستان كاجوال فاخر', size: 'M', quantity: 1, price: 720 },
      { name: 'حذاء أنيق', size: '39', quantity: 1, price: 560 },
    ],
    paymentMethod: 'الدفع عند الاستلام',
    paymentStatus: 'جاري الفحص',
  },
  {
    id: 'ORD-1041',
    orderCode: 'ATHAR-1041',
    customerName: 'أحمد القحطاني',
    phone: '0559876543',
    address: 'جدة، شارع الأمير ماجد، أمام المنتزه',
    notes: 'يرجى ترك الطرد عند الأمن إذا لم أكن متواجداً.',
    total: 940,
    status: 'قيد التجهيز',
    createdAt: '2026-07-29T09:25:00.000Z',
    items: [
      { name: 'سترة رجالية كلاسيكية', size: 'L', quantity: 1, price: 560 },
      { name: 'قماش إسلامي', size: 'Free', quantity: 2, price: 190 },
    ],
    paymentMethod: 'دفع إلكتروني',
    electronicMethod: 'إنستا باي',
    screenshotUrl: 'https://images.unsplash.com/photo-1589829542153-5f8f39e8dabb?auto=format&fit=crop&w=900&q=80',
    paymentStatus: 'تم القبول',
  },
  {
    id: 'ORD-1040',
    orderCode: 'ATHAR-1040',
    customerName: 'ليلى الحربي',
    phone: '0563344556',
    address: 'الدمام، حي الوزيرية، شارع الخليج',
    notes: 'التوصيل بعد الظهر فقط.',
    total: 1540,
    status: 'تم الشحن',
    createdAt: '2026-07-27T14:15:00.000Z',
    items: [{ name: 'معطف نسائي', size: 'S', quantity: 1, price: 1540 }],
    paymentMethod: 'دفع إلكتروني',
    electronicMethod: 'فودافون كاش',
    screenshotUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    paymentStatus: 'جاري الفحص',
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

const generateOrderCode = (existingOrders: Order[]) => {
  const candidate = `ATHAR-${Date.now().toString().slice(-5)}`;
  const isTaken = existingOrders.some((order) => order.orderCode === candidate);

  if (!isTaken) {
    return candidate;
  }

  return `ATHAR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
};

const getStoredCart = (): CartItem[] => {
  try {
    const storedCart = window.localStorage.getItem('athar_cart');
    return storedCart ? (JSON.parse(storedCart) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const getStoredOrders = (): Order[] => {
  try {
    const storedOrders = window.localStorage.getItem('athar_orders');
    return storedOrders ? (JSON.parse(storedOrders) as Order[]) : initialOrders;
  } catch {
    return initialOrders;
  }
};

const getStoredProducts = (): Product[] => {
  try {
    const storedProducts = window.localStorage.getItem('athar_products');
    return storedProducts ? (JSON.parse(storedProducts) as Product[]) : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
};

const getStoredCategories = (): Record<CategoryKey, CategoryInfo> => {
  try {
    const storedCategories = window.localStorage.getItem('athar_categories');
    return storedCategories ? (JSON.parse(storedCategories) as Record<CategoryKey, CategoryInfo>) : (CATEGORIES as Record<CategoryKey, CategoryInfo>);
  } catch {
    return CATEGORIES as Record<CategoryKey, CategoryInfo>;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [categories, setCategories] = useState<Record<CategoryKey, CategoryInfo>>(getStoredCategories);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    window.localStorage.setItem('athar_cart', JSON.stringify(cart));
    window.localStorage.setItem('athar_orders', JSON.stringify(orders));
    window.localStorage.setItem('athar_products', JSON.stringify(products));
    window.localStorage.setItem('athar_categories', JSON.stringify(categories));
  }, [cart, orders, products, categories]);

  const toggleCart = (open?: boolean) => {
    setIsCartOpen((prev) => (open !== undefined ? open : !prev));
  };

  const addToCart = (
    name: string,
    price: number,
    image: string,
    options?: { size?: string; color?: string; productId?: string }
  ) => {
    const newItem: CartItem = {
      id: Date.now() + Math.random(),
      productId: options?.productId,
      name,
      price,
      image,
      quantity: 1,
      size: options?.size || 'M',
      color: options?.color || 'كحلي ملكي',
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number | string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number | string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const addOrder = (customer: CustomerOrderPayload, items: CartItem[], total: number) => {
    const orderItems = items.map((item) => ({
      name: item.name,
      size: item.size || 'M',
      quantity: item.quantity || 1,
      price: item.price,
    }));

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderCode: generateOrderCode(orders),
      customerName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
      total,
      status: 'قيد الانتظار',
      createdAt: new Date().toISOString(),
      items: orderItems,
      paymentMethod: customer.paymentMethod,
      electronicMethod: customer.electronicMethod,
      screenshotUrl: customer.screenshotUrl,
      paymentStatus: customer.paymentStatus ?? 'جاري الفحص',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartSubtotal,
        cartCount,
        clearCart,
        addOrder,
        orders,
        setOrders,
        products,
        setProducts,
        categories,
        setCategories,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
