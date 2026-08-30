import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Order, OrderItem, Product, CategoryInfo, CustomerOrderPayload } from '../types';
import { CATEGORIES } from '../data/data';
import { OrderService } from '../services/orderService';
import { ProductService } from '../services/productService';

type CategoryKey = 'women' | 'men' | 'islamic';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  toggleCart: (open?: boolean) => void;
  addToCart: (name: string, price: number, image: string, options?: { size?: string; productId?: string }) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, delta: number) => void;
  cartSubtotal: number;
  cartCount: number;
  clearCart: () => void;
  addOrder: (customer: CustomerOrderPayload, items: CartItem[], total: number, userId?: string) => Promise<Order>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Record<CategoryKey, CategoryInfo>;
  setCategories: React.Dispatch<React.SetStateAction<Record<CategoryKey, CategoryInfo>>>;
}

const ORDER_ARCHIVE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const pruneExpiredDeliveredOrders = (orderList: Order[]) =>
  orderList.filter((order) => {
    if (order.status !== 'تم التوصيل') {
      return true;
    }

    const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt).getTime() : new Date(order.createdAt).getTime();
    const expiresAt = deliveredAt + ORDER_ARCHIVE_TTL_MS;

    return Date.now() <= expiresAt;
  });

const CartContext = createContext<CartContextType | undefined>(undefined);

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
    if (!storedOrders) {
      return [];
    }

    const parsedOrders = JSON.parse(storedOrders) as Order[];
    return Array.isArray(parsedOrders) ? parsedOrders : [];
  } catch {
    return [];
  }
};

const getStoredProducts = (): Product[] => {
  try {
    const storedProducts = window.localStorage.getItem('athar_products');
    if (!storedProducts) {
      return [];
    }

    const parsedProducts = JSON.parse(storedProducts) as Product[];
    return Array.isArray(parsedProducts) ? parsedProducts : [];
  } catch {
    return [];
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
    let isActive = true;

    const loadData = async () => {
      try {
        const [fetchedProducts, fetchedOrders] = await Promise.all([
          ProductService.fetchProducts(),
          OrderService.fetchAllOrders(),
        ]);
        if (isActive) {
          // Always replace from Supabase so localStorage cache never overrides the DB truth
          setProducts(fetchedProducts);
          if (fetchedOrders.length > 0) {
            setOrders(fetchedOrders);
          }
        }
      } catch (error) {
        console.error('Error loading initial data from Supabase:', error);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const pruneOrders = () => {
      setOrders((prev) => pruneExpiredDeliveredOrders(prev));
    };

    pruneOrders();
    const intervalId = window.setInterval(pruneOrders, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('athar_cart', JSON.stringify(cart));
      window.localStorage.setItem('athar_orders', JSON.stringify(orders));
      window.localStorage.setItem('athar_products', JSON.stringify(products));
      window.localStorage.setItem('athar_categories', JSON.stringify(categories));
    }
  }, [cart, orders, products, categories]);

  const toggleCart = (open?: boolean) => {
    setIsCartOpen((prev) => (open !== undefined ? open : !prev));
  };

  const addToCart = (
    name: string,
    price: number,
    image: string,
    options?: { size?: string; productId?: string }
  ) => {
    const newItem: CartItem = {
      id: Date.now() + Math.random(),
      productId: options?.productId,
      name,
      price,
      image,
      quantity: 1,
      size: options?.size || 'M',
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

  const addOrder = async (
    customer: CustomerOrderPayload,
    items: CartItem[],
    total: number,
    userId?: string
  ): Promise<Order> => {
    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.productId ? String(item.productId) : undefined,
      name: item.name,
      size: item.size || 'M',
      quantity: item.quantity || 1,
      price: item.price,
    }));

    const initialOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderCode: '',
      customerName: customer.fullName,
      phone: customer.phone,
      governorate: customer.governorate,
      address: customer.address,
      notes: customer.notes,
      total,
      status: 'جاري التأكيد',
      createdAt: new Date().toISOString(),
      deliveredAt: undefined,
      userId: userId || undefined,
      items: orderItems,
      paymentMethod: 'الدفع عند الاستلام',
      paymentStatus: 'جاري الفحص',
    };

    // Save to Supabase and capture the returned order with real database ID
    const savedOrder = await OrderService.saveOrder(initialOrder, orderItems);

    setOrders((prev) => [savedOrder, ...prev]);
    setCart([]);

    return savedOrder;
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
