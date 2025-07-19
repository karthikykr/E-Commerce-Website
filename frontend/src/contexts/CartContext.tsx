'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

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
  clearCart: () => Promise<boolean>;
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
  const { showCartToast, showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = Cookies.get('auth-token') || localStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not available. Please login again.');
    }

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
  const refreshCart = useCallback(async () => {
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

      if (data.success && data.data && data.data.cart) {
        setCartItems(data.data.cart.items || []);
        setCartCount(data.data.cart.totalItems || 0);
        setCartTotal(data.data.cart.totalAmount || 0);
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
  }, [user]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      showToast({
        message: 'Please login to add items to cart',
        type: 'warning',
        action: {
          label: 'Login',
          onClick: () => window.location.href = '/auth/login'
        }
      });
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
        showCartToast(`${quantity} item${quantity > 1 ? 's' : ''} added to cart!`);
        return true;
      } else {
        showToast({
          message: data.message || 'Failed to add item to cart',
          type: 'error'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.message.includes('token')
        ? 'Please login again to add items to cart'
        : 'Failed to add item to cart';
      showToast({
        message: errorMessage,
        type: 'error'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast, showCartToast, refreshCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      showToast({
        message: 'Please login to manage your cart',
        type: 'error'
      });
      return false;
    }

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await refreshCart();
        showToast({
          message: 'Item removed from cart successfully',
          type: 'success'
        });
        return true;
      } else {
        showToast({
          message: data.message || 'Failed to remove item from cart',
          type: 'error'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      const errorMessage = error.message.includes('token')
        ? 'Please login again to manage your cart'
        : 'Failed to remove item from cart';
      showToast({
        message: errorMessage,
        type: 'error'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast, refreshCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) {
      showToast({
        message: 'Please login to manage your cart',
        type: 'error'
      });
      return false;
    }

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
        showToast({
          message: data.message || 'Failed to update quantity',
          type: 'error'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      const errorMessage = error.message.includes('token')
        ? 'Please login again to manage your cart'
        : 'Failed to update quantity';
      showToast({
        message: errorMessage,
        type: 'error'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast, refreshCart]);

  // Clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/api/cart/clear', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshCart]);

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      // Clear local cart state when user logs out
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    }
  }, [user, refreshCart]);

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
