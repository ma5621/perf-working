import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getPerfumeById } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import { toast } from 'sonner';
import NotePyramid from '../components/NotePyramid';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [perfume, setPerfume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfume = async () => {
      if (!id) {
        setError(t('product.notFound'));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getPerfumeById(id);
        if (!data || !data.isActive) {
          setError(t('product.notFound'));
          setPerfume(null);
        } else {
          setPerfume(data);
        }
      } catch (err) {
        setError(t('product.fetchError'));
        setPerfume(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="container mx-auto px-4 py-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-start animate-pulse">
            {/* Left: Image Skeleton */}
            <div className="space-y-4 lg:space-y-6 relative lg:flex lg:flex-col lg:items-start w-full">
              <div className="w-full h-96 bg-gray-300 dark:bg-gray-700 rounded-lg" />
              <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
            {/* Right: Details Skeleton */}
            <div className="space-y-4 lg:space-y-6 lg:pl-8 w-full">
              <div className="h-10 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="space-y-3">
                <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded mt-6" />
              <div className="h-10 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded mt-4 mb-6" />
              <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mt-6 mb-1" />
              <div className="h-20 w-full bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 dark:text-red-400 mb-4">{t('common.error')}: {error}</h1>
          <Link to="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
            {t('common.returnHome')}
          </Link>
        </div>
      </div>
    );
  }
  
  if (!perfume) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl text-gray-900 dark:text-white mb-4">{t('product.notFound')}</h1>
          <Link to="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
            {t('common.returnHome')}
          </Link>
        </div>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    if (!perfume || !perfume.isActive) {
      toast.error(t('product.notFound'));
      return;
    }
    if (!selectedSize) {
      toast.error(t('product.selectSizeError'));
      return;
    }
    const sizeInfo = perfume.sizes.find((s: any) => s.size === selectedSize);
    if (!sizeInfo) {
      toast.error(t('cart.sizeRemoved') || 'Selected size is no longer available.');
      return;
    }
    addItem({
      id: perfume.id || perfume._id,
      nameEn: perfume.nameEn,
      nameAr: perfume.nameAr,
      brandEn: perfume.brandEn,
      brandAr: perfume.brandAr,
      size: selectedSize,
      price: sizeInfo.priceEGP,
      quantity,
      imageUrl: perfume.imageUrl
    });
    toast.success(t('cart.added'));
  };
  
  const name = language === 'ar' ? perfume.nameAr : perfume.nameEn;
  const brand = language === 'ar' ? perfume.brandAr : perfume.brandEn;
  const category = language === 'ar' ? perfume.categoryAr : perfume.categoryEn;
  const gender = language === 'ar' ? perfume.genderAr : perfume.genderEn;
  const description = language === 'ar' ? perfume.descriptionAr : perfume.descriptionEn;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-start">
          {/* Left: Image, Notes */}
          <div className="space-y-4 lg:space-y-6 relative lg:flex lg:flex-col lg:items-start">
            {/* Badge overlay */}
            {(perfume.isNew || perfume.isBestseller) && (
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                {perfume.isNew && (
                  <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full shadow-md">
                    {t('home.new')}
                  </span>
                )}
                {perfume.isBestseller && (
                  <span className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-full shadow-md">
                    {t('home.bestseller')}
                  </span>
                )}
              </div>
            )}
            <img
              src={perfume.imageUrl || "https://placehold.co/400x400?text=No+Image"}
              alt={name}
              className="w-full h-96 object-contain rounded-lg shadow-2xl"
            />
            {/* Note Pyramid Example */}
            {(() => {
              // Example accords data for demonstration
              const accords = [
                { name: "woody", color: "#7a4916", width: "100%" },
                { name: "warm spicy", color: "#d95c2b", width: "80%" },
                { name: "aromatic", color: "#5bb3a7", width: "70%" },
                { name: "fresh spicy", color: "#a3d65c", width: "60%" },
                { name: "leather", color: "#a38c7a", width: "50%" },
                { name: "oud", color: "#7a6a5c", width: "40%" },
                { name: "powdery", color: "#e8d8c3", width: "30%" },
                { name: "amber", color: "#e8b16c", width: "20%" },
                { name: "vanilla", color: "#fffec0", width: "15%", textColor: "#000" },
                { name: "rose", color: "#ffb6c1", width: "10%" }
              ];
              return <NotePyramid accords={accords} t={t} language={language} />;
            })()}
          </div>
          {/* Right: Name, Details, Size, Quantity, Add to Cart, Description */}
          <div className="space-y-0 lg:space-y-6 lg:pl-8">
            {/* Product Name */}
            <h1
              className={`text-3xl md:text-4xl font-bold text-gray-900 dark:text-white my-2 ${language === 'ar' ? 'text-right' : 'lg:text-left'}`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {name}
            </h1>
            {/* Product Info */}
            <div className={`space-y-3 text-body-lg ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('product.brand')}:</span>
                <span className="text-gray-900 dark:text-white text-2xl">{brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('product.category')}:</span>
                <span className="text-gray-900 dark:text-white text-2xl">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('product.gender')}:</span>
                <span className="text-gray-900 dark:text-white text-2xl">{gender}</span>
              </div>
            </div>
            {/* Size Selection */}
            <div className={language === 'ar' ? 'text-right' : ''} dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-body-lg">
                {t('product.selectSize')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {perfume.sizes.map((sizeInfo: any) => (
                  <button
                    key={sizeInfo.size}
                    onClick={() => setSelectedSize(sizeInfo.size)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedSize === sizeInfo.size
                        ? 'border-purple-500 bg-purple-500/20 text-gray-900 dark:text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-body-base font-semibold">{sizeInfo.size}</div>
                    <div className="text-lg">{sizeInfo.priceEGP} {t('product.price')}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Quantity */}
            <div className={language === 'ar' ? 'text-right' : ''} dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-body-lg">
                {t('product.quantity')}
              </label>
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-lg font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-8 text-center text-base font-semibold select-none">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-lg font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>
            </div>
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={perfume.stockStatus === 'Out of Stock'}
              className="w-full sm:w-auto max-w-sm mx-auto block py-2.5 px-8 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-base md:text-lg mt-4 mb-6"
              aria-label={t('product.addToCart')}
            >
              {t('product.addToCart')}
            </button>
            {/* Description */}
            <div>
              <h3
                className={`text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-1 ${language === 'ar' ? 'text-right' : ''}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {t('product.description')}
              </h3>
              <p
                className={`text-gray-700 dark:text-gray-300 leading-relaxed text-body-base ${language === 'ar' ? 'text-right' : ''}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}