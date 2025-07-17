'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  total: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = Cookies.get('auth-token') || localStorage.getItem('token');
    const backendUrl = url.startsWith('/api/') ? `http://localhost:5000${url}` : url;
    return fetch(backendUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Fetch cart data from backend
  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/api/cart');
      const data = await response.json();

      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
        setCartCount(data.cart.totalItems || 0);
        setCartTotal(data.cart.totalAmount || 0);
      } else {
        // If no cart exists or failed to fetch, initialize empty cart
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
        if (!data.success) {
          console.error('Failed to fetch cart:', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      alert('Please login to add items to cart');
      return false;
    }

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart();
        return true;
      } else {
        alert(data.message || 'Failed to add item to cart');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart();
        return true;
      } else {
        alert(data.message || 'Failed to remove item from cart');
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/api/cart', {
        method: 'PUT',
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart();
        return true;
      } else {
        alert(data.message || 'Failed to update cart');
        return false;
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
  };

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      clearCart();
    }
  }, [user]);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
