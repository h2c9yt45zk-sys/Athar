import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { EGYPTIAN_GOVERNORATES, Product, CategoryInfo, PaymentStatus, Order, OrderStatus, normalizeOrderStatus } from '../types';
import { AdminAuthService } from '../services/adminAuthService';
import { ProductService, DEFAULT_PRODUCT_IMAGE } from '../services/productService';
import { OrderService } from '../services/orderService';
import {
  BadgeCheck,
  BarChart3,
  Clock3,
  Copy,
  CreditCard,
  Eye,
  ExternalLink,
  PencilLine,
  Plus,
  Search,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react';

type OrderItem = {
  name: string;
  size: string;
  quantity: number;
  price: number;
};

type AdminOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  items: OrderItem[];
  paymentMethod: 'الدفع عند الاستلام' | 'دفع إلكتروني';
  electronicMethod?: 'إنستا باي' | 'فودافون كاش';
  screenshotUrl?: string;
  paymentStatus: PaymentStatus;
};

type CategoryKey = 'women' | 'men' | 'islamic';

const AVAILABLE_SIZE_OPTIONS = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

type ProductFormState = {
  id: string;
  name: string;
  category: CategoryKey;
  price: number;
  description: string;
  imageUrl: string;
  sizes: string[];
};

const sidebarItems: Array<{ key: 'orders' | 'store'; label: string; icon: typeof BarChart3 }> = [
  { key: 'orders', label: 'الطلبات والإحصائيات', icon: BarChart3 },
  { key: 'store', label: 'إدارة المتجر', icon: Store },
];

const statusClasses: Record<OrderStatus, string> = {
  'جاري التأكيد': 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  'قيد التجهيز': 'bg-sky-500/15 text-sky-200 border-sky-400/30',
  'تم الشحن': 'bg-violet-500/15 text-violet-200 border-violet-400/30',
  'تم التوصيل': 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
};

const paymentStatusClasses: Record<PaymentStatus, string> = {
  'جاري الفحص': 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  'تم القبول': 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  'خطأ في الدفع': 'bg-rose-500/15 text-rose-200 border-rose-400/30',
};

const orderStatusTabs: Array<{ label: string; value: 'الكل' | OrderStatus }> = [
  { label: 'الكل', value: 'الكل' },
  { label: 'جاري التأكيد', value: 'جاري التأكيد' },
  { label: 'قيد التجهيز', value: 'قيد التجهيز' },
  { label: 'تم الشحن', value: 'تم الشحن' },
  { label: 'تم التوصيل', value: 'تم التوصيل' },
];

const paymentStatusTabs: PaymentStatus[] = ['جاري الفحص', 'تم القبول', 'خطأ في الدفع'];

const getPaymentMethodDisplay = (paymentMethod?: string, electronicMethod?: string) => {
  const method = paymentMethod || 'الدفع عند الاستلام';
  if (method === 'الدفع عند الاستلام') {
    return 'الدفع عند الاستلام';
  }

  return `${method}${electronicMethod ? ` - ${electronicMethod}` : ''}`;
};

const getPaymentStatusDisplay = (paymentMethod?: string, paymentStatus?: string) => {
  const method = paymentMethod || 'الدفع عند الاستلام';
  if (method === 'الدفع عند الاستلام') {
    return '-';
  }

  return paymentStatus || 'جاري الفحص';
};

const isOrderArchiveVisible = (order: Order) => {
  if (order.status !== 'تم التوصيل') {
    return false;
  }

  const deliveredAt = new Date(order.deliveredAt ?? order.createdAt).getTime();
  const expiresAt = deliveredAt + 7 * 24 * 60 * 60 * 1000;

  return Date.now() <= expiresAt;
};

const categoryTabs: Array<{ key: CategoryKey; label: string }> = [
  { key: 'men', label: 'رجالي' },
  { key: 'women', label: 'نسائي' },
  { key: 'islamic', label: 'إسلامي' },
];

const ADMIN_SESSION_KEY = 'athar_admin_authenticated';

const normalizeOrderCode = (value?: string | null) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value)
    .replace(/^#/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .trim()
    .toUpperCase();
};

const emptyProductForm = (category: CategoryKey): ProductFormState => ({
  id: '',
  name: '',
  category,
  price: 0,
  description: '',
  imageUrl: '',
  sizes: ['S', 'M', 'L', 'XL'],
});

