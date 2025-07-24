import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useLanguage } from "./contexts/LanguageContext";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./styles/globals.css";
import { useEffect } from "react";

// Component to handle scroll to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to top on every route change
    window.scrollTo(0, 0);
    
    // Also try to reset any scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, [pathname]);

  return null;
}

export default function App() {
  const { language } = useLanguage();
  return (
    <Router>
      <ScrollToTop />
      <div
        className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors font-lateef text-body-base`}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}
