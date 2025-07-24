import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.cart': 'Cart',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.searchButton': 'Search',
    'home.title': 'Top Notes',
    'home.subtitle': 'Luxury Perfume Collection',
    'home.search': 'Search for your perfume...',
    'home.filter.all': 'All',
    'home.filter.brand': 'Brand',
    'home.filter.category': 'Category',
    'home.filter.gender': 'Gender',
    'home.new': 'New',
    'home.bestseller': 'Bestseller',
    'home.inStock': 'In Stock',
    'home.outOfStock': 'Out of Stock',
    'home.viewDetails': 'View Details',
    'home.noResults': 'No perfumes found matching your criteria.',
    
    // Product Page
    'product.addToCart': 'Add to Cart',
    'product.selectSize': 'Select Size',
    'product.quantity': 'Quantity',
    'product.price': 'EGP',
    'product.description': 'Description',
    'product.brand': 'Brand',
    'product.category': 'Category',
    'product.gender': 'Gender',
    'product.mainAccords': 'Main Accords',
    // Accord Names
    'accords.woody': 'Woody',
    'accords.vanilla': 'Vanilla',
    'accords.rose': 'Rose',
    'accords.leather': 'Leather',
    'accords.amber': 'Amber',
    'accords.powdery': 'Powdery',
    'accords.aromatic': 'Aromatic',
    'accords.oud': 'Oud',
    'accords.fresh spicy': 'Fresh Spicy',
    'accords.warm spicy': 'Warm Spicy',
    'accords.sweet': 'Sweet',
    'accords.citrus': 'Citrus',
    'accords.fruity': 'Fruity',
    'accords.floral': 'Floral',
    'accords.green': 'Green',
    'accords.musky': 'Musky',
    'accords.balsamic': 'Balsamic',
    'accords.smoky': 'Smoky',
    'accords.spicy': 'Spicy',
    'accords.fresh': 'Fresh',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.orderViaWhatsApp': 'Order via WhatsApp',
    'cart.clearCart': 'Clear Cart',
    'cart.remove': 'Remove',
    'cart.added': 'Added to cart!',
    'cart.priceChangedMessage': 'The price of "{name}" has changed from {oldPrice} EGP to {newPrice} EGP. Your cart has been updated.',
    'cart.notesLabel': 'Add a note to your order (optional)',
    'cart.notesPlaceholder': 'e.g. Please call before delivery, or any special instructions...',
    
    // Admin
    'admin.login': 'Admin Login',
    'admin.password': 'Password',
    'admin.dashboard': 'Admin Dashboard',
    'admin.addProduct': 'Add Product',
    'admin.editProduct': 'Edit Product',
    'admin.deleteProduct': 'Delete Product',
    'admin.name': 'Name',
    'admin.brand': 'Brand',
    'admin.category': 'Category',
    'admin.gender': 'Gender',
    'admin.description': 'Description',
    'admin.sizes': 'Sizes & Prices',
    'admin.size': 'Size',
    'admin.price': 'Price (EGP)',
    'admin.stockStatus': 'Stock Status',
    'admin.imageUrl': 'Image URL',
    'admin.isNew': 'New Product',
    'admin.isBestseller': 'Bestseller',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.male': 'Male',
    'common.female': 'Female',
    'common.unisex': 'Unisex',
    'product.selectSizeError': 'Please select a size',
    'product.notFound': 'Product not found',
    'product.fetchError': 'Failed to fetch perfume.',
    'common.returnHome': 'Return to Home',
    'admin.loginSuccess': 'Login successful!',
    'admin.invalidPassword': 'Invalid password',
    'admin.loginFailed': 'Login failed',
    'admin.productUpdated': 'Product updated successfully!',
    'admin.productCreated': 'Product created successfully!',
    'admin.saveProductFailed': 'Failed to save product',
    'admin.productDeleted': 'Product deleted successfully!',
    'admin.deleteProductFailed': 'Failed to delete product',
    'admin.sampleDataAdded': 'Sample data added successfully!',
    'admin.sampleDataFailed': 'Failed to add sample data',
    'cart.continueShopping': 'Continue Shopping',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.cart': 'السلة',
    'nav.admin': 'الإدارة',
    
    // Homepage
    'home.searchButton': 'بحث',
    'home.title': 'توب نوتس',
    'home.subtitle': 'مجموعة العطور الفاخرة',
    'home.search': 'ابحث على عطرك ...',
    'home.filter.all': 'الكل',
    'home.filter.brand': 'الماركة',
    'home.filter.category': 'الفئة',
    'home.filter.gender': 'الجنس',
    'home.new': 'جديد',
    'home.bestseller': 'الأكثر مبيعاً',
    'home.inStock': 'متوفر',
    'home.outOfStock': 'غير متوفر',
    'home.viewDetails': 'عرض التفاصيل',
    'home.noResults': 'لم يتم العثور على عطور مطابقة لبحثك',
    
    // Product Page
    'product.addToCart': 'أضف للسلة',
    'product.selectSize': 'اختر الحجم',
    'product.quantity': 'الكمية',
    'product.price': 'جنيه',
    'product.description': 'الوصف',
    'product.brand': 'الماركة',
    'product.category': 'الفئة',
    'product.gender': 'الجنس',
    'product.mainAccords': 'النوتات الرئيسية',
    // Accord Names
    'accords.woody': 'خشبي',
    'accords.warm spicy': 'تابلي دافئ',
    'accords.aromatic': 'أروماتك',
    'accords.fresh spicy': 'تابلي منعش',
    'accords.leather': 'الجلود',
    'accords.oud': 'العود',
    'accords.powdery': 'ناعم',
    'accords.amber': 'العنبر',
    'accords.vanilla': 'الفانيلا',
    'accords.rose': 'ورد',
    'accords.sweet': 'حلو',
    'accords.citrus': 'حمضي',
    'accords.fruity': 'فاكهي',
    'accords.floral': 'زهري',
    'accords.green': 'أخضر',
    'accords.musky': 'مسكي',
    'accords.balsamic': 'بلسمي',
    'accords.smoky': 'مدخن',
    'accords.spicy': 'حار',
    'accords.fresh': 'منعش',
    // --- Additions Based on Fragrantica ---
    'accords.animalic': 'حيواني',
    'accords.white floral': 'زهور بيضاء',
    'accords.earthy': 'ترابي',
    'accords.iris': 'السوسن',
    'accords.aldehydic': 'ألدهيدي',
    'accords.marine': 'بحري',
    'accords.tuberose': 'مسك الروم',
    'accords.tobacco': 'التبغ',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.total': 'المجموع',
    'cart.orderViaWhatsApp': 'اطلب عبر الواتساب',
    'cart.clearCart': 'إفراغ السلة',
    'cart.remove': 'إزالة',
    'cart.added': 'تمت الإضافة إلى السلة!',
    'cart.priceChangedMessage': 'تم تغيير سعر "{name}" من {oldPrice} جنيه إلى {newPrice} جنيه. تم تحديث سلتك.',
    'cart.notesLabel': 'أضف ملاحظة إلى طلبك (اختياري)',
    'cart.notesPlaceholder': 'مثال: يرجى الاتصال قبل التوصيل، أو أي تعليمات خاصة...',
    
    // Admin
    'admin.login': 'تسجيل دخول الإدارة',
    'admin.password': 'كلمة المرور',
    'admin.dashboard': 'لوحة الإدارة',
    'admin.addProduct': 'إضافة منتج',
    'admin.editProduct': 'تعديل المنتج',
    'admin.deleteProduct': 'حذف المنتج',
    'admin.name': 'الاسم',
    'admin.brand': 'الماركة',
    'admin.category': 'الفئة',
    'admin.gender': 'الجنس',
    'admin.description': 'الوصف',
    'admin.sizes': 'الأحجام والأسعار',
    'admin.size': 'الحجم',
    'admin.price': 'السعر (جنيه)',
    'admin.stockStatus': 'حالة المخزون',
    'admin.imageUrl': 'رابط الصورة',
    'admin.isNew': 'منتج جديد',
    'admin.isBestseller': 'الأكثر مبيعاً',
    'admin.save': 'حفظ',
    'admin.cancel': 'إلغاء',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.male': 'رجالي',
    'common.female': 'نسائي',
    'common.unisex': 'للجنسين',
    'product.selectSizeError': 'يرجى اختيار الحجم',
    'product.notFound': 'المنتج غير موجود',
    'product.fetchError': 'فشل في جلب بيانات العطر',
    'common.returnHome': 'العودة للصفحة للرئيسية',
    'admin.loginSuccess': 'تم تسجيل الدخول بنجاح!',
    'admin.invalidPassword': 'كلمة المرور غير صحيحة',
    'admin.loginFailed': 'فشل تسجيل الدخول',
    'admin.productUpdated': 'تم تحديث المنتج بنجاح!',
    'admin.productCreated': 'تم إنشاء المنتج بنجاح!',
    'admin.saveProductFailed': 'فشل في حفظ المنتج',
    'admin.productDeleted': 'تم حذف المنتج بنجاح!',
    'admin.deleteProductFailed': 'فشل في حذف المنتج',
    'admin.sampleDataAdded': 'تم إضافة بيانات تجريبية بنجاح!',
    'admin.sampleDataFailed': 'فشل في إضافة البيانات التجريبية',
    'cart.continueShopping': 'متابعة التسوق',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'en'
  );

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