export default function AdminDashboard() {
  const { orders, setOrders, products, setProducts, categories, setCategories } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'store'>('orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id ?? '');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('men');
  const [selectedOrderTab, setSelectedOrderTab] = useState<'الكل' | OrderStatus>('الكل');
  const [orderSort, setOrderSort] = useState<'newest' | 'highestPrice' | 'nearest'>('newest');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('الكل');
  const [ordersSectionTab, setOrdersSectionTab] = useState<'active' | 'history'>('active');
  const [deliveryConfirmOrderId, setDeliveryConfirmOrderId] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>('');
  const [bestSellerNotice, setBestSellerNotice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm('men'));
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const selectedCollection = categories[selectedCategory] ?? categories.women;
  const bestSellerProducts = useMemo(() => products.filter((product) => product.isBestSeller).slice(0, 4), [products]);
  const visibleProducts = useMemo(
    () => products.filter((product) => product.category === selectedCategory && !product.isBestSeller),
    [products, selectedCategory]
  );

  const filteredOrders = useMemo(() => {
    const nearbyPriority = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'الشرقية', 'الخبر', 'الظهران'];
    const normalizedSearch = customerSearch.trim().toLowerCase();

    return orders
      .filter((order) => order.status !== 'تم التوصيل')
      .filter((order) => (selectedOrderTab === 'الكل' ? true : order.status === selectedOrderTab))
      .filter((order) => {
        if (!normalizedSearch) return true;
        return (order.customerName ?? '').toLowerCase().includes(normalizedSearch);
      })
      .filter((order) => {
        if (selectedGovernorate === 'الكل') return true;
        return order.address?.includes(selectedGovernorate) ?? false;
      })
      .sort((a, b) => {
        if (orderSort === 'highestPrice') {
          return b.total - a.total;
        }
        if (orderSort === 'nearest') {
          const aPriority = nearbyPriority.findIndex((city) => a.address.includes(city));
          const bPriority = nearbyPriority.findIndex((city) => b.address.includes(city));
          const aIndex = aPriority === -1 ? 999 : aPriority;
          const bIndex = bPriority === -1 ? 999 : bPriority;
          return aIndex - bIndex;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders, selectedOrderTab, orderSort, customerSearch, selectedGovernorate]);

  const historyOrders = useMemo(
    () =>
      orders
        .filter((order) => isOrderArchiveVisible(order))
        .filter((order) => {
          if (!customerSearch.trim()) return true;
          return (order.customerName ?? '').toLowerCase().includes(customerSearch.trim().toLowerCase());
        })
        .filter((order) => {
          if (selectedGovernorate === 'الكل') return true;
          return order.address?.includes(selectedGovernorate) ?? false;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders, customerSearch, selectedGovernorate]
  );

  const currentOrders = ordersSectionTab === 'active' ? filteredOrders : historyOrders;
  const selectedOrder = currentOrders.find((order) => order.id === selectedOrderId) ?? currentOrders[0] ?? null;

  useEffect(() => {
    const ordersToCheck = ordersSectionTab === 'active' ? filteredOrders : historyOrders;
    if (ordersToCheck.length > 0 && !ordersToCheck.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(ordersToCheck[0].id);
    }
  }, [filteredOrders, historyOrders, ordersSectionTab, selectedOrderId, orders]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const clearOrderSearch = () => {
    setCustomerSearch('');
    setSelectedGovernorate('الكل');
  };

  const copyShippingDetails = (order: Order) => {
    const details = `رمز الطلب: ${order.orderCode || order.id}\nالعميل: ${order.customerName}\nالهاتف: ${order.phone}\nالعنوان: ${order.address}\nالإجمالي: ${order.total} ر.س`;
    navigator.clipboard
      .writeText(details)
      .then(() => {
        setCopyMessage('تم نسخ تفاصيل الشحن');
        window.setTimeout(() => setCopyMessage(''), 1800);
      })
      .catch(() => {
        setCopyMessage('فشل نسخ التفاصيل');
        window.setTimeout(() => setCopyMessage(''), 1800);
      });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      console.error('Invalid upload file type:', file.type);
      setBestSellerNotice('يرجى اختيار ملف صورة صحيح.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageUploadFile(file);
    setImagePreview(previewUrl);
    console.log('Local image preview prepared for upload:', { name: file.name, type: file.type, size: file.size });
  };

  const quickStats = [
    { label: 'إجمالي الطلبات', value: String(orders.length), icon: ShoppingBag },
    { label: 'طلبات معلقة', value: String(orders.filter((order) => order.status !== 'تم التوصيل').length), icon: Clock3 },
  ];

  const handleCollectionChange = (id: string, field: keyof CategoryInfo, value: string) => {
    const categoryKey = id as CategoryKey;
    setCategories((prev) => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [field]: value,
      },
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const normalizedStatus = normalizeOrderStatus(status);
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        if (normalizedStatus === 'تم التوصيل') {
          return { ...order, status: normalizedStatus, deliveredAt: order.deliveredAt ?? new Date().toISOString() };
        }

        return { ...order, status: normalizedStatus, deliveredAt: undefined };
      })
    );
    OrderService.updateOrderStatus(orderId, normalizedStatus).catch((err) => {
      console.warn('Failed to persist status change to Supabase:', err);
    });
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, paymentStatus } : order)));
  };

  const requestDeliveryConfirmation = (orderId: string) => {
    setDeliveryConfirmOrderId(orderId);
  };

  const confirmDeliveryStatus = () => {
    if (!deliveryConfirmOrderId) return;
    const deliveredAt = new Date().toISOString();
    const targetId = deliveryConfirmOrderId;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === targetId
          ? { ...order, status: 'تم التوصيل', deliveredAt: order.deliveredAt ?? deliveredAt }
          : order
      )
    );
    OrderService.updateOrderStatus(targetId, 'تم التوصيل').catch((err) => {
      console.warn('Failed to persist delivered status to Supabase:', err);
    });
    setDeliveryConfirmOrderId(null);
  };

  const cancelDeliveryConfirmation = () => {
    setDeliveryConfirmOrderId(null);
  };

  const restoreOrder = (orderId: string, status: OrderStatus) => {
    const normalizedStatus = normalizeOrderStatus(status);
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: normalizedStatus } : order)));
    OrderService.updateOrderStatus(orderId, normalizedStatus).catch((err) => {
      console.warn('Failed to persist restored status to Supabase:', err);
    });
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm(selectedCategory));
    setImagePreview('');
    setImageUploadFile(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description ?? '',
      imageUrl: product.image,
      sizes: (product.sizes ?? []).filter((size) => AVAILABLE_SIZE_OPTIONS.includes(size)),
    });
    setImagePreview(product.image);
    setImageUploadFile(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const saveProduct = async () => {
    const cleanedName = productForm.name.trim();
    const cleanedDescription = productForm.description.trim();
    const normalizedSizes = productForm.sizes.filter(Boolean);

    setModalError('');

    if (!cleanedName) {
      setModalError('يرجى إدخال اسم المنتج قبل الحفظ.');
      console.error('Attempted to save product without name.');
      return;
    }

    if (Number(productForm.price) <= 0) {
      setModalError('يرجى إدخال سعر صالح للمنتج.');
      console.error('Attempted to save product with invalid price:', productForm.price);
      return;
    }

    if (!normalizedSizes.length) {
      setModalError('يرجى اختيار مقاس واحد على الأقل للمنتج.');
      console.error('Attempted to save product without sizes selected.');
      return;
    }

    setIsSavingProduct(true);
    setBestSellerNotice('');

    try {
      let finalImageUrl = productForm.imageUrl.trim();

      // 1. If an image file was selected, upload it directly to Supabase Storage and get its permanent Public URL
      if (imageUploadFile) {
        console.log('Uploading selected image to Supabase Storage before persisting product...');
        const uploadedPublicUrl = await ProductService.uploadProductImage(imageUploadFile);
        finalImageUrl = uploadedPublicUrl;
        console.log('Obtained permanent Public URL for image:', finalImageUrl);
      } else if (finalImageUrl.startsWith('blob:')) {
        // Guard against any leftover temporary blob URLs when no new file is uploaded
        finalImageUrl = '';
      }

      const resolvedImage = finalImageUrl || DEFAULT_PRODUCT_IMAGE;

      const productPayload: Product = {
        id: editingProductId ?? `p-${Date.now()}`,
        name: cleanedName,
        subtitle: cleanedDescription || cleanedName,
        category: productForm.category,
        price: Number(productForm.price) || 0,
        description: cleanedDescription,
        image: resolvedImage,
        sizes: normalizedSizes,
        isBestSeller: editingProductId
          ? products.find((product) => product.id === editingProductId)?.isBestSeller ?? false
          : false,
      };

      console.log('Persisting product record to Supabase database:', productPayload);

      // 3. Save permanent public URL into the 'image' column of 'products' table
      const savedProduct = editingProductId
        ? await ProductService.updateProduct(productPayload)
        : await ProductService.createProduct(productPayload);

      setProducts((prev) => {
        if (editingProductId) {
          return prev.map((product) => (product.id === editingProductId ? savedProduct : product));
        }
        return [savedProduct, ...prev.filter((product) => product.id !== savedProduct.id)];
      });

      setIsModalOpen(false);
      setSelectedCategory(savedProduct.category);
      setProductForm(emptyProductForm(savedProduct.category));
      setImagePreview('');
      setImageUploadFile(null);
      setModalError('');
      console.log('Product saved successfully with permanent image URL:', savedProduct.image);
    } catch (error) {
      console.error('Full Supabase Error:', error);
      console.error('Failed to save product:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء الحفظ';
      setModalError(`فشل حفظ المنتج: ${errorMessage}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const toggleBestSeller = async (productId: string, isAdd: boolean) => {
    if (isAdd) {
      const currentBestSellers = products.filter((product) => product.isBestSeller).length;
      if (currentBestSellers >= 4) {
        setBestSellerNotice('لا يمكن إضافة منتج جديد، الحد الأقصى للأكثر مبيعا هو 4 منتجات فقط. يجب إزالة منتج أولاً');
        return;
      }
    }

    const targetProduct = products.find((product) => product.id === productId);
    if (!targetProduct) {
      return;
    }

    try {
      const updatedProduct = await ProductService.updateProduct({
        ...targetProduct,
        isBestSeller: isAdd,
      });

      setBestSellerNotice('');
      setProducts((prev) => prev.map((product) => (product.id === productId ? updatedProduct : product)));
    } catch (error) {
      console.error('Failed to update best seller status:', error);
      setBestSellerNotice('فشل تحديث حالة المنتج الأكثر مبيعاً.');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      // Find the product to get its image URL for storage cleanup
      const productToDelete = products.find((p) => p.id === productId);
      const imageUrl = productToDelete?.image;

      await ProductService.deleteProduct(productId, imageUrl);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setProductToDeleteId(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      setBestSellerNotice('فشل حذف المنتج. تأكد من وجوده في قاعدة البيانات.');
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      setLoginError('يرجى إدخال كلمة المرور');
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 500);
      return;
    }

    try {
      const isValid = await AdminAuthService.verifyPassword(trimmedPassword);

      if (isValid) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        setLoginError('');
        setPassword('');
        return;
      }

      setLoginError('كلمة المرور غير صحيحة أو غير مُعدّة في قاعدة البيانات');
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 500);
    } catch (error) {
      console.error('Admin login verification failed:', error);
      setLoginError('تعذر التحقق من كلمة المرور الآن');
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setPassword('');
    setLoginError('');
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>

      {!isAuthenticated ? (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_25%),linear-gradient(135deg,_#1a0b12_0%,_#11070c_35%,_#050505_100%)] px-4 py-10">
          <div className="w-full max-w-md rounded-[28px] border border-[#D4AF37]/20 bg-[#14090f]/90 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#f3ce90]">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">Athar</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">لوحة الإدارة</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[#f2e1d0]">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (loginError) {
                      setLoginError('');
                    }
                    if (isShaking) {
                      setIsShaking(false);
                    }
                  }}
                  className={`w-full rounded-2xl border bg-[#12070d]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#D4AF37] ${loginError ? 'border-red-400' : 'border-white/10'} ${isShaking ? 'animate-[shake_0.35s_ease-in-out_2]' : ''}`}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                />
              </div>

              {loginError && <p className="text-sm text-red-300">{loginError}</p>}

              <button
                type="submit"
                className="w-full rounded-full bg-[#8b1f3f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a32648]"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(90,24,39,0.34),_transparent_30%),linear-gradient(135deg,_#050505_0%,_#11070c_45%,_#080505_100%)] text-[#f7e7dc]">
          <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
            <aside className="w-full border-b border-white/10 bg-[#14090f]/80 p-6 backdrop-blur-xl lg:w-72 lg:border-b-0 lg:border-l lg:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c8914f]/30 bg-[#c8914f]/10 text-[#f3ce90]">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#c8914f]">Athar</p>
                  <h2 className="text-lg font-semibold text-white">لوحة الإدارة</h2>
                </div>
              </div>

              <nav className="mt-8 space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right text-sm transition ${
                        isActive ? 'bg-[#8b1f3f] text-white shadow-lg shadow-[#8b1f3f]/20' : 'bg-white/5 text-[#f4dfc9] hover:bg-white/10'
                      }`}
                      onClick={() => setActiveTab(item.key)}
                      type="button"
                    >
                      <span>{item.label}</span>
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 rounded-3xl border border-[#c8914f]/20 bg-[#1f0f16]/80 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c8914f]">ملاحظة سريعة</p>
                <p className="mt-2 text-sm leading-7 text-[#f2e0ce]">تابع الطلبات اليومية وحافظ على هوية المتجر الراقية في كل قسم.</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 w-full rounded-full border border-[#c8914f]/30 bg-[#c8914f]/10 px-3 py-2 text-sm text-[#f3ce90] transition hover:bg-[#c8914f]/15"
                >
                  تسجيل خروج
                </button>
              </div>
            </aside>

            <main className="flex-1 pt-20 p-6 lg:pt-24 lg:p-8">
          {activeTab === 'orders' && (
            <section className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {quickStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <article key={stat.label} className="rounded-[24px] border border-white/10 bg-[#14090f]/80 p-5 shadow-[0_16px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#f2e1d0]">{stat.label}</p>
                        <div className="rounded-2xl border border-[#c8914f]/20 bg-[#c8914f]/10 p-2 text-[#f3ce90]">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
                    </article>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] border border-white/10 bg-[#12070d]/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-[#c8914f]">الطلبات</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">إدارة الطلبات الحالية</h2>
                    </div>
                    <div className="rounded-full border border-[#c8914f]/20 bg-[#c8914f]/10 px-3 py-2 text-sm text-[#f3ce90]">{orders.length} طلب</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <button
                        type="button"
                        onClick={() => setOrdersSectionTab('active')}
                        className={`rounded-full px-4 py-2 text-sm transition ${ordersSectionTab === 'active' ? 'bg-[#8b1f3f] text-white shadow-lg shadow-[#8b1f3f]/20' : 'bg-white/5 text-[#f2e1d0] hover:bg-white/10'}`}
                      >
                        الطلبات النشطة
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrdersSectionTab('history')}
                        className={`rounded-full px-4 py-2 text-sm transition ${ordersSectionTab === 'history' ? 'bg-[#8b1f3f] text-white shadow-lg shadow-[#8b1f3f]/20' : 'bg-white/5 text-[#f2e1d0] hover:bg-white/10'}`}
                      >
                        سجل الطلبات
                      </button>
                    </div>

                    {ordersSectionTab === 'active' ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#c8914f]">ترتيب حسب</p>
                            <select
                              value={orderSort}
                              onChange={(event) => setOrderSort(event.target.value as 'newest' | 'highestPrice' | 'nearest')}
                              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#12070d]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#c8914f]"
                            >
                              <option value="newest">الأحدث</option>
                              <option value="highestPrice">الأكثر سعراً</option>
                              <option value="nearest">الأقرب</option>
                            </select>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#c8914f]">حالة الطلب</p>
                            <select
                              value={selectedOrderTab}
                              onChange={(event) => setSelectedOrderTab(event.target.value as 'الكل' | OrderStatus)}
                              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#12070d]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#c8914f]"
                            >
                              {orderStatusTabs.map((tab) => (
                                <option key={tab.value} value={tab.value} className="bg-[#12070d] text-white">
                                  {tab.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#c8914f]">البحث بالاسم</p>
                            <input
                              value={customerSearch}
                              onChange={(event) => setCustomerSearch(event.target.value)}
                              placeholder="اكتب اسم العميل"
                              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#12070d]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#c8914f]"
                            />
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#c8914f]">تصفية حسب المحافظة</p>
                            <select
                              value={selectedGovernorate}
                              onChange={(event) => setSelectedGovernorate(event.target.value)}
                              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#12070d]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-[#c8914f]"
                            >
                              <option value="الكل">كل المحافظات</option>
                              {EGYPTIAN_GOVERNORATES.map((gov) => (
                                <option key={gov} value={gov} className="bg-[#12070d] text-white">
                                  {gov}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3">
                          <div className="rounded-2xl border border-white/10 bg-[#12070d]/70 px-4 py-3 text-sm text-[#f2e1d0]">
                            {filteredOrders.length} طلب متاح حالياً
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-[#12070d]/70 px-4 py-3 text-sm text-[#f2e1d0]">
                            {selectedOrderTab === 'الكل' ? 'كل الحالات' : `حالة: ${orderStatusTabs.find((tab) => tab.value === selectedOrderTab)?.label}`}
                          </div>
                          {(customerSearch || selectedGovernorate !== 'الكل') && (
                            <button
                              type="button"
                              onClick={clearOrderSearch}
                              className="rounded-full border border-[#c8914f]/30 bg-[#c8914f]/10 px-3 py-2 text-sm text-[#f3ce90] transition hover:bg-[#c8914f]/15"
                            >
                              مسح الفلاتر
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#f2e1d0]">
                        هنا يظهر سجل الطلبات التي تم تسليمها. استخدم الأزرار أدناه لاستعادة أي طلب إلى حالة نشطة.
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-3">
                    {currentOrders.length ? (
                      currentOrders.map((order) => (
                        <button
                          key={order.id}
                          className={`w-full rounded-2xl border p-4 text-right transition ${selectedOrderId === order.id ? 'border-[#c8914f]/40 bg-[#2b1119]' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}
                          onClick={() => setSelectedOrderId(order.id)}
                          type="button"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-[#f2e1d0]">{order.customerName}</p>
                            </div>
                            <div className="text-sm text-[#f2e1d0]">
                              <p>{order.phone}</p>
                              <p>{order.address}</p>
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-white">{order.total.toLocaleString()} ر.س</p>
                              <p className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs ${statusClasses[order.status]}`}>{order.status}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-[#f2e1d0]">
                        {customerSearch || selectedGovernorate !== 'الكل'
                          ? 'لا توجد نتائج مطابقة لهذا الاسم أو المحافظة'
                          : 'لا توجد طلبات متاحة لهذه الفلاتر، حاول تغيير الحالة أو الفلتر.'}
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder ? (
                  <div className="rounded-[28px] border border-white/10 bg-[#14090f]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-[#c8914f]">تفاصيل الطلب</p>
                      </div>
                      <div className="rounded-2xl border border-[#c8914f]/20 bg-[#c8914f]/10 p-2 text-[#f3ce90]">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm text-[#f2e1d0]">العميل</p>
                        <p className="mt-1 font-semibold text-white">{selectedOrder.customerName}</p>
                        <p className="mt-1 text-sm text-[#f2e1d0]">{selectedOrder.phone}</p>
                        <p className="mt-1 text-sm text-[#f2e1d0]">{selectedOrder.address}</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-[#f2e1d0]">تفاصيل الشحن</p>
                            <p className="mt-1 text-sm text-[#f2e1d0]">نسخ بيانات العميل بسرعة لخدمة التوصيل.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyShippingDetails(selectedOrder)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#8b1f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a32648]"
                          >
                            <Copy className="h-4 w-4" /> نسخ تفاصيل الشحن
                          </button>
                        </div>
                        {copyMessage && <p className="mt-3 text-sm text-[#c8914f]">{copyMessage}</p>}
                      </div>

                      <div>
                        <p className="text-sm text-[#f2e1d0]">المشتريات</p>
                        <div className="mt-3 space-y-2">
                          {selectedOrder.items.map((item, index) => (
                            <div key={`${selectedOrder.id}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                              <div>
                                <p className="font-medium text-white">{item.name}</p>
                                <p className="text-sm text-[#f2e1d0]">المقاس: {item.size} • الكمية: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-[#f3ce90]">{item.price} ر.س</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm text-[#f2e1d0]">الدفع</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-[#f2e1d0]">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#c8914f]">طريقة الدفع</p>
                            <p className="mt-2 text-white">
                              {getPaymentMethodDisplay(
                                selectedOrder.paymentMethod || (selectedOrder as any).payment_method,
                                selectedOrder.electronicMethod || (selectedOrder as any).electronic_method
                              )}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-[#f2e1d0]">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#c8914f]">حالة الدفع</p>
                            <p
                              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs ${
                                (selectedOrder.paymentMethod || (selectedOrder as any).payment_method || 'الدفع عند الاستلام') === 'الدفع عند الاستلام' || !selectedOrder.paymentStatus
                                  ? 'border-white/10 bg-white/5 text-[#f2e1d0]'
                                  : (paymentStatusClasses[selectedOrder.paymentStatus] ?? 'border-white/10 bg-white/5 text-[#f2e1d0]')
                              }`}
                            >
                              {getPaymentStatusDisplay(
                                selectedOrder.paymentMethod || (selectedOrder as any).payment_method,
                                selectedOrder.paymentStatus || (selectedOrder as any).payment_status
                              )}
                            </p>
                          </div>
                        </div>

                        {selectedOrder.screenshotUrl ? (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                            <p className="text-sm text-[#f2e1d0]">لقطة الشاشة</p>
                            <a href={selectedOrder.screenshotUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#8b1f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a32648]">
                              <Eye className="h-4 w-4" /> عرض الصورة كاملة
                            </a>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-[#f2e1d0]">لا يوجد لقطة شاشة مرفوعة لهذا الطلب.</div>
                        )}

                        <div className="mt-4">
                          <p className="text-sm text-[#f2e1d0]">تحديث حالة الدفع</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {paymentStatusTabs.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updatePaymentStatus(selectedOrder.id, status)}
                                className={`rounded-full border px-3 py-2 text-sm transition ${selectedOrder.paymentStatus === status ? 'border-[#c8914f] bg-[#c8914f]/15 text-[#f3ce90]' : 'border-white/10 text-[#f2e1d0] hover:bg-white/5'}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm text-[#f2e1d0]">تغيير حالة الطلب</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(['جاري التأكيد', 'قيد التجهيز', 'تم الشحن', 'تم التوصيل'] as OrderStatus[]).map((status) => (
                            <button
                              key={status}
                              className={`rounded-full border px-3 py-2 text-sm transition ${selectedOrder.status === status ? 'border-[#c8914f] bg-[#c8914f]/15 text-[#f3ce90]' : 'border-white/10 text-[#f2e1d0] hover:bg-white/5'}`}
                              onClick={() => updateOrderStatus(selectedOrder.id, status)}
                              type="button"
                            >
                              {status}
                            </button>
                          ))}
                        </div>

                        {ordersSectionTab === 'history' && selectedOrder.status === 'تم التوصيل' ? (
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => restoreOrder(selectedOrder.id, 'قيد التجهيز')}
                              className="rounded-full bg-[#8b1f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a32648]"
                            >
                              استعادة الطلب إلى قيد التجهيز
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {ordersSectionTab === 'active' && selectedOrder.status !== 'تم التوصيل' ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-sm text-[#f2e1d0]">تأكيد التسليم</p>
                          <button
                            type="button"
                            onClick={() => requestDeliveryConfirmation(selectedOrder.id)}
                            className="mt-3 rounded-full bg-[#8b1f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a32648]"
                          >
                            وضع الطلب في التاريخ بعد التسليم
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-white/10 bg-[#14090f]/80 p-6 text-center text-sm text-[#f2e1d0] shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                    لا توجد نتائج مطابقة لهذا الكود
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'store' && (
            <section className="mt-6 space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-[#12070d]/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#c8914f]">إدارة المتجر</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">إدارة الأقسام والمنتجات في مكان واحد</h2>
                  </div>
                  <button
                    className="flex items-center gap-2 rounded-full bg-[#8b1f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a32648]"
                    onClick={openAddModal}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة منتج جديد +
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {categoryTabs.map((category) => (
                    <button
                      key={category.key}
                      className={`rounded-full border px-4 py-2 text-sm transition ${selectedCategory === category.key ? 'border-[#c8914f] bg-[#c8914f]/15 text-[#f3ce90]' : 'border-white/10 bg-black/20 text-[#f2e1d0] hover:bg-white/5'}`}
                      onClick={() => setSelectedCategory(category.key)}
                      type="button"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#14090f]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#c8914f]">رأس القسم</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{selectedCollection.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#f2e1d0]">{selectedCollection.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl border border-[#c8914f]/20 bg-[#c8914f]/10 px-3 py-2 text-sm text-[#f3ce90]">تعديل المحتوى</div>
                    <Link
                      to={selectedCategory === 'women' ? '/women' : selectedCategory === 'men' ? '/men' : '/islamic'}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#f2e1d0] transition hover:bg-white/10"
                    >
                      <ExternalLink className="h-4 w-4" /> معاينة الصفحة
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm text-[#f2e1d0]">
                    <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">عنوان القسم</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c8914f]"
                      onChange={(event) => handleCollectionChange(selectedCollection.id, 'title', event.target.value)}
                      value={selectedCollection.title}
                    />
                  </label>

                  <label className="block text-sm text-[#f2e1d0]">
                    <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">وصف القسم</span>
                    <textarea
                      className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c8914f]"
                      onChange={(event) => handleCollectionChange(selectedCollection.id, 'description', event.target.value)}
                      value={selectedCollection.description}
                    />
                  </label>
                </div>
              </div>

              {bestSellerProducts.length > 0 && (
                <div className="mb-8 rounded-[28px] border border-[#c8914f]/30 bg-[#1a0d13]/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#c8914f]">الأكثر مبيعا</p>
                    <span className="rounded-full border border-[#c8914f]/20 bg-[#c8914f]/10 px-3 py-1 text-xs text-[#f3ce90]">{bestSellerProducts.length}/4</span>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {bestSellerProducts.map((product) => (
                      <article key={product.id} className="group relative overflow-hidden rounded-[24px] border border-[#c8914f]/20 bg-[#12070d]/80 p-3">
                        <img alt={product.name} className="h-36 w-full rounded-2xl object-cover" src={product.image} />
                        <div className="mt-3">
                          <h3 className="text-base font-semibold text-white">{product.name}</h3>
                          <p className="mt-1 text-sm text-[#f2e1d0]">{product.price} ر.س</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleBestSeller(product.id, false)}
                          className="mt-3 w-full rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
                        >
                          إزالة من الأكثر مبيعا
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <article key={product.id} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#1a0d13]/90 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#c8914f]/40">
                    <img alt={product.name} className="h-48 w-full object-cover" src={product.image} />
                    <div className="absolute left-4 top-4 flex gap-2">
                      <button
                        className="rounded-full border border-[#c8914f]/30 bg-[#14090f]/90 p-2 text-[#f3ce90] shadow-lg transition hover:scale-105"
                        onClick={() => openEditModal(product)}
                        type="button"
                        title="تعديل"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-full border border-red-400/30 bg-red-500/10 p-2 text-red-200 shadow-lg transition hover:scale-105 hover:bg-red-500/20"
                        onClick={() => setProductToDeleteId(product.id)}
                        type="button"
                        title="حذف"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/product/${product.id}`}
                        className="rounded-full border border-[#c8914f]/30 bg-[#14090f]/90 p-2 text-[#f3ce90] shadow-lg transition hover:scale-105"
                        title="معاينة الصفحة"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8914f]">{product.category}</p>
                          <h3 className="mt-1 text-lg font-semibold text-white">{product.name}</h3>
                        </div>
                        <div className="rounded-full bg-[#8b1f3f]/20 px-3 py-1 text-sm font-semibold text-[#f3ce90]">{product.price} ر.س</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#f2e1d0]">{product.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(product.sizes ?? []).map((size) => (
                          <span key={size} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-[#f2e1d0]">
                            {size}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBestSeller(product.id, true)}
                        className="mt-4 w-full rounded-full border border-[#c8914f]/30 bg-[#c8914f]/10 px-3 py-2 text-sm text-[#f3ce90] transition hover:bg-[#c8914f]/15"
                      >
                        إضافة إلى الأكثر مبيعا
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {productToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#150a10] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white">حذف المنتج</h3>
              <p className="mt-2 text-sm leading-6 text-[#f2e1d0]">هل أنت متأكد من حذف هذا المنتج؟ سيتم إزالته فوراً من المتجر.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => deleteProduct(productToDeleteId)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                نعم، احذف المنتج
              </button>
              <button
                type="button"
                onClick={() => setProductToDeleteId(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f2e1d0] transition hover:bg-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {deliveryConfirmOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#150a10] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white">تأكيد التسليم</h3>
              <p className="mt-2 text-sm leading-6 text-[#f2e1d0]">هل أنت متأكد من أنه تم تسليم هذا الطلب؟ سيتم نقله إلى سجل الطلبات.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={confirmDeliveryStatus}
                className="rounded-full bg-[#8b1f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a32648]"
              >
                نعم، تأكيد التسليم
              </button>
              <button
                type="button"
                onClick={cancelDeliveryConfirmation}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f2e1d0] transition hover:bg-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#150a10] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#c8914f]">{editingProductId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</p>
                <h3 className="mt-1 text-2xl font-semibold text-white">تفاصيل المنتج</h3>
              </div>
              <button className="rounded-full border border-white/10 bg-white/5 p-2 text-[#f2e1d0]" onClick={() => setIsModalOpen(false)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[#f2e1d0]">
                <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">اسم المنتج</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c8914f]"
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                  value={productForm.name}
                />
              </label>

              <label className="block text-sm text-[#f2e1d0]">
                <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">السعر</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c8914f] appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  onChange={(event) => setProductForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                  type="number"
                  value={productForm.price}
                />
              </label>

              <label className="block text-sm text-[#f2e1d0] md:col-span-2">
                <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">الوصف</span>
                <textarea
                  className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c8914f]"
                  onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                  value={productForm.description}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-[#f2e1d0]">
                  <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">رابط الصورة</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c8914f]"
                    onChange={(event) => setProductForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                    value={productForm.imageUrl}
                  />
                </label>

                <label className="block text-sm text-[#f2e1d0]">
                  <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">رفع صورة محلياً</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition file:cursor-pointer file:rounded-full file:border-none file:bg-[#8b1f3f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => handleImageUpload(event)}
                  />
                </label>
              </div>

              {imagePreview ? (
                <div className="md:col-span-2 rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#c8914f]">معاينة الصورة</p>
                  <img src={imagePreview} alt="معاينة المنتج" className="mt-3 h-52 w-full rounded-[24px] object-cover" />
                </div>
              ) : null}

              <div className="block text-sm text-[#f2e1d0] md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">المقاسات المتاحة</span>
                <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-6">
                  {AVAILABLE_SIZE_OPTIONS.map((size) => {
                    const isChecked = productForm.sizes.includes(size);

                    return (
                      <label
                        key={size}
                        className={`flex cursor-pointer items-center justify-center rounded-full border px-2 py-2 text-sm font-medium transition ${
                          isChecked ? 'border-[#c8914f] bg-[#c8914f]/15 text-[#f3ce90]' : 'border-white/10 bg-transparent text-[#f2e1d0] hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setProductForm((prev) => ({
                              ...prev,
                              sizes: isChecked ? prev.sizes.filter((item) => item !== size) : [...prev.sizes, size],
                            }))
                          }
                          className="sr-only"
                        />
                        {size}
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="block text-sm text-[#f2e1d0]">
                <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-[#c8914f]">القسم</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c8914f]"
                  onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value as CategoryKey }))}
                  value={productForm.category}
                >
                  <option value="men">رجالي</option>
                  <option value="women">نسائي</option>
                  <option value="islamic">إسلامي</option>
                </select>
              </label>
            </div>

            {modalError && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {modalError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#f2e1d0]"
                onClick={() => setIsModalOpen(false)}
                type="button"
                disabled={isSavingProduct}
              >
                إلغاء
              </button>
              <button
                className="rounded-full bg-[#8b1f3f] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#a32648] disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
                onClick={saveProduct}
                type="button"
                disabled={isSavingProduct}
              >
                {isSavingProduct && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {isSavingProduct ? 'جارٍ رفع الصورة وحفظ المنتج...' : 'حفظ المنتج'}
              </button>
            </div>
          </div>
        </div>
          )}
        </div>
      )}
    </>
  );
}
