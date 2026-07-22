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

export const PRODUCTS: Product[] = [
  // Women Collection
  {
    id: 'w1',
    name: 'عباءة مطرزة يدوياً',
    subtitle: 'كتان مصري نقي وخيوط ذهبية',
    price: 28500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDALWsdekgugjKpUCyeeXrwcTHNrJkkDZuA-N6XyDW93a8liAcNANSxHMRrdcSZMjEjVfQg1gm1091S-XiTi95n9_JUAQfsh6TB4Sa0-0DbNxwx91hpo8xN5tIPd1dEwSy5rdoJCODbdwEiXynre3ZDZbz8ussspMdoRQksruqw7yRAIJIT5seTq1FDSDxL2OkHsdVoUrMsg4lC_pMZlWTCfWp_BR_JsP_pAApGp2axSG6XAiMV_ifptFp4BSORZzQXJfKYtXG483Vg',
    tag: 'وصل حديثاً',
    category: 'women',
    description: 'عباءة راقية مصممة من الكتان المصري النقي ومطرزة يدوياً بخيوط ذهبية تعكس الأصالة والفخامة.'
  },
  {
    id: 'w2',
    name: 'قفطان تراثي من الحرير',
    subtitle: 'حرير طبيعي بتطريز بورغندي',
    price: 32000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUVLfyShb4cQZnvLpW7Ba9u7EWuX_fa5jzt3nlrr6nr00Nm8k3CsP7EJkEpvwVKoQO2-AUAenp8K9wOzkFNnyKY6SeZO0r8e_dAJYNlSLbPdl9McLEPANNBCnPEfzqp93e_FGEC72YPB-ABDSuKbNzDvxQUvAByO4wfOpINKA0wCR44TyEcEcOUfzzFi5KLpWe4Wgf79zZNPtPIH5oYg_L2EW-_kWjnX0hIUOuyfmxmwEOESx-hLZ_GgewQ97N4ve6P8fDpMxfKZn4',
    category: 'women',
    description: 'قفطان أنيق مصنوع من الحرير الطبيعي الفاخر بتطريزات بورغندي مستوحاة من الفن التراثي الأصيل.'
  },
  {
    id: 'w3',
    name: 'سديري تراثي مهيكل',
    subtitle: 'مزيج صوف منسوج يدوياً',
    price: 19800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAouxGBYzJ_5It1NQLYtSfak2Vw8_dIUHtg7hkiy4tDOmLmGHNxR4k7RyXd2-Jsnu2XZqKZdNpcR54aN2EMiTAe59a7tvuyPDnMqMCEXxnFvyP5L6nr8b-ZdspJmepbAUcj3sGH7hxrgJMRUw6kAlI6v4ctMtuRL6uGyla4pSS6tnffv6oYUWYNmnWgRo5tMhm87iSCJ-BTZzh2Idd8TNEtr1jL2jExrNNeIKeLGnpdFAoUSRXXK4yX9cP9-oATXiQkDzMx8xxzn_uN',
    category: 'women',
    description: 'سديري عصري بتصميم مهيكل يجمع بين مزيج الصوف الفاخر والنسيج اليدوي المتقن.'
  },
  {
    id: 'w4',
    name: 'حقيبة "لوتس" المنسوجة',
    subtitle: 'نسيج يدوي - إصدار محدود',
    price: 12500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWaFiUzF2OuJX_K2PcXx0ao9ScO-l56w4PxqPGdi4pLEwpLMOkM3KVFhSa3fMIURT3eJx7Obp7RDWipsaHyw3W5bmvllgeAWqRHfjRMO24gurFOP5JDBF4kxRUiQuEzRDY8N87VGgaDgdbK4KchFmXjYqn4dSJQqBuJwPYWpQ9cNwMsExZFftRYXqf1Y7J_lP32_JnQR1CwIl8JKr8nuzx7r5oQmrUPNXXoqYoQQG0hoLue7zruLQQ4vaCjUeVFr2MgnXBcC1BNjD6',
    category: 'women',
    description: 'حقيبة فاخرة منسوجة يدوياً بإصدار محدود مستوحاة من زهرة اللوتس الفرعونية.'
  },
  {
    id: 'w5',
    name: 'فستان رمال الكتان',
    subtitle: 'كتان عضوي وتفاصيل حريرية',
    price: 24000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYKOBAp8uWTZ-FYUQOlkHsxSJSHU_9gc9xXzHOutGemOfLPvfpKFlGO-YmQSDmwzQMf_Fv6AJFy5T4yWw0BZmb43FIuL8d5cSH97CbvZXJkeorZfcQoq7ZdRJVJ0FR9NI3foptnll_aDeoJORTydVZ6MidtfltCmXj4SEPneGFEaAM4hyI4VO7A17gexCSvHz0NSIyDv8WSgQ6oZZhOK5J3hdnMO_YDvxTs-_i6Sce9kmmqALsbsUxKXCl_dQHD7HUsP8qmBUi1wl7',
    category: 'women',
    description: 'فستان انسيابي مصنوع من الكتان العضوي بلمسات حريرية ناعمة تناسب الإطلالات الراقية.'
  },
  {
    id: 'w6',
    name: 'ثوب "النجوم" المذهب',
    subtitle: 'مخمل حريري بلمسات ذهبية يدوية',
    price: 45000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxrMWsTmG269xM7wRfU4lAlXLpcZGs7-yOaHfuTVXY49qXQk5gYBqaLJg8snE-i5G89dvPJuwDNMCOcso_VaWdc3ZXQO1Wj_a-PixgQhz7uxWLInfAmajC8Kz4syuaIjub0ml8qLLa9ZT6uwjtdBdOi1rEMA_R_QL1otxiYP2DJPWFCS1u5pxbUlBH-14s7EItrkNi45iGjN2Kh0E_a5l_P4r-hIM1QRQ-o7U0fMxJsH5UDw-BIRSAL_sTwwHZUu_BWi2XL3eHCk3K',
    category: 'women',
    description: 'ثوب مخملي حريري فاخر مزين بلمسات ذهبية يدوية مستوحاة من سماء الليل والتراث الشرقي.'
  },

  // Men Collection
  {
    id: 'm1',
    name: 'عباءة رجالية مطرزة',
    subtitle: 'كتان مصري نقي وتطريز كلاسيكي',
    price: 29500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDALWsdekgugjKpUCyeeXrwcTHNrJkkDZuA-N6XyDW93a8liAcNANSxHMRrdcSZMjEjVfQg1gm1091S-XiTi95n9_JUAQfsh6TB4Sa0-0DbNxwx91hpo8xN5tIPd1dEwSy5rdoJCODbdwEiXynre3ZDZbz8ussspMdoRQksruqw7yRAIJIT5seTq1FDSDxL2OkHsdVoUrMsg4lC_pMZlWTCfWp_BR_JsP_pAApGp2axSG6XAiMV_ifptFp4BSORZzQXJfKYtXG483Vg',
    tag: 'اصدار جديد',
    category: 'men',
    description: 'تصميم رجالي فاخر يدمج الكتان المصري مع الحرير المطرز.'
  },
  {
    id: 'm2',
    name: 'بشت ملكي فاخر',
    subtitle: 'صوف نقي مع زري ذهبي أصلي',
    price: 38000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUVLfyShb4cQZnvLpW7Ba9u7EWuX_fa5jzt3nlrr6nr00Nm8k3CsP7EJkEpvwVKoQO2-AUAenp8K9wOzkFNnyKY6SeZO0r8e_dAJYNlSLbPdl9McLEPANNBCnPEfzqp93e_FGEC72YPB-ABDSuKbNzDvxQUvAByO4wfOpINKA0wCR44TyEcEcOUfzzFi5KLpWe4Wgf79zZNPtPIH5oYg_L2EW-_kWjnX0hIUOuyfmxmwEOESx-hLZ_GgewQ97N4ve6P8fDpMxfKZn4',
    category: 'men',
    description: 'بشت رجالي ملكي مطرز بماء الذهب وحواشي فاخرة.'
  },

  // Islamic Collection
  {
    id: 'i1',
    name: 'ثوب المحراب التراثي',
    subtitle: 'قطن نقي وتطريز هندسي',
    price: 26000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYKOBAp8uWTZ-FYUQOlkHsxSJSHU_9gc9xXzHOutGemOfLPvfpKFlGO-YmQSDmwzQMf_Fv6AJFy5T4yWw0BZmb43FIuL8d5cSH97CbvZXJkeorZfcQoq7ZdRJVJ0FR9NI3foptnll_aDeoJORTydVZ6MidtfltCmXj4SEPneGFEaAM4hyI4VO7A17gexCSvHz0NSIyDv8WSgQ6oZZhOK5J3hdnMO_YDvxTs-_i6Sce9kmmqALsbsUxKXCl_dQHD7HUsP8qmBUi1wl7',
    category: 'islamic',
    description: 'ثوب راقٍ بتطريزات إسلامية هندسية منسوجة بإتقان.'
  },
  {
    id: 'i2',
    name: 'عباءة الحرم التراثية',
    subtitle: 'حرير وكتان مع شال مطرز',
    price: 31000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxrMWsTmG269xM7wRfU4lAlXLpcZGs7-yOaHfuTVXY49qXQk5gYBqaLJg8snE-i5G89dvPJuwDNMCOcso_VaWdc3ZXQO1Wj_a-PixgQhz7uxWLInfAmajC8Kz4syuaIjub0ml8qLLa9ZT6uwjtdBdOi1rEMA_R_QL1otxiYP2DJPWFCS1u5pxbUlBH-14s7EItrkNi45iGjN2Kh0E_a5l_P4r-hIM1QRQ-o7U0fMxJsH5UDw-BIRSAL_sTwwHZUu_BWi2XL3eHCk3K',
    category: 'islamic',
    description: 'عباءة إسلامية مميزة بتطريز شرقي فاخر وشال متناسق.'
  }
];

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
  colors: ['#0B1621', '#5D0F22', '#1A3A3A'],
  thumbnails: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDUsmNrFyiQ0iUnom9BDbKfjW9KNhtAHoH6o42YCGhp8uuLRo66tkhcrxOTeqVY8HJs2_5sFId_P3c5vi9xDNOxbiixAiZkK0cskGmtRHBLaF5RuCS8wbXoOPUsQwI3yqpxFNQLus0B2k-vBM2ciSO74kIw02daloV_8V2yIesfFggXDIqQDaax4IhGA4w7Ahmd_8JMrrxkV9N5W7lThkBvMGQC1OcASIx5VuDRH6r1SSsYN5wV_UZ7a9flg43ul19jk6sx68C3dhua',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDPxYOGR-GTk5akPtvjXs02YnOqykaiJNDv7OYSjm7hmR9bFN5PZisTXMA3EDl3VxxcRP2iKKeDJ4bLVWgZiXByy2WL7xLi_T2EcCz2ADJPsbH0ykEm4WSfaxRXUguyD3WkIuWo7EXRNHrtDT2ZHP3botR_9S_nYWm2NHRaHfKIR5DCetCXye612DQx3sMQV1EYUJ1D2Lq0fmNx_NkEV2FX6jI4Je7jbCmHYu-cVKUjn-HXrTERqQDeKG6lNB3MtEFlzv72oFJSxui2',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDv5mIRNqxIsWKvVMQeMICfh6x6tnbZkkWwFFreVaQo3sHg2xpk_EcCbr5MSkUX7xxetFJVkH9H_G4-4C2FqctlW1KAS1DIRy5o-UzP0e1PCdR_McO2fEDlnmO3CStnHuJKqF0GEYN8yIMUhkUjUSaBqrg2OoNQM3Dz7KdRInS6BR6V6TpOVeWkmO1ng8wQ-YUeUIywyDFS6GnIssx9Bg-be90ThlPijNeWMdiG0zFkBNvMcLRIDDhDGdVnP3CVlQIrCO2bS82z5GsR'
  ]
};
