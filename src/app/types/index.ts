export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: string;
  category: 'women' | 'men' | 'islamic';
  description?: string;
  sizes?: string[];
  colors?: string[];
  thumbnails?: string[];
}

export interface CartItem {
  id: number | string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  size?: string;
  color?: string;
}

export interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'الدفع عند الاستلام' | 'دفع إلكتروني';
export type ElectronicPaymentMethod = 'إنستا باي' | 'فودافون كاش';
export type PaymentStatus = 'جاري الفحص' | 'تم القبول' | 'خطأ في الدفع';

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  total: number;
  status: 'قيد الانتظار' | 'قيد التجهيز' | 'تم الشحن' | 'تم التوصيل';
  createdAt: string;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  electronicMethod?: ElectronicPaymentMethod;
  screenshotUrl?: string;
  paymentStatus: PaymentStatus;
}

export interface CategoryInfo {
  id: string;
  title: string;
  description: string;
}
