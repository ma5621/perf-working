import React, { createContext, useContext, useState, ReactNode } from 'react';
import { setOnUnauthorizedCallback } from '../lib/api'; // Import the new function

interface Admin {
  token: string;
  message: string; // Optional, if you want to store the message
}

interface AdminContextType {
  admin: Admin | null;
  login: (adminData: { message: string; token: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean; // New loading state
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Initialize as true
  
  const login = (adminData: { message: string; token: string }) => {
    setAdmin({ token: adminData.token, message: adminData.message });
    localStorage.setItem('admin_token', adminData.token); // Store just the token
  };
  
  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_token');
  };
  
  // Set the unauthorized callback and check for stored admin on mount
  React.useEffect(() => {
    setOnUnauthorizedCallback(logout); // Set the logout function as the callback

    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      // Re-hydrate admin state with just the token, or fetch full admin data if needed
      setAdmin({ token: storedToken, message: "Logged in" }); // Dummy message
    }
    setIsAuthLoading(false); // Set loading to false after check
  }, []); // Empty dependency array to run only once on mount
  
  return (
    <AdminContext.Provider value={{
      admin,
      login,
      logout,
      isAuthenticated: !!admin,
      isAuthLoading // Provide the new loading state
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
