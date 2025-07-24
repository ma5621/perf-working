import React, { useState, useEffect, useRef, RefObject } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { listPerfumes, getBrands, getCategories } from '../lib/api';
import { useCart } from '../contexts/CartContext';

import Header from '../components/Header';
import PerfumeCard from '../components/PerfumeCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';

function getColumns() {
  if (window.innerWidth >= 1024) return 4; // lg
  if (window.innerWidth >= 768) return 3;  // md
  if (window.innerWidth >= 640) return 2;  // sm
  return 1;
}

export default function HomePage() {
  const { language, t } = useLanguage();
  const { getItemCount } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedPerfumes, setDisplayedPerfumes] = useState<any[]>([]);
  const [perfumeData, setPerfumeData] = useState<any>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(getColumns());

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Refocus after search results change (including no results)
  useEffect(() => {
    if (!loading && document.activeElement !== searchInputRef.current) {
      searchInputRef.current?.focus();
    }
  }, [displayedPerfumes.length, loading]);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch perfumes
  useEffect(() => {
    const fetchPerfumes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listPerfumes({
          language,
          brandFilter: brandFilter || undefined,
          categoryFilter: categoryFilter || undefined,
          genderFilter: genderFilter || undefined,
          stockStatusFilter: stockStatusFilter || undefined,
          searchTerm: debouncedSearchTerm || undefined,
          page: currentPage,
          limit: 24, 
        });
        
        console.log("Fetched perfume data:", data); // Log the entire data object
        setPerfumeData(data);
        setDisplayedPerfumes(data.perfumes);
      } catch (err) {
        setError("Failed to fetch perfumes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, [language, brandFilter, categoryFilter, genderFilter, stockStatusFilter, debouncedSearchTerm, currentPage]);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands(language);
        setBrands(data);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };
    fetchBrands();
  }, [language]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(language);
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [language]);

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, brandFilter, categoryFilter, genderFilter, stockStatusFilter]);

  // Reset all filters when language changes
  useEffect(() => {
    setBrandFilter('');
    setCategoryFilter('');
    setGenderFilter('');
    setStockStatusFilter('');
  }, [language]);

  // Group perfumes into rows
  const rows = [];
  for (let i = 0; i < displayedPerfumes.length; i += columns) {
    rows.push(displayedPerfumes.slice(i, i + columns));
  }

  const { pagination = { totalItems: 0, totalPages: 1, currentPage: 1, hasNext: false, hasPrev: false } } = perfumeData || {};

  if (loading && displayedPerfumes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e7ef 100%)' }}>
        {
          <svg 
          width="150" 
          height="150" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg" 
          aria-label="Loading spinner in the shape of a perfume bottle spraying">

          <defs>
              <clipPath id="bottle-clip">
                  <rect x="25" y="45" width="50" height="45" rx="8" ry="8"/>
              </clipPath>
              
              <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#718096" stopOpacity="1" />
                  <stop offset="50%" stopColor="#4A5568" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2D3748" stopOpacity="1" />
              </linearGradient>

              <symbol id="perfume-bottle-symbol">
                  <rect x="25" y="45" width="50" height="45" rx="8" ry="8" fill="none" stroke="#4A5568" strokeWidth="3"/>
                  
                  <rect x="30" y="65" width="40" height="20" rx="4" ry="4" fill="#BFDBFE" opacity="0.7">
                      <animate 
                          attributeName="y"
                          values="65; 68; 68; 65; 65"
                          keyTimes="0; 0.15; 0.4; 0.6; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                      <animate 
                          attributeName="height"
                          values="20; 17; 17; 20; 20"
                          keyTimes="0; 0.15; 0.4; 0.6; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </rect>

                  <rect x="15" y="45" width="15" height="45" fill="white" opacity="0.5" clipPath="url(#bottle-clip)">
                      <animateTransform 
                          attributeName="transform"
                          type="translate"
                          values="-10 0; 70 0; 70 0"
                          keyTimes="0; 0.5; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </rect>

                  <path d="M45 45 V 35 H 55 V 45" fill="none" stroke="#4A5568" strokeWidth="2.5"/>

                  <rect x="42" y="30" width="16" height="5" rx="2" ry="2" fill="url(#metalGradient)" stroke="#2D3748" strokeWidth="1.5"/>
                                    <g id="pump">
                      <rect x="38" y="18" width="24" height="12" rx="4" ry="4" 
                            fill="url(#metalGradient)" 
                            stroke="#2D3748" 
                            strokeWidth="1.5"/>
                      <animateTransform 
                          attributeName="transform"
                          type="translate"
                          values="0 0; 0 4; 0 4; 0 0; 0 0"
                          keyTimes="0; 0.15; 0.4; 0.6; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </g>
                  <g id="spray" fill="#60A5FA" stroke="#60A5FA" strokeLinecap="round">
                      <line x1="62" y1="25" x2="72" y2="20" strokeWidth="2" />
                      <line x1="62" y1="25" x2="75" y2="25" strokeWidth="2.5" />
                      <line x1="62" y1="25" x2="72" y2="30" strokeWidth="2" />
                      
                      <circle cx="75" cy="22" r="1.2" stroke="none" />
                      <circle cx="77" cy="28" r="0.9" stroke="none" />
                      <circle cx="71" cy="18" r="0.8" stroke="none" />
                      <circle cx="79" cy="24" r="0.7" stroke="none" />

                      <animate 
                          attributeName="opacity"
                          values="0; 0; 1; 0; 0"
                          keyTimes="0; 0.15; 0.3; 0.5; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                      <animateTransform 
                          attributeName="transform"
                          type="scale"
                          values="0.5; 1.4"
                          keyTimes="0"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </g>
              </symbol>
          </defs>
          
          <g transform="scale(0.85) translate(7.5, 7.5)"> 
          
              <circle cx="50" cy="55" r="48" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round">
                  <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 50 55"
                      to="360 50 55"
                      dur="10s"
                      repeatCount="indefinite"
                  />
              </circle>
                          <g transform="scale(1.25) translate(-10, -10)">
                  <use href="#perfume-bottle-symbol" />
                  <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0 0; 0 0; 0 1; 0 0; 0 0"
                      keyTimes="0; 0.15; 0.25; 0.35; 1"
                      dur="2.5s"
                      repeatCount="indefinite"
                  />
              </g>
              
          </g>
      </svg> 
  }
      
      
{/* <svg 
          width="150" 
          height="150" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg" 
          aria-label="Loading spinner in the shape of a perfume bottle spraying">

          <defs>
              <clipPath id="bottle-clip">
                  <rect x="25" y="45" width="50" height="45" rx="8" ry="8"/>
              </clipPath>
              
              <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#718096" stopOpacity="1" />
                  <stop offset="50%" stopColor="#4A5568" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2D3748" stopOpacity="1" />
              </linearGradient>

              <symbol id="perfume-bottle-symbol">
                  <rect x="25" y="45" width="50" height="45" rx="8" ry="8" fill="none" stroke="#4A5568" strokeWidth="3"/>
                  
                  <rect x="30" y="65" width="40" height="20" rx="4" ry="4" fill="#BFDBFE" opacity="0.7">
                      <animate 
                          attributeName="y"
                          values="65; 68; 65; 65"
                          keyTimes="0; 0.15; 0.3; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                      <animate 
                          attributeName="height"
                          values="20; 17; 20; 20"
                          keyTimes="0; 0.15; 0.3; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </rect>

                  <rect x="15" y="45" width="15" height="45" fill="white" opacity="0.5" clipPath="url(#bottle-clip)">
                      <animateTransform 
                          attributeName="transform"
                          type="translate"
                          values="-10 0; 70 0; 70 0"
                          keyTimes="0; 0.5; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </rect>

                  <path d="M45 45 V 35 H 55 V 45" fill="none" stroke="#4A5568" strokeWidth="2.5"/>

                  <rect x="42" y="30" width="16" height="5" rx="2" ry="2" fill="url(#metalGradient)" stroke="#2D3748" strokeWidth="1.5"/>
                  
                  <g id="pump">
                      <rect x="38" y="18" width="24" height="12" rx="4" ry="4" 
                            fill="url(#metalGradient)" 
                            stroke="#2D3748" 
                            strokeWidth="1.5"/>
                  </g>
                  
                  <path d="M38 24 Q25 22, 15 30" fill="none" stroke="#4A5568" strokeWidth="2.5"/>
                  
                  <g id="spray-bulb">
                      <circle cx="12" cy="32" r="6" 
                              fill="url(#metalGradient)" 
                              stroke="#2D3748" 
                              strokeWidth="1.5"/>
                      <animateTransform 
                          attributeName="transform"
                          type="translate"
                          values="0 0; 1 2; 1 2; 0 0; 0 0"
                          keyTimes="0; 0.15; 0.4; 0.6; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </g>
                  
                  <g id="spray" fill="#60A5FA" stroke="#60A5FA" strokeLinecap="round">
                      <line x1="62" y1="25" x2="67" y2="22" strokeWidth="2">
                          <animate 
                              attributeName="x2"
                              values="67; 67; 72; 67; 67"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                          <animate 
                              attributeName="y2"
                              values="22; 22; 20; 22; 22"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                      </line>
                      <line x1="62" y1="25" x2="68" y2="25" strokeWidth="2.5">
                          <animate 
                              attributeName="x2"
                              values="68; 68; 74; 68; 68"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                      </line>
                      <line x1="62" y1="25" x2="67" y2="28" strokeWidth="2">
                          <animate 
                              attributeName="x2"
                              values="67; 67; 72; 67; 67"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                          <animate 
                              attributeName="y2"
                              values="28; 28; 30; 28; 28"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                      </line>
                      
                      <circle cx="69" cy="23" r="1.2" stroke="none">
                          <animate 
                              attributeName="cx"
                              values="69; 69; 73; 69; 69"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                          <animate 
                              attributeName="cy"
                              values="23; 23; 22; 23; 23"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                      </circle>
                      <circle cx="70" cy="27" r="0.9" stroke="none">
                          <animate 
                              attributeName="cx"
                              values="70; 70; 74; 70; 70"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                          <animate 
                              attributeName="cy"
                              values="27; 27; 28; 27; 27"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                      </circle>
                      <circle cx="68" cy="20" r="0.8" stroke="none">
                          <animate 
                              attributeName="cx"
                              values="68; 68; 71; 68; 68"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                          <animate 
                              attributeName="cy"
                              values="20; 20; 18; 20; 20"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                      </circle>
                      <circle cx="71" cy="25" r="0.7" stroke="none">
                          <animate 
                              attributeName="cx"
                              values="71; 71; 75; 71; 71"
                              keyTimes="0; 0.15; 0.4; 0.7; 1"
                              dur="2.5s"
                              repeatCount="indefinite"
                          />
                      </circle>

                      <animate 
                          attributeName="opacity"
                          values="0; 0; 1; 1; 0"
                          keyTimes="0; 0.15; 0.3; 0.6; 1"
                          dur="2.5s"
                          repeatCount="indefinite"
                      />
                  </g>
              </symbol>
          </defs>
          
          <g transform="scale(0.85) translate(7.5, 7.5)"> 
          
              <circle cx="50" cy="55" r="55" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round">
                  <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 50 55"
                      to="360 50 55"
                      dur="10s"
                      repeatCount="indefinite"
                  />
              </circle>
              
              <g transform="scale(1.25) translate(-10, -10)">
                  <use href="#perfume-bottle-symbol" />
                  <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0 0; 0 0; 0 1; 0 0; 0 0"
                      keyTimes="0; 0.15; 0.25; 0.35; 1"
                      dur="2.5s"
                      repeatCount="indefinite"
                  />
              </g>
              
          </g>
      </svg> */}

    </div>);
}

  

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-xl text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-0 pb-4 bg-white dark:bg-gray-900 transition-colors shadow-md bg-pattern-subtle" style={{marginTop: 0}}>
                <div className="container mx-auto px-4 text-center" style={{marginTop: 0, paddingTop: 0}}>
          {/* <h1 className={`text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-200 mb-2 tracking-tight ${language === 'ar' ? 'font-ruwudu' : ''}`} style={{marginTop: 0, paddingTop: 0}}>{t('home.title')}</h1> */}
          {/* <p className={`text-lg md:text-xl font-bold text-perfume-gold mb-2 shiny-text ${language === 'ar' ? 'font-ruwudu' : ''}`}>{t('home.subtitle')}</p> */}

          <h1 className={`text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-200 mb-2 tracking-tight ${language === 'ar' ? 'font-ruwudu' : ''}`} style={{marginTop: 0, paddingTop: 0}}>{t('home.title')}</h1>
          <p className={`text-lg md:text-xl font-bold mb-2 ${language === 'ar' ? 'font-ruwudu rtl' : 'ltr'}`}>
            {/* Shiny Subtitle */}
            {t('home.subtitle').split("").map((char, index) => (
              <span
                key={index}
                className="shiny-text"
                style={{
                  animationDelay: `${language === 'ar' ? (t('home.subtitle').length - 1 - index) * 0.05 : index * 0.05}s`,
                }}
              >
                {char}
              </span>
            ))}
          </p>
          {/* Search input: always visible */}
          
          {/* Search input: always visible */}
          <div className="max-w-xl mx-auto">
            <form
              className="flex items-center rounded-full border border-[1.5px] border-indigo-300 p-1 bg-white"
              style={{ boxShadow: 'none' }}
              onSubmit={e => { e.preventDefault(); }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('home.search') || 'Search Something...'}
                className={`flex-1 px-4 py-2 rounded-full bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 ${language === 'ar' ? 'text-right' : ''}`}
                style={{ border: 'none', boxShadow: 'none' }}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                className="ml-2 mr-2 px-6 py-2 rounded-full font-semibold text-white"
                style={{ backgroundColor: 'rgb(79,70,229)' }}
              >
                {t('home.searchButton') || 'Search'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <FilterBar
        brands={brands || []}
        categories={categories || []}
        brandFilter={brandFilter}
        setBrandFilter={setBrandFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        stockStatusFilter={stockStatusFilter}
        setStockStatusFilter={setStockStatusFilter}
      />

      {/* Perfume Grid Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="mb-3 text-gray-600 dark:text-gray-400 text-body-base">
            Showing {displayedPerfumes.length} of {pagination.totalItems} perfumes
            {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
          </div>
          {/* Results grid or no results message */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 animate-pulse">
              {Array.from({ length: columns * 2 }).map((_, idx) => (
                <div key={idx} className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-64 w-full" />
              ))}
            </div>
          ) : displayedPerfumes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {displayedPerfumes.map((perfume, idx) => (
                <PerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  indexInRow={idx % columns}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-body-base text-gray-500 dark:text-gray-400">
                {t('home.noResults') || 'No perfumes found matching your criteria.'}
              </p>
            </div>
          )}
          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
          />
        </div>
      </section>
    </div>
  );
}
