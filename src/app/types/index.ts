export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: string;
  isBestSeller?: boolean;
  category: 'women' | 'men' | 'islamic';
  description?: string;
  sizes?: string[];
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
  productId?: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'الإسماعيلية',
  'بورسعيد',
  'السويس',
  'دمياط',
  'المنيا',
  'بني سويف',
  'الفيوم',
  'أسيوط',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'الوادى الجديد',
  'البحر الأحمر',
  'الأقصر',
  'أسوان',
  'قنا',
  'سوهاج',
] as const;

export type EgyptianGovernorate = (typeof EGYPTIAN_GOVERNORATES)[number];

export interface CustomerOrderPayload {
  fullName: string;
  phone: string;
  governorate: string;
  address: string;
  notes?: string;
}

export type OrderStatus =
  | 'جاري التأكيد'
  | 'تم التأكيد'
  | 'قيد التجهيز'
  | 'تم الشحن'
  | 'تم التوصيل'
  | 'قيد الانتظار';

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'جاري التأكيد',
  'تم التأكيد',
  'قيد التجهيز',
  'تم الشحن',
  'تم التوصيل',
];

export const normalizeOrderStatus = (status?: string | null): OrderStatus => {
  switch (status) {
    case 'قيد الانتظار':
    case 'جاري التأكيد':
      return 'جاري التأكيد';
    case 'تم التأكيد':
      return 'تم التأكيد';
    case 'قيد التجهيز':
      return 'قيد التجهيز';
    case 'تم الشحن':
      return 'تم الشحن';
    case 'تم التوصيل':
      return 'تم التوصيل';
    default:
      return 'جاري التأكيد';
  }
};

export type PaymentMethod = 'الدفع عند الاستلام' | 'دفع إلكتروني';
export type ElectronicPaymentMethod = 'إنستا باي' | 'فودافون كاش';
export type PaymentStatus = 'جاري الفحص' | 'تم القبول' | 'خطأ في الدفع';

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  governorate?: string;
  address: string;
  notes?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  userId?: string;
  items: OrderItem[];
  paymentMethod?: PaymentMethod;
  electronicMethod?: ElectronicPaymentMethod;
  screenshotUrl?: string;
  paymentStatus?: PaymentStatus;
}

export interface CategoryInfo {
  id: string;
  title: string;
  description: string;
}

