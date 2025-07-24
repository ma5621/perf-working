import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { createPerfume, updatePerfume } from '../lib/api';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState({
    nameEn: product?.nameEn || '',
    nameAr: product?.nameAr || '',
    brandEn: product?.brandEn || '',
    brandAr: product?.brandAr || '',
    categoryEn: product?.categoryEn || '',
    categoryAr: product?.categoryAr || '',
    genderEn: product?.genderEn || '',
    genderAr: product?.genderAr || '',
    descriptionEn: product?.descriptionEn || '',
    descriptionAr: product?.descriptionAr || '',
    sizes: product?.sizes || [{ size: '', priceEGP: 0 }],
    stockStatus: product?.stockStatus || 'In Stock',
    imageUrl: product?.imageUrl || '',
    isNew: product?.isNew || false,
    isBestseller: product?.isBestseller || false,
    isActive: product?.isActive !== undefined ? product.isActive : true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.nameEn) newErrors.nameEn = 'Required';
    if (!formData.nameAr) newErrors.nameAr = 'مطلوب';
    if (!formData.brandEn) newErrors.brandEn = 'Required';
    if (!formData.brandAr) newErrors.brandAr = 'مطلوب';
    if (!formData.categoryEn) newErrors.categoryEn = 'Required';
    if (!formData.categoryAr) newErrors.categoryAr = 'مطلوب';
    if (!formData.genderEn) newErrors.genderEn = 'Required';
    if (!formData.genderAr) newErrors.genderAr = 'مطلوب';
    if (!formData.descriptionEn) newErrors.descriptionEn = 'Required';
    if (!formData.descriptionAr) newErrors.descriptionAr = 'مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (product) {
        await updatePerfume(product.id || product._id, formData);
        toast.success('Product updated successfully!');
      } else {
        await createPerfume(formData);
        toast.success('Product created successfully!');
      }
      onClose();
    } catch (error: any) {
      toast.error(`Failed to save product: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', priceEGP: 0 }]
    }));
  };
  
  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_: any, i: number) => i !== index)
    }));
  };
  
  const updateSize = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size: any, i: number) => 
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-0 w-full max-w-4xl my-8 transition-colors relative">
        {/* Sticky Header */}
        <div className="absolute top-0 left-0 w-full z-30 bg-white dark:bg-gray-800 rounded-t-lg px-6 pt-6 pb-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {product ? t('admin.editProduct') : t('admin.addProduct')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 px-6 pb-28 pt-24">
          {/* General Info */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.imageUrl')}</label>
                <input type="url" value={formData.imageUrl} onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>
            </div>
          </div>
          {/* Names */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{t('admin.name')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.name')} (EN)</label>
                <input type="text" value={formData.nameEn} onChange={e => setFormData(prev => ({ ...prev, nameEn: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.nameEn ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`} placeholder="Type the English name..." required />
                {errors.nameEn && <span className="text-xs text-red-500">{errors.nameEn}</span>}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-right">{language === 'ar' ? 'الاسم - باللغة العربية' : t('admin.name') + ' (AR)'}</label>
                <input type="text" value={formData.nameAr} onChange={e => setFormData(prev => ({ ...prev, nameAr: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.nameAr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right`} placeholder="اكتب الاسم بالعربية..." required dir="rtl" />
                {errors.nameAr && <span className="text-xs text-red-500 block text-right">{errors.nameAr}</span>}
              </div>
            </div>
          </div>
          {/* Brand & Category */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{t('admin.brand')} & {t('admin.category')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.brand')} (EN)</label>
                <input type="text" value={formData.brandEn} onChange={e => setFormData(prev => ({ ...prev, brandEn: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.brandEn ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`} placeholder="Type the English brand..." required />
                <span className="text-xs text-gray-400">Use existing brand names if possible to avoid duplicates.</span>
                {errors.brandEn && <span className="text-xs text-red-500">{errors.brandEn}</span>}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-right">{language === 'ar' ? 'الماركة - باللغة العربية' : t('admin.brand') + ' (AR)'}</label>
                <input type="text" value={formData.brandAr} onChange={e => setFormData(prev => ({ ...prev, brandAr: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.brandAr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right`} placeholder="اكتب الماركة بالعربية..." required dir="rtl" />
                <span className="text-xs text-gray-400 block text-right">استخدم اسم ماركة موجودة إن أمكن لتجنب التكرار.</span>
                {errors.brandAr && <span className="text-xs text-red-500 block text-right">{errors.brandAr}</span>}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.category')} (EN)</label>
                <input type="text" value={formData.categoryEn} onChange={e => setFormData(prev => ({ ...prev, categoryEn: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.categoryEn ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`} placeholder="Type the English category..." required />
                <span className="text-xs text-gray-400">Use existing category names if possible to avoid duplicates.</span>
                {errors.categoryEn && <span className="text-xs text-red-500">{errors.categoryEn}</span>}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-right">{language === 'ar' ? 'الفئة - باللغة العربية' : t('admin.category') + ' (AR)'}</label>
                <input type="text" value={formData.categoryAr} onChange={e => setFormData(prev => ({ ...prev, categoryAr: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.categoryAr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right`} placeholder="اكتب الفئة بالعربية..." required dir="rtl" />
                <span className="text-xs text-gray-400 block text-right">استخدم اسم فئة موجودة إن أمكن لتجنب التكرار.</span>
                {errors.categoryAr && <span className="text-xs text-red-500 block text-right">{errors.categoryAr}</span>}
              </div>
            </div>
          </div>
          {/* Gender & Stock */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{t('admin.gender')} & {t('admin.stockStatus')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.gender')} (EN)</label>
                <select value={formData.genderEn} onChange={e => setFormData(prev => ({ ...prev, genderEn: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.genderEn ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </select>
                {errors.genderEn && <span className="text-xs text-red-500">{errors.genderEn}</span>}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-right">{language === 'ar' ? 'الجنس - باللغة العربية' : t('admin.gender') + ' (AR)'}</label>
                <select value={formData.genderAr} onChange={e => setFormData(prev => ({ ...prev, genderAr: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.genderAr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right`} required dir="rtl">
                  <option value="">اختر الجنس</option>
                  <option value="رجالي">رجالي</option>
                  <option value="نسائي">نسائي</option>
                  <option value="للجنسين">للجنسين</option>
                </select>
                {errors.genderAr && <span className="text-xs text-red-500 block text-right">{errors.genderAr}</span>}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.stockStatus')}</label>
                <select value={formData.stockStatus} onChange={e => setFormData(prev => ({ ...prev, stockStatus: e.target.value }))} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{t('admin.description')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.description')} (EN)</label>
                <textarea value={formData.descriptionEn} onChange={e => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.descriptionEn ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24`} placeholder="Type the English description..." required />
                {errors.descriptionEn && <span className="text-xs text-red-500">{errors.descriptionEn}</span>}
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2 text-right">{language === 'ar' ? 'الوصف - باللغة العربية' : t('admin.description') + ' (AR)'}</label>
                <textarea value={formData.descriptionAr} onChange={e => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.descriptionAr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24 text-right`} placeholder="اكتب الوصف بالعربية..." required dir="rtl" />
                {errors.descriptionAr && <span className="text-xs text-red-500 block text-right">{errors.descriptionAr}</span>}
              </div>
            </div>
          </div>
          {/* Sizes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1 flex items-center justify-between">
              {t('admin.sizes')}
              <button type="button" onClick={addSize} className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold">
                {language === 'ar' ? 'اضافة حجم اخر' : 'Add another size'}
              </button>
            </h3>
            <div className="space-y-3">
              {formData.sizes.map((size: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <input type="text" placeholder="Size (e.g., 50ml)" value={size.size} onChange={e => updateSize(index, 'size', e.target.value)} className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                  <input type="number" placeholder="Price (EGP)" value={size.priceEGP} onChange={e => updateSize(index, 'priceEGP', parseInt(e.target.value) || 0)} className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                  {formData.sizes.length > 1 && (
                    <button type="button" onClick={() => removeSize(index)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg w-full sm:w-auto flex items-center gap-1 transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Status Toggles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{language === 'ar' ? 'الحالة' : 'Status'}</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isNew} onChange={e => setFormData(prev => ({ ...prev, isNew: e.target.checked }))} className="toggle-checkbox" />
                <span className="text-gray-900 dark:text-white">{language === 'ar' ? 'منتج جديد' : t('admin.isNew')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isBestseller} onChange={e => setFormData(prev => ({ ...prev, isBestseller: e.target.checked }))} className="toggle-checkbox" />
                <span className="text-gray-900 dark:text-white">{language === 'ar' ? 'الأفضل مبيعا' : t('admin.isBestseller')}</span>
              </label>
            </div>
          </div>
          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{language === 'ar' ? 'الحالة' : 'Status'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-2">{t('admin.isActive')}</label>
                <select value={formData.isActive.toString()} onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          {/* Sticky Footer Actions */}
          <div className="absolute left-0 bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-4 z-30">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded transition-colors w-full flex items-center justify-center gap-2">
              <span className="material-icons" aria-hidden="true">close</span>
              {t('admin.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded transition-colors w-full flex items-center justify-center gap-2">
              <span className="material-icons" aria-hidden="true">save</span>
              {isLoading ? t('common.loading') : t('admin.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
