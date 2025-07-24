import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { loginAdmin } from '../lib/api';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, isAuthLoading } = useAdmin(); // Import isAuthLoading
  const { t } = useLanguage();
  
  // Redirect if already authenticated and auth loading is complete
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const adminData = await loginAdmin({ password });
      if (adminData) {
        login(adminData); // Use the admin data returned from Django
        navigate('/admin/dashboard');
        toast.success('Login successful!');
      } else {
        toast.error('Invalid password');
      }
    } catch (error: any) {
      toast.error(`Login failed: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-xl text-gray-900 dark:text-white">Loading authentication...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Should be redirected by useEffect, but as a fallback
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transition-colors">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {t('admin.login')}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('admin.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              placeholder="Enter admin password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded transition-colors"
          >
            {isLoading ? t('common.loading') : t('admin.login')}
          </button>
        </form>
      </div>
    </div>
  );
}
