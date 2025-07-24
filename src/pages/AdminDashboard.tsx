import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { listAllPerfumes, deletePerfume, createPerfume, updatePerfume, getPerfumeById, getSettings, updateSetting, updateAdminPassword } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import ProductForm from '../components/ProductForm';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedPerfumes, setDisplayedPerfumes] = useState<any[]>([]);
  const [perfumeData, setPerfumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [newPassword, setNewPassword] = useState('');
  const [newWhatsappNumber, setNewWhatsappNumber] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, logout, isAuthLoading } = useAdmin(); // Import isAuthLoading
  const { t, language, setLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  // Add sorting state
  const [sortBy, setSortBy] = useState('nameEn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  // Get unique values for filters
  const uniqueBrands = [...new Set(displayedPerfumes.map(p => p.brandEn).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(displayedPerfumes.map(p => p.categoryEn).filter(Boolean))].sort();
  const uniqueStockStatuses = [...new Set(displayedPerfumes.map(p => p.stockStatus).filter(Boolean))].sort();
  const uniqueGenders = [...new Set(displayedPerfumes.map(p => p.genderEn).filter(Boolean))].sort();

  // Sorting function
  const sortedPerfumes = [...displayedPerfumes].sort((a, b) => {
    const aVal = (a[sortBy] || '').toString().toLowerCase();
    const bVal = (b[sortBy] || '').toString().toLowerCase();
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter perfumes based on search term and filters
  const filteredPerfumes = sortedPerfumes.filter(perfume => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      let matchesSearch = false;
      
      if (language === 'ar') {
        // Search in Arabic fields when language is Arabic
        matchesSearch = (
          perfume.nameAr?.toLowerCase().includes(searchLower) ||
          perfume.brandAr?.toLowerCase().includes(searchLower) ||
          perfume.categoryAr?.toLowerCase().includes(searchLower) ||
          perfume.stockStatus?.toLowerCase().includes(searchLower) ||
          // Also search in English fields as fallback
          perfume.nameEn?.toLowerCase().includes(searchLower) ||
          perfume.brandEn?.toLowerCase().includes(searchLower) ||
          perfume.categoryEn?.toLowerCase().includes(searchLower)
        );
      } else {
        // Search in English fields when language is English
        matchesSearch = (
          perfume.nameEn?.toLowerCase().includes(searchLower) ||
          perfume.brandEn?.toLowerCase().includes(searchLower) ||
          perfume.categoryEn?.toLowerCase().includes(searchLower) ||
          perfume.stockStatus?.toLowerCase().includes(searchLower)
        );
      }
      
      if (!matchesSearch) return false;
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(perfume.brandEn)) {
      return false;
    }

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(perfume.categoryEn)) {
      return false;
    }

    // Stock status filter
    if (selectedStockStatuses.length > 0 && !selectedStockStatuses.includes(perfume.stockStatus)) {
      return false;
    }

    // Gender filter
    if (selectedGenders.length > 0 && !selectedGenders.includes(perfume.genderEn)) {
      return false;
    }

    // Active status filter
    if (selectedActiveStatus.length > 0) {
      const isActive = perfume.isActive ? 'Active' : 'Inactive';
      if (!selectedActiveStatus.includes(isActive)) {
        return false;
      }
    }

    return true;
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedStockStatuses([]);
    setSelectedGenders([]);
    setSelectedActiveStatus([]);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedBrands.length > 0 || selectedCategories.length > 0 || 
    selectedStockStatuses.length > 0 || selectedGenders.length > 0 || selectedActiveStatus.length > 0;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Add a helper for fancy sort icons
  const SortIcon = ({ active, order }: { active: boolean; order: 'asc' | 'desc' }) => (
    <span className="inline-block ml-1 align-middle">
      <span className={`block transition-all duration-200 ${active && order === 'asc' ? 'text-indigo-600 scale-110' : 'text-gray-400 dark:text-gray-500 opacity-60'}`}
        style={{ marginBottom: '-2px' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" className="inline" style={{ display: 'inline' }}><polygon points="5,2 9,8 1,8" fill="currentColor" /></svg>
      </span>
      <span className={`block transition-all duration-200 ${active && order === 'desc' ? 'text-indigo-600 scale-110' : 'text-gray-400 dark:text-gray-500 opacity-60'}`}
        style={{ marginTop: '-2px' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" className="inline" style={{ display: 'inline' }}><polygon points="1,2 9,2 5,8" fill="currentColor" /></svg>
      </span>
    </span>
  );

  // Fetch perfumes for admin dashboard
  useEffect(() => {
    const fetchPerfumes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listAllPerfumes({
          page: currentPage,
          limit: 20, // Assuming 20 items per page as per Convex paginationOpts
        });
        setPerfumeData(data);
        setDisplayedPerfumes(data.perfumes);
      } catch (err) {
        setError("Failed to fetch perfumes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) { // Only fetch if authenticated
      fetchPerfumes();
    }
  }, [isAuthenticated, currentPage]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsData = await getSettings();
        setSettings(settingsData);
        setNewWhatsappNumber(settingsData.whatsapp_phone || '');
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  // Redirect if not authenticated
  // Redirect if not authenticated and auth loading is complete
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleDelete = async (id: string) => {
    setAdminError(null);
    setLoading(true);
    try {
      const fresh = await getPerfumeById(id);
      if (!fresh || !fresh.isActive) {
        setAdminError(t('admin.productNotAvailable') || 'This product is no longer available or is inactive.');
        setLoading(false);
        return;
      }
      setProductToDelete(fresh); // Set the product to delete
      setShowDeleteConfirm(true); // Show the confirmation modal
    } catch (error) {
      toast.error(t('admin.deleteProductFailed') || 'Failed to delete product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Settings management functions
  const handleUpdateWhatsappNumber = async () => {
    if (!newWhatsappNumber.trim()) {
      toast.error('WhatsApp number cannot be empty');
      return;
    }
    
    setSettingsLoading(true);
    try {
      await updateSetting('whatsapp_phone', newWhatsappNumber.trim());
      setSettings({ ...settings, whatsapp_phone: newWhatsappNumber.trim() });
      toast.success('WhatsApp number updated successfully!');
    } catch (error) {
      toast.error('Failed to update WhatsApp number');
      console.error(error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      toast.error('Password cannot be empty');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    // Additional security: check for common weak passwords
    const weakPasswords = ['123456', 'password', 'admin', '123123', 'qwerty'];
    if (weakPasswords.includes(newPassword.toLowerCase())) {
      toast.error('Please choose a stronger password');
      return;
    }
    
    setSettingsLoading(true);
    try {
      await updateAdminPassword(newPassword);
      toast.success('Password updated successfully!');
      setNewPassword('');
      // Clear the password field immediately for security
      setTimeout(() => {
        setNewPassword('');
      }, 100);
    } catch (error) {
      toast.error('Failed to update password');
      console.error(error);
    } finally {
      setSettingsLoading(false);
    }
  };
  
  const handleEdit = async (product: any) => {
    setAdminError(null);
    setLoading(true);
    try {
      const id = product.id || product._id;
      const fresh = await getPerfumeById(id);
      if (!fresh) {
        setAdminError(t('admin.productNotAvailable') || 'This product is no longer available.');
        setLoading(false);
        return;
      }
      setEditingProduct(fresh);
      setShowForm(true);
    } catch (err) {
      setAdminError(t('admin.fetchError') || 'Failed to fetch product.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    // Re-fetch perfumes after form submission (create/update)
    const fetchUpdatedPerfumes = async () => {
      try {
        const data = await listAllPerfumes({ page: currentPage, limit: 20 });
        setPerfumeData(data);
        setDisplayedPerfumes(data.perfumes);
      } catch (err) {
        console.error("Failed to re-fetch perfumes after form close:", err);
      }
    };
    fetchUpdatedPerfumes();
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-xl text-gray-900 dark:text-white">Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Should be redirected by useEffect, but as a fallback
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-xl text-gray-900 dark:text-white">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-xl text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (adminError) {
    return (
      <div className="container mx-auto px-4 py-2">
        <div className="bg-red-100 text-red-700 rounded px-4 py-2 mb-4 text-center font-semibold">
          {adminError}
        </div>
      </div>
    );
  }

  const { pagination = { totalItems: 0, totalPages: 1, currentPage: 1, hasNext: false, hasPrev: false } } = perfumeData || {};
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="container mx-auto px-4 py-4 flex flex-col items-start sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Back to Store</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 sm:mt-0">{t('admin.dashboard')}</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-0 w-full sm:w-auto items-end sm:items-center">
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-all duration-200 w-full sm:w-auto justify-center">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-1 rounded-full text-body-sm font-medium transition-all duration-200 w-1/2 sm:w-auto ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                type="button"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-4 py-1 rounded-full text-body-sm font-medium transition-all duration-200 w-1/2 sm:w-auto ${
                  language === 'ar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                type="button"
              >
                AR
              </button>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors w-full sm:w-auto"
            >
              {t('admin.addProduct')}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors w-full sm:w-auto"
            >
              Settings
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Settings Section */}
      {showSettings && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'ar' ? 'إدارة الإعدادات' : 'Settings Management'}
            </h2>
            
            {/* WhatsApp Number Setting */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'رقم واتساب الأعمال' : 'WhatsApp Business Number'}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الرقم الحالي:' : 'Current Number:'} {settings.whatsapp_phone || (language === 'ar' ? 'غير محدد' : 'Not set')}
                  </label>
                  <input
                    type="text"
                    value={newWhatsappNumber}
                    onChange={(e) => setNewWhatsappNumber(e.target.value)}
                    placeholder={language === 'ar' ? "أدخل رقم الواتساب (مثال: +201234567890)" : "Enter WhatsApp number (e.g., +201234567890)"}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  onClick={handleUpdateWhatsappNumber}
                  disabled={settingsLoading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {settingsLoading ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث رقم الواتساب' : 'Update WhatsApp Number')}
                </button>
              </div>
            </div>

            {/* Admin Password Setting */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'كلمة مرور المدير' : 'Admin Password'}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'كلمة مرور جديدة (الحد الأدنى 6 أحرف)' : 'New Password (minimum 6 characters)'}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'ar' ? "أدخل كلمة المرور الجديدة" : "Enter new password"}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleUpdatePassword}
                  disabled={settingsLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {settingsLoading ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
                </button>
              </div>
            </div>

            {/* Close Settings Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                {language === 'ar' ? 'إغلاق الإعدادات' : 'Close Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Table (Desktop View) */}
      <div className="container mx-auto px-4 py-8 hidden md:block">
        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? "البحث في المنتجات..." : "Search products by name, brand, category..."}
                className={`w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${language === 'ar' ? 'text-right' : 'text-left'}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          {(searchTerm || hasActiveFilters) && (
            <div className={`mt-2 text-sm text-gray-600 dark:text-gray-400 text-center ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' 
                ? `تم العثور على ${filteredPerfumes.length} منتج${filteredPerfumes.length !== 1 ? 'ات' : ''}`
                : `Found ${filteredPerfumes.length} product${filteredPerfumes.length !== 1 ? 's' : ''}`
              }
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الفلاتر' : 'Filters'}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {language === 'ar' ? 'مسح الكل' : 'Clear all'}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الماركة' : 'Brand'}
                  </label>
                  <select
                    value={selectedBrands.length > 0 ? selectedBrands[0] : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        setSelectedBrands([value]);
                      } else {
                        setSelectedBrands([]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">{language === 'ar' ? 'اختر الماركة' : 'Select Brand'}</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  {selectedBrands.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {language === 'ar' ? 'محدد:' : 'Selected:'} {selectedBrands.join(', ')}
                      </span>
                      <button
                        onClick={() => setSelectedBrands([])}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Clear'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={selectedCategories.length > 0 ? selectedCategories[0] : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        setSelectedCategories([value]);
                      } else {
                        setSelectedCategories([]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {selectedCategories.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {language === 'ar' ? 'محدد:' : 'Selected:'} {selectedCategories.join(', ')}
                      </span>
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Clear'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Stock Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'حالة المخزون' : 'Stock Status'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueStockStatuses.map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedStockStatuses(prev => 
                          prev.includes(status) 
                            ? prev.filter(s => s !== status)
                            : [...prev, status]
                        )}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          selectedStockStatuses.includes(status)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الجنس' : 'Gender'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueGenders.map(gender => (
                      <button
                        key={gender}
                        onClick={() => setSelectedGenders(prev => 
                          prev.includes(gender) 
                            ? prev.filter(g => g !== gender)
                            : [...prev, gender]
                        )}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          selectedGenders.includes(gender)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Active', 'Inactive'].map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedActiveStatus(prev => 
                          prev.includes(status) 
                            ? prev.filter(s => s !== status)
                            : [...prev, status]
                        )}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          selectedActiveStatus.includes(status)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-colors">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700 transition-colors">
              <tr>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-white cursor-pointer select-none group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition" onClick={() => handleSort('id')} title="Sort ascending/descending">
                  ID <SortIcon active={sortBy === 'id'} order={sortOrder} />
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-white cursor-pointer select-none group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition" onClick={() => handleSort('nameEn')} title="Sort ascending/descending">
                  Name (EN) <SortIcon active={sortBy === 'nameEn'} order={sortOrder} />
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-white cursor-pointer select-none group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition" onClick={() => handleSort('brandEn')} title="Sort ascending/descending">
                  Brand (EN) <SortIcon active={sortBy === 'brandEn'} order={sortOrder} />
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-white cursor-pointer select-none group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition" onClick={() => handleSort('categoryEn')} title="Sort ascending/descending">
                  Category <SortIcon active={sortBy === 'categoryEn'} order={sortOrder} />
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-white cursor-pointer select-none group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition" onClick={() => handleSort('stockStatus')} title="Sort ascending/descending">
                  Stock <SortIcon active={sortBy === 'stockStatus'} order={sortOrder} />
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-white cursor-pointer select-none group hover:bg-indigo-50 dark:hover:bg-indigo-900 transition" onClick={() => handleSort('isActive')} title="Sort ascending/descending">
                  Status <SortIcon active={sortBy === 'isActive'} order={sortOrder} />
                </th>
                <th className="px-4 py-3 text-left text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerfumes.map((perfume) => {
                if (!perfume.id && !perfume._id) return null;
                return (
                  <tr key={perfume.id || perfume._id} className="border-t border-gray-200 dark:border-gray-700 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{perfume.id || perfume._id}</td>
                    <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-300">
                      {language === 'ar' ? perfume.nameAr : perfume.nameEn}
                    </td>
                    <td className="px-4 py-3 font-bold text-pink-700 dark:text-pink-300">
                      {language === 'ar' ? perfume.brandAr : perfume.brandEn}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {language === 'ar' ? perfume.categoryAr : perfume.categoryEn}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        perfume.stockStatus === 'In Stock' ? 'bg-green-600 text-white' : 
                        perfume.stockStatus === 'Low Stock' ? 'bg-yellow-600 text-white' : 
                        'bg-red-600 text-white'
                      }`}>{perfume.stockStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${perfume.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>{perfume.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(perfume)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">Edit</button>
                        <button onClick={() => handleDelete(perfume.id || perfume._id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products List (Mobile View) */}
      <div className="container mx-auto px-1 py-8 md:hidden">
        {/* Search Bar */}
        <div className="mb-4 px-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? "البحث في المنتجات..." : "Search products by name, brand, category..."}
                className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
                hasActiveFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>
          {(searchTerm || hasActiveFilters) && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' 
                ? `تم العثور على ${filteredPerfumes.length} منتج${filteredPerfumes.length !== 1 ? 'ات' : ''}`
                : `Found ${filteredPerfumes.length} product${filteredPerfumes.length !== 1 ? 's' : ''}`
              }
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-4 px-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الفلاتر' : 'Filters'}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {language === 'ar' ? 'مسح الكل' : 'Clear all'}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الماركة' : 'Brand'}
                  </label>
                  <select
                    value={selectedBrands.length > 0 ? selectedBrands[0] : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        setSelectedBrands([value]);
                      } else {
                        setSelectedBrands([]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  >
                    <option value="">{language === 'ar' ? 'اختر الماركة' : 'Select Brand'}</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  {selectedBrands.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {language === 'ar' ? 'محدد:' : 'Selected:'} {selectedBrands.join(', ')}
                      </span>
                      <button
                        onClick={() => setSelectedBrands([])}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Clear'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={selectedCategories.length > 0 ? selectedCategories[0] : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        setSelectedCategories([value]);
                      } else {
                        setSelectedCategories([]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  >
                    <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {selectedCategories.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {language === 'ar' ? 'محدد:' : 'Selected:'} {selectedCategories.join(', ')}
                      </span>
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Clear'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Stock Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'حالة المخزون' : 'Stock Status'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueStockStatuses.map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedStockStatuses(prev => 
                          prev.includes(status) 
                            ? prev.filter(s => s !== status)
                            : [...prev, status]
                        )}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          selectedStockStatuses.includes(status)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الجنس' : 'Gender'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueGenders.map(gender => (
                      <button
                        key={gender}
                        onClick={() => setSelectedGenders(prev => 
                          prev.includes(gender) 
                            ? prev.filter(g => g !== gender)
                            : [...prev, gender]
                        )}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          selectedGenders.includes(gender)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Active', 'Inactive'].map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedActiveStatus(prev => 
                          prev.includes(status) 
                            ? prev.filter(s => s !== status)
                            : [...prev, status]
                        )}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          selectedActiveStatus.includes(status)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-3">
          {filteredPerfumes.map((perfume) => {
            if (!perfume.id && !perfume._id) return null;
            return (
              <div key={perfume.id || perfume._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-colors flex flex-col justify-between">
                <div className="flex gap-3 mb-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={perfume.imageUrl || "https://placehold.co/80x80?text=No+Image"}
                      alt={perfume.nameEn}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/80x80?text=No+Image";
                      }}
                    />
                  </div>
                  {/* Product Info */}
                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white break-words">
                      {language === 'ar' ? perfume.nameAr : perfume.nameEn}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">{language === 'ar' ? 'الماركة:' : 'Brand:'}</span> {language === 'ar' ? perfume.brandAr : perfume.brandEn}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">{language === 'ar' ? 'الفئة:' : 'Category:'}</span> {language === 'ar' ? perfume.categoryAr : perfume.categoryEn}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      perfume.stockStatus === 'In Stock' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : perfume.stockStatus === 'Low Stock'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {perfume.stockStatus}
                    </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      perfume.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {perfume.isActive ? 'Active' : 'Inactive'}
                    </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(perfume)}
                      className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-sm rounded-lg transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(perfume.id || perfume._id)}
                      className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm rounded-lg transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={pagination.currentPage === 1}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!pagination.hasNext}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'تأكيد حذف المنتج' : 'Confirm Delete Product'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' 
                ? `هل أنت متأكد من حذف المنتج "${productToDelete?.nameAr || productToDelete?.nameEn}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the product "${productToDelete?.nameEn}"? This action cannot be undone.`
              }
            </p>
            <div className={`flex gap-3 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await deletePerfume(productToDelete.id || productToDelete._id);
                    toast.success(t('admin.productDeleted') || 'Product deleted successfully!');
                    // Re-fetch perfumes after deletion
                    const data = await listAllPerfumes({ page: currentPage, limit: 20 });
                    setPerfumeData(data);
                    setDisplayedPerfumes(data.perfumes);
                  } catch (error) {
                    toast.error(t('admin.deleteProductFailed') || 'Failed to delete product');
                    console.error(error);
                  } finally {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {language === 'ar' ? 'حذف المنتج' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
