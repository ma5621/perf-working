import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CartItem {
  id: string;
  nameEn: string;
  nameAr: string;
  brandEn: string;
  brandAr: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  updateItemPrice: (id: string, size: string, newPrice: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // On initialization, load cart from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // On cart update, save to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  const addItem = (newItem: CartItem) => {
    const id = (newItem as any).id || (newItem as any)._id;
    if (!id) return; // Do not add items without a valid ID
    const itemToAdd = { ...newItem, id };
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.id === itemToAdd.id && item.size === itemToAdd.size
      );
      
      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += itemToAdd.quantity;
        return updatedItems;
      } else {
        return [...prevItems, itemToAdd];
      }
    });
  };
  
  const removeItem = (id: string, size: string) => {
    setItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.size === size))
    );
  };
  
  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
  };
  
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Add a method to update the price of a cart item
  const updateItemPrice = (id: string, size: string, newPrice: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.size === size
          ? { ...item, price: newPrice }
          : item
      )
    );
  };
  
  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getItemCount,
      updateItemPrice // add this
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
