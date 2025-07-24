

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FilterBarProps {
  brands: string[];
  categories: string[];
  brandFilter: string;
  setBrandFilter: (brand: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  stockStatusFilter: string;
  setStockStatusFilter: (status: string) => void;
}

export default function FilterBar({
  brands,
  categories,
  brandFilter,
  setBrandFilter,
  categoryFilter,
  setCategoryFilter,
  genderFilter,
  setGenderFilter,
  stockStatusFilter,
  setStockStatusFilter
}: FilterBarProps) {
  const { t, language } = useLanguage();
  
  const genderOptions = language === 'ar'
    ? [
        { value: '', label: t('home.filter.all') },
        { value: 'رجالي', label: t('common.male') },
        { value: 'نسائي', label: t('common.female') },
        { value: 'للجنسين', label: t('common.unisex') }
      ]
    : [
        { value: '', label: t('home.filter.all') },
        { value: 'Male', label: t('common.male') },
        { value: 'Female', label: t('common.female') },
        { value: 'Unisex', label: t('common.unisex') }
      ];

  const stockStatusOptions = language === 'ar'
    ? [
        { value: '', label: t('home.filter.all') },
        { value: 'in_stock', label: 'متوفر' },
        { value: 'low_stock', label: 'كمية محدودة' },
        { value: 'out_of_stock', label: 'غير متوفر' }
      ]
    : [
        { value: '', label: t('home.filter.all') },
        { value: 'in_stock', label: 'In Stock' },
        { value: 'low_stock', label: 'Low Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' }
      ];
  
  return (
    <section className="bg-white dark:bg-gray-800 py-3 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Brand Filter */}
          <div>
            <label className={`block text-gray-900 dark:text-white font-semibold mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
              {t('home.filter.brand')}
            </label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className={`w-full px-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${language === 'ar' ? 'text-right' : ''}`}
            >
              <option value="">{t('home.filter.all')}</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          
          {/* Category Filter */}
          <div>
            <label className={`block text-gray-900 dark:text-white font-semibold mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
              {t('home.filter.category')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full px-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${language === 'ar' ? 'text-right' : ''}`}
            >
              <option value="">{t('home.filter.all')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Gender Filter */}
          <div>
            <label className={`block text-gray-900 dark:text-white font-semibold mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
              {t('home.filter.gender')}
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className={`w-full px-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${language === 'ar' ? 'text-right' : ''}`}
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <label className={`block text-gray-900 dark:text-white font-semibold mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
              {language === 'ar' ? 'حالة المخزون' : 'Stock Status'}
            </label>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className={`w-full px-4 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${language === 'ar' ? 'text-right' : ''}`}
            >
              {stockStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
