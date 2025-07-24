import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface PerfumeCardProps {
  perfume: {
    id?: string;
    _id?: string;
    nameEn: string;
    nameAr: string;
    brandEn: string;
    brandAr: string;
    categoryEn: string;
    categoryAr: string;
    genderEn: string;
    genderAr: string;
    descriptionEn: string;
    descriptionAr: string;
    sizes: Array<{
      size: string;
      priceEGP: number;
    }>;
    stockStatus: string;
    imageUrl: string;
    isNew: boolean;
    isBestseller: boolean;
    isActive: boolean;
  };
  indexInRow?: number;
}

export default function PerfumeCard({ perfume, indexInRow = 0 }: PerfumeCardProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), indexInRow * 220); // 180ms delay لكل كارت في الصف
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [indexInRow]);

  if (!perfume.id && !perfume._id) {
    return null;
  }

  const name = language === 'ar' ? perfume.nameAr : perfume.nameEn;
  const brand = language === 'ar' ? perfume.brandAr : perfume.brandEn;
  const category = language === 'ar' ? perfume.categoryAr : perfume.categoryEn;
  const description = language === 'ar' ? perfume.descriptionAr : perfume.descriptionEn;

  const minPrice = Math.min(...perfume.sizes.map(s => s.priceEGP));
  const maxPrice = Math.max(...perfume.sizes.map(s => s.priceEGP));
  const priceDisplay = minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`;

  const getPerfumeId = () => perfume.id || perfume._id;
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent navigation if the click is on the button
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    const perfumeId = getPerfumeId();
    console.log("Attempting to view details for perfume ID:", perfumeId); // Log the ID
    navigate(`/product/${perfumeId}`);
  };

  return (
    <div
      ref={cardRef}
      className={`card-animate${visible ? ' visible' : ''} cursor-pointer bg-[#fdf8f0] border-2 border-[#4b2e2b] rounded-2xl overflow-hidden flex flex-col h-full text-left transition-all duration-300 hover:scale-105`}
      onClick={handleCardClick}
    >
      <div className={perfume.stockStatus === 'Out of Stock' ? 'opacity-70' : ''}>
        {/* Image Container */}
        <div className="relative">
          <img
            src={perfume.imageUrl || "https://placehold.co/300x300?text=No+Image"}
            alt={name}
            className="w-full h-48 object-contain bg-white"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/300x300?text=No+Image";
              e.currentTarget.onerror = null; // prevents infinite loop
            }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {perfume.isNew && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                {t('home.new')}
              </span>
            )}
            {perfume.isBestseller && (
              <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                {t('home.bestseller')}
              </span>
            )}
          </div>

          {/* Stock Status Overlay */}
          {perfume.stockStatus === 'Out of Stock' && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-red-500 text-lg font-bold px-4 py-2 rounded-lg border-2 border-red-500">
                {t('home.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-4 flex flex-col flex-grow ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="flex-grow">
            <h3 className="font-bold text-base text-[#4b2e2b]">{name}</h3>
            <p className="text-xs text-gray-500 mt-1">{brand}</p>
            <p className="text-xs italic text-gray-500">{category}</p>
          </div>
          <div className="mt-2">
            <span className={`text-sm font-bold text-[#4b2e2b] ${
              perfume.stockStatus === 'Out of Stock'
                ? 'text-gray-400 line-through'
                : ''
            }`}>
              {priceDisplay} {t('product.price')}
            </span>
          </div>
          <Link
            to={`/product/${getPerfumeId()}`}
            className="block w-full mt-2 py-2 bg-gold hover:bg-dark-gold text-white text-center font-semibold rounded-lg transition-colors text-sm"
          >
            {t('home.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
}
