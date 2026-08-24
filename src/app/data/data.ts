import { Product, CategoryInfo } from '../types';

export const CATEGORIES: Record<string, CategoryInfo> = {
  women: {
    id: 'women',
    title: 'مجموعة النساء',
    description: 'حيث تلتقي الأصالة بالفخامة المعاصرة. اكتشفي مجموعة منسوجة يدوياً، مستوحاة من التراث المصري العريق ومصممة للمرأة التي تقدر التفاصيل الاستثنائية.'
  },
  men: {
    id: 'men',
    title: 'مجموعة الرجال',
    description: 'الأصالة والفخامة في أبهى صورها. أزياء رجالية راقية مصنوعة يدويًا تعكس الهيبة والوقار مستوحاة من التراث العربي والمصري الأصيل.'
  },
  islamic: {
    id: 'islamic',
    title: 'المجموعة الإسلامية',
    description: 'تصاميم محافظة بلمسات تراثية فاخرة تدمج الحشمة مع الرقي وتناسب كافة المناسبات والأوقات.'
  }
};

export const PRODUCTS: Product[] = [];

export const FEATURED_PRODUCT: Product = {
  id: 'detail-lotus',
  name: 'قفطان "لوتس" المخملي',
  subtitle: 'المجموعة التراثية',
  price: 4500,
  oldPrice: 5200,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApgRgGOrGwfF4g22_BSEc9XNrnEFfkM7tOiKzfUpPqBIULN2JCtQ0x1Jlm7wWa9LTVgFTSKNcCAN1QZT26K1CDHRYU_4X7TSJC0aF1FPXkTY_EoOcfoI8LG5J76bt3WRu5SeZPM14RANJjtEEb9GVoFq5Q9AfXmJBbWBc2RmOtwiXfFtWVw_SmOJPMCxJq1ByoFPEzDyysY_8CD9EQDfet8-CxoTs9seWSUNCmBNmY1JAv3klv79MeQXsssfYUYtvoI6BI0ZjilQrs',
  category: 'women',
  description: 'يجمع قفطان "لوتس" بين فخامة المخمل الإيطالي ودقة التطريز المصري الأصيل. تم استلهام النقوش من جداريات معبد الأقصر، حيث نُفذت يدوياً بخيوط حريرية ذهبية استغرق تطريزها أكثر من ٤٨ ساعة عمل. قطعة خالدة تجسد روح "أثر" في دمج التاريخ بالحداثة.',
  sizes: ['S', 'M', 'L', 'XL'],
  thumbnails: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDUsmNrFyiQ0iUnom9BDbKfjW9KNhtAHoH6o42YCGhp8uuLRo66tkhcrxOTeqVY8HJs2_5sFId_P3c5vi9xDNOxbiixAiZkK0cskGmtRHBLaF5RuCS8wbXoOPUsQwI3yqpxFNQLus0B2k-vBM2ciSO74kIw02daloV_8V2yIesfFggXDIqQDaax4IhGA4w7Ahmd_8JMrrxkV9N5W7lThkBvMGQC1OcASIx5VuDRH6r1SSsYN5wV_UZ7a9flg43ul19jk6sx68C3dhua',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDPxYOGR-GTk5akPtvjXs02YnOqykaiJNDv7OYSjm7hmR9bFN5PZisTXMA3EDl3VxxcRP2iKKeDJ4bLVWgZiXByy2WL7xLi_T2EcCz2ADJPsbH0ykEm4WSfaxRXUguyD3WkIuWo7EXRNHrtDT2ZHP3botR_9S_nYWm2NHRaHfKIR5DCetCXye612DQx3sMQV1EYUJ1D2Lq0fmNx_NkEV2FX6jI4Je7jbCmHYu-cVKUjn-HXrTERqQDeKG6lNB3MtEFlzv72oFJSxui2',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDv5mIRNqxIsWKvVMQeMICfh6x6tnbZkkWwFFreVaQo3sHg2xpk_EcCbr5MSkUX7xxetFJVkH9H_G4-4C2FqctlW1KAS1DIRy5o-UzP0e1PCdR_McO2fEDlnmO3CStnHuJKqF0GEYN8yIMUhkUjUSaBqrg2OoNQM3Dz7KdRInS6BR6V6TpOVeWkmO1ng8wQ-YUeUIywyDFS6GnIssx9Bg-be90ThlPijNeWMdiG0zFkBNvMcLRIDDhDGdVnP3CVlQIrCO2bS82z5GsR'
  ]
};

export const getCatalogProducts = () => PRODUCTS;
export const getCatalogCategories = () => CATEGORIES;

export const updateCategoryInfo = (categoryId: string, updates: Partial<CategoryInfo>) => {
  if (!CATEGORIES[categoryId]) return;
  CATEGORIES[categoryId] = {
    ...CATEGORIES[categoryId],
    ...updates,
  };
};

export const upsertProduct = (product: Product) => {
  const existingIndex = PRODUCTS.findIndex((item) => item.id === product.id);
  if (existingIndex >= 0) {
    PRODUCTS.splice(existingIndex, 1, product);
    return;
  }

  PRODUCTS.unshift(product);
};

