import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';

interface CartItem {
  id: string;
  nameEn: string;
  nameAr: string;
  brandEn: string;
  brandAr: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stockStatus: string; // 'in_stock' | 'out_of_stock' | 'low_stock'
}

export default function CartItem({ item }: { item: CartItem }) {
  const { language, t } = useLanguage();
  const { updateQuantity, removeItem } = useCart();
  
  const name = language === 'ar' ? item.nameAr : item.nameEn;
  const brand = language === 'ar' ? item.brandAr : item.brandEn;
  
  // Stock status from item data
  const stockStatus = item.stockStatus;
  
  // Get stock status text and colors
  const getStockStatusInfo = () => {
    // Handle loading state
    if (stockStatus === 'loading') {
      return {
        text: language === 'ar' ? 'جاري التحميل...' : 'Loading...',
        colors: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      };
    }
    
    // Normalize stock status to handle different formats
    const normalizedStatus = stockStatus.toLowerCase().replace(/\s+/g, '_');
    
    switch (normalizedStatus) {
      case 'in_stock':
        return {
          text: language === 'ar' ? 'متوفر' : 'In Stock',
          colors: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'low_stock':
        return {
          text: language === 'ar' ? 'كمية محدودة' : 'Low Stock',
          colors: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
      case 'out_of_stock':
        return {
          text: language === 'ar' ? 'غير متوفر' : 'Out of Stock',
          colors: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      case 'discontinued':
        return {
          text: language === 'ar' ? 'متوقف' : 'Discontinued',
          colors: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
      default:
        return {
          text: language === 'ar' ? 'متوفر' : 'In Stock',
          colors: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
    }
  };
  
  const stockInfo = getStockStatusInfo();
  
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 flex gap-4 transition-colors ${language === 'ar' ? 'text-right' : ''}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <img
        src={item.imageUrl}
        alt={name}
        className="w-20 h-20 object-cover rounded"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyNUMzMS43MTYgMjUgMjUgMzEuNzE2IDI1IDQwQzI1IDQ4LjI4NCAzMS43MTYgNTUgNDAgNTVDNDguMjg0IDU1IDU1IDQ4LjI4NCA1NSA0MEM1NSAzMS43MTYgNDguMjg0IDI1IDQwIDI1WiIgZmlsbD0iI0QxRDFENSIvPgo8L3N2Zz4K';
        }}
      />
      
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
          <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{name}</h3>
          {/* Stock Status Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap self-start sm:self-auto ${
            stockInfo.colors
          }`}>
            {stockInfo.text}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{brand}</p>
        <p className="text-gray-600 dark:text-gray-400">Size: {item.size}</p>
        <p className="text-purple-600 dark:text-purple-400 font-semibold">{item.price} EGP</p>
      </div>
      
      <div className="flex flex-col gap-2">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              item.quantity <= 1
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            }`}
          >
            -
          </button>
          <span className="text-gray-900 dark:text-white w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.size, Math.min(99, item.quantity + 1))}
            disabled={item.quantity >= 99}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              item.quantity >= 99
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            }`}
          >
            +
          </button>
        </div>
        
        {/* Remove Button */}
        <button
          onClick={() => removeItem(item.id, item.size)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
        >
          {t('cart.remove')}
        </button>
        
        {/* Total Price */}
        <div className="text-gray-900 dark:text-white font-semibold text-right">
          {item.price * item.quantity} EGP
        </div>
      </div>
    </div>
  );
}
