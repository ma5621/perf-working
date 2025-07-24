import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import CartItem from '../components/CartItem';
import { getPerfumeById, getSettings } from '../lib/api';
import { toast } from 'sonner';

// Helper to interpolate variables in translation strings
function interpolate(str: string, vars: Record<string, any>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export default function CartPage() {
  const { t } = useLanguage();
  const { items, getTotalPrice, clearCart, removeItem, updateQuantity, updateItemPrice } = useCart();
  
  const [cartWarnings, setCartWarnings] = useState<{ [id: string]: string }>({});
  const [cartInfoMessage, setCartInfoMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState(() => localStorage.getItem('cartNotes') || '');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('+201234567890'); // Default fallback
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [productStockInfo, setProductStockInfo] = useState<{ [id: string]: string }>({});
  const [latestStockValidation, setLatestStockValidation] = useState<{ [id: string]: string }>({});
  const [stockStatusLoaded, setStockStatusLoaded] = useState(false);
  const { language } = useLanguage();

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        if (settings.whatsapp_phone) {
          setWhatsappNumber(settings.whatsapp_phone);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // Keep the default fallback number
      }
    };
    fetchSettings();
  }, []);

  // Refresh stock status when page becomes visible (user returns from admin panel)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && items.length > 0) {
        refreshStockStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [items.length]);

  useEffect(() => {
    localStorage.setItem('cartNotes', notes);
  }, [notes]);

  useEffect(() => {
    const checkCartItems = async () => {
      const newWarnings: { [id: string]: string } = {};
      const newStockInfo: { [id: string]: string } = {};
      
      for (const item of items) {
        try {
          const product = await getPerfumeById(item.id);
          if (!product || !product.isActive) {
            removeItem(item.id, item.size);
            newWarnings[item.id] = t('cart.productRemoved') || 'This product is no longer available and was removed from your cart.';
            continue;
          }
          
          // Store stock status for this product
          newStockInfo[item.id] = product.stockStatus || 'in_stock';
          
          const sizeInfo = product.sizes.find((s: any) => s.size === item.size);
          if (!sizeInfo) {
            removeItem(item.id, item.size);
            newWarnings[item.id] = t('cart.sizeRemoved') || 'The selected size is no longer available and was removed from your cart.';
            continue;
          }
          if (sizeInfo.priceEGP !== item.price) {
            // Update the price in the cart
            const oldPrice = item.price;
            const newPrice = sizeInfo.priceEGP;
            updateItemPrice(item.id, item.size, newPrice);
            // Show a prominent info banner
            const rawMsg = t('cart.priceChangedMessage');
            const msg = rawMsg !== 'cart.priceChangedMessage'
              ? interpolate(rawMsg, { name: item.nameEn, oldPrice, newPrice })
              : `The price of "${item.nameEn}" has changed from ${oldPrice} EGP to ${newPrice} EGP. Your cart has been updated.`;
            setCartInfoMessage(msg);
          }
        } catch (err) {
          toast.error(t('cart.fetchError') || 'Failed to check cart item.');
        }
      }
      setCartWarnings(newWarnings);
      setProductStockInfo(newStockInfo);
      setLatestStockValidation(newStockInfo);
      setStockStatusLoaded(true);
    };
    
    if (items.length > 0) {
      setStockStatusLoaded(false); // Reset loading state
      checkCartItems();
    } else {
      setStockStatusLoaded(true); // No items, so consider it loaded
    }
  }, []); // Run only on mount, not when items change

  // Extract cart validation logic into a function so it can be reused
  async function validateCartAndUpdate(setWarnings: (w: any) => void, setInfoMessage: (m: string | null) => void): Promise<{ valid: boolean; stockInfo: { [id: string]: string } }> {
    let valid = true;
    const newWarnings: { [id: string]: string } = {};
    const newStockInfo: { [id: string]: string } = {};
    
    for (const item of items) {
      try {
        const product = await getPerfumeById(item.id);
        if (!product || !product.isActive) {
          removeItem(item.id, item.size);
          newWarnings[item.id] = t('cart.productRemoved') || 'This product is no longer available and was removed from your cart.';
          valid = false;
          continue;
        }
        
        // Store stock status for this product
        newStockInfo[item.id] = product.stockStatus || 'in_stock';
        
        const sizeInfo = product.sizes.find((s: any) => s.size === item.size);
        if (!sizeInfo) {
          removeItem(item.id, item.size);
          newWarnings[item.id] = t('cart.sizeRemoved') || 'The selected size is no longer available and was removed from your cart.';
          valid = false;
          continue;
        }
        if (sizeInfo.priceEGP !== item.price) {
          // Update the price in the cart
          const oldPrice = item.price;
          const newPrice = sizeInfo.priceEGP;
          updateItemPrice(item.id, item.size, newPrice);
          // Show a prominent info banner
          const rawMsg = t('cart.priceChangedMessage');
          const msg = rawMsg !== 'cart.priceChangedMessage'
            ? interpolate(rawMsg, { name: item.nameEn, oldPrice, newPrice })
            : `The price of "${item.nameEn}" has changed from ${oldPrice} EGP to ${newPrice} EGP. Your cart has been updated.`;
          setInfoMessage(msg);
          valid = false;
        }
      } catch (err) {
        toast.error(t('cart.fetchError') || 'Failed to check cart item.');
        valid = false;
      }
    }
    setWarnings(newWarnings);
    setProductStockInfo(newStockInfo);
    setLatestStockValidation(newStockInfo);
    return { valid, stockInfo: newStockInfo };
  }

  const generateWhatsAppMessage = () => {
    const message = `Hello! I'd like to order the following perfumes from Top Notes:\n\n${
      items.map(item => 
        `• ${item.nameEn} (${item.brandEn}) - ${item.size} - Qty: ${item.quantity} - ${item.price * item.quantity} EGP`
      ).join('\n')
    }\n\nTotal: ${getTotalPrice()} EGP\n\nThank you!`;
    const notesLabel = language === 'ar' ? 'ملاحظات' : 'Notes:';
    const notesText = notes.trim() ? `\n\n${notesLabel} ${notes.trim()}` : '';
    return encodeURIComponent(message + notesText);
  };
  
  const handleWhatsAppOrder = async () => {
    // Show loading immediately
    setWhatsappLoading(true);
    
    // Validate cart before proceeding
    const { valid, stockInfo } = await validateCartAndUpdate(setCartWarnings, setCartInfoMessage);
    if (!valid) {
      setWhatsappLoading(false);
      return;
    }
    
    // Check for out-of-stock items
    const outOfStockItems = items.filter(item => {
      const stockStatus = stockInfo[item.id];
      const normalizedStatus = stockStatus?.toLowerCase().replace(/\s+/g, '_');
      return normalizedStatus === 'out_of_stock' || normalizedStatus === 'discontinued';
    });
    
    if (outOfStockItems.length > 0) {
      setWhatsappLoading(false);
      
      // Create a clear message about out-of-stock items
      const outOfStockNames = outOfStockItems.map(item => 
        language === 'ar' ? item.nameAr : item.nameEn
      ).join(', ');
      
      const message = language === 'ar' 
        ? `عذراً، المنتجات التالية غير متوفرة حالياً: ${outOfStockNames}. يرجى إزالتها من السلة قبل المتابعة.`
        : `Sorry, the following items are currently out of stock: ${outOfStockNames}. Please remove them from your cart before proceeding.`;
      
      toast.error(message);
      return;
    }
    
    // Fetch latest settings before sending order
    let currentWhatsappNumber = whatsappNumber; // Use current number as fallback
    try {
      const settings = await getSettings();
      if (settings.whatsapp_phone) {
        currentWhatsappNumber = settings.whatsapp_phone; // Use new number directly
        setWhatsappNumber(settings.whatsapp_phone); // Update state for future use
      }
    } catch (error) {
      console.error('Failed to fetch latest settings:', error);
      // Continue with current number
    }
    
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${currentWhatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    setWhatsappLoading(false);
  };
  
  const handleClearCart = () => {
    setShowClearCartConfirm(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setNotes('');
    localStorage.removeItem('cartNotes');
    setShowClearCartConfirm(false);
  };

  const cancelClearCart = () => {
    setShowClearCartConfirm(false);
  };

  // Function to refresh stock status and update latest validation
  const refreshStockStatus = async () => {
    if (items.length === 0) return;
    
    setStockStatusLoaded(false); // Set loading state
    const newStockInfo: { [id: string]: string } = {};
    
    for (const item of items) {
      try {
        const product = await getPerfumeById(item.id);
        if (product && product.isActive) {
          newStockInfo[item.id] = product.stockStatus || 'in_stock';
        }
      } catch (err) {
        console.error('Failed to fetch stock status for item:', item.id);
      }
    }
    
    setProductStockInfo(newStockInfo);
    setLatestStockValidation(newStockInfo);
    setStockStatusLoaded(true);
  };

  // Check if there are any out-of-stock items using the most recent validation
  const hasOutOfStockItems = stockStatusLoaded && items.some(item => {
    // Use latestStockValidation if available, otherwise fall back to productStockInfo
    const stockStatus = latestStockValidation[item.id] || productStockInfo[item.id];
    const normalizedStatus = stockStatus?.toLowerCase().replace(/\s+/g, '_');
    return normalizedStatus === 'out_of_stock' || normalizedStatus === 'discontinued';
  });

  // Remove the full-page loading state for cartCheckLoading
  // Always show the cart UI, and if cartCheckLoading, show a small spinner/message above the cart

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('cart.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">{t('cart.empty')}</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Prominent info banner for cart updates */}
        {cartInfoMessage && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded flex items-center justify-between shadow">
            <span className="font-semibold">{cartInfoMessage}</span>
            <button
              className="ml-4 text-yellow-700 hover:text-yellow-900 font-bold text-xl focus:outline-none"
              onClick={() => setCartInfoMessage(null)}
              aria-label="Dismiss info message"
            >
              ×
            </button>
          </div>
        )}
        <div className={`flex justify-between items-center mb-8 ${t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'flex-row-reverse' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('cart.title')}</h1>
          <button
            onClick={handleClearCart}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            {t('cart.clearCart')}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <React.Fragment key={`${item.id}-${item.size}`}>
                {cartWarnings[item.id] && (
                  <div className="text-sm text-red-600 dark:text-red-400 mb-2">{cartWarnings[item.id]}</div>
                )}
                <CartItem 
                  item={{
                    ...item,
                    stockStatus: stockStatusLoaded 
                      ? (latestStockValidation[item.id] || productStockInfo[item.id] || 'in_stock')
                      : 'loading'
                  }} 
                />
              </React.Fragment>
            ))}
          </div>
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-fit transition-colors" dir={t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'rtl' : 'ltr'}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
            
            {/* Warning for out-of-stock items */}
            {stockStatusLoaded && hasOutOfStockItems && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-800 dark:text-red-300 font-semibold">
                    {language === 'ar' ? 'تحذير' : 'Warning'}
                  </span>
                </div>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  {language === 'ar' 
                    ? 'بعض المنتجات في سلة التسوق غير متوفرة حالياً. يرجى إزالتها قبل المتابعة.'
                    : 'Some items in your cart are currently out of stock. Please remove them before proceeding.'
                  }
                </p>
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className={t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'text-right' : 'text-left'} style={{ flex: 1 }}>
                    {item.nameAr && t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? `${item.nameAr} (${item.size}) x${item.quantity}` : `${item.nameEn} (${item.size}) x${item.quantity}`}
                  </span>
                  <span className={t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'text-left' : 'text-right'} style={{ minWidth: 80 }}>
                    {item.price * item.quantity} EGP
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span className={t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'text-right' : 'text-left'} style={{ flex: 1 }}>{t('cart.total')}:</span>
                <span className={t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'text-left' : 'text-right'} style={{ minWidth: 80 }}>{getTotalPrice()} EGP</span>
              </div>
            </div>
            <div className="space-y-3">
              {/* Fancy Notes Box moved above WhatsApp button */}
              <div className="mb-4">
                <label htmlFor="order-notes" className="block text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {t('cart.notesLabel') || 'Add a note to your order (optional)'}
                </label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('cart.notesPlaceholder') || 'e.g. Please call before delivery, or any special instructions...'}
                  className={`w-full min-h-[60px] max-h-32 px-3 py-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-gray-900/40 text-gray-900 dark:text-white shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-base resize-vertical ${t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'text-right' : ''}`}
                  dir={t('cart.notesLabel') === 'أضف ملاحظة إلى طلبك (اختياري)' ? 'rtl' : 'ltr'}
                  style={{ fontFamily: 'inherit', fontSize: '1rem' }}
                />
              </div>
              <div className="flex gap-3">
                <Link
                  to="/"
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-center"
                >
                  {t('cart.continueShopping') || 'Continue Shopping'}
                </Link>
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={whatsappLoading || hasOutOfStockItems || !stockStatusLoaded}
                  className={`flex-1 py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    whatsappLoading || hasOutOfStockItems || !stockStatusLoaded
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {whatsappLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </>
                  ) : !stockStatusLoaded ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {language === 'ar' ? 'جاري التحقق من المخزون...' : 'Checking Stock...'}
                    </>
                  ) : hasOutOfStockItems ? (
                    language === 'ar' ? 'إزالة المنتجات غير المتوفرة' : 'Remove Out of Stock Items'
                  ) : (
                    t('cart.orderViaWhatsApp')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Clear Cart Confirmation Dialog */}
      {showClearCartConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'تأكيد حذف السلة' : 'Clear Cart Confirmation'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف جميع المنتجات من السلة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to clear your cart? This action cannot be undone.'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelClearCart}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmClearCart}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {language === 'ar' ? 'حذف السلة' : 'Clear Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
