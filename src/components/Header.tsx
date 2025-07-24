import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { getItemCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAdminPage = location.pathname.includes('/admin');
  const isHomePage = location.pathname === '/';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
<header className="bg-white dark:bg-gray-900 bg-pattern-subtle z-50 transition-all duration-300 relative">
  {/* Mobile: absolute language and hamburger */}
  <button
    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
    className="absolute top-4 left-4 md:hidden px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-xs font-bold text-gray-800 dark:text-gray-100 shadow-lg hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-1"
    aria-label="Toggle language"
  >
    <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
    {language === 'en' ? 'AR' : 'EN'}
  </button>
  <button
    onClick={toggleMobileMenu}
    className="absolute top-3 right-3 z-50 md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
  >
    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {isMobileMenuOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>
  {/* Desktop: flex row with title left, nav right */}
  <div className="hidden md:flex container mx-auto px-4 py-3 flex-row items-center justify-between">
    <Link
      to="/"
      className="flex items-center"
      onClick={e => {
        e.preventDefault();
        window.location.href = '/';
      }}
    >
      {isDarkMode ? (
        <img src="/gold-logo.png" alt="Top Notes Logo Dark" className="h-20 w-auto" />
      ) : (
        <img src="/black-logo.png" alt="Top Notes Logo Light" className="h-20 w-auto" />
      )}
    </Link>
    <nav className="flex items-center gap-6">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
      {/* Language Toggle */}
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-all duration-200">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-1 rounded-full text-body-sm font-medium transition-all duration-200 ${
            language === 'en'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ar')}
          className={`px-4 py-1 rounded-full text-body-sm font-medium transition-all duration-200 ${
            language === 'ar'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          AR
        </button>
      </div>
      {/* Navigation Links */}
      {!isAdminPage && (
        <>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-all duration-200 hover:scale-105 text-body-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
              />
            </svg>
            <span>{t('nav.cart')}</span>
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {getItemCount()}
              </span>
            )}
          </Link>
          <Link
            to="/admin"
            className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-200 hover:scale-105 text-body-base"
          >
            {t('nav.admin')}
          </Link>
        </>
      )}
      {isAdminPage && (
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-all duration-200 hover:scale-105 text-body-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>{t('nav.backToStore')}</span>
        </Link>
      )}
    </nav>
  </div>
  {/* Mobile: keep current centered logo and nav hidden on md+ */}
  <div className="container mx-auto px-4 py-3 flex flex-col items-center md:hidden">
    <Link
      to="/"
      className="flex items-center"
      onClick={e => {
        e.preventDefault();
        window.location.href = '/';
      }}
    >
      {isDarkMode ? (
        <img src="/gold-logo.png" alt="Top Notes Logo Dark" className="h-16 w-auto" />
      ) : (
        <img src="/black-logo.png" alt="Top Notes Logo Light" className="h-16 w-auto" />
      )}
    </Link>
  </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 w-[60vw] h-full bg-gray-50 dark:bg-gray-900 shadow-lg z-50 md:hidden
          transition-all duration-500 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        <div className="flex flex-col p-3 gap-3">
          {/* Close Button */}
          <button
            onClick={toggleMobileMenu}
            className="self-end p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 z-60"
            aria-label="Close mobile menu"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
            <span className="text-gray-700 dark:text-gray-300 font-medium text-body-base">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Language Toggle */}
          {/* Remove the language toggle from the mobile menu (inside the mobile menu <div>), but keep the new small button at the top left. */}

          {/* Navigation Links */}
          {!isAdminPage && (
            <>
              <Link
                to="/cart"
                className="relative flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-all duration-200 text-body-base"
                onClick={toggleMobileMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
                  />
                </svg>
                <span>{t('nav.cart')}</span>
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              <Link
                to="/admin"
                className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-all duration-200 text-body-base"
                onClick={toggleMobileMenu}
              >
                {t('nav.admin')}
              </Link>
            </>
          )}

          {isAdminPage && (
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-all duration-200 text-body-base"
              onClick={toggleMobileMenu}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>{t('nav.backToStore')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </header>
  );
}
