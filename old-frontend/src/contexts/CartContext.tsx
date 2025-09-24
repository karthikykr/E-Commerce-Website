'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { showCartToast, showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const token = Cookies.get('auth-token') || localStorage.getItem('token');

    if (!token) {
      throw new Error(
        'Authentication token not available. Please login again.'
      );
    }

    const backendUrl = url.startsWith('/api/')
      ? `http://localhost:5000${url}`
      : url;
    return fetch(backendUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
      // Try backend first for persistent cart data
      const response = await makeAuthenticatedRequest(
        'http://localhost:5000/api/cart'
      );
      const data = await response.json();

      if (data.success && data.data?.cart) {
        // Transform backend data to frontend format
        const transformedItems = data.data.cart.items.map((item: any) => ({
          id: item._id || `${item.product._id}_${Date.now()}`,
          productId: item.product._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price || item.price,
            images: item.product.images || [],
            stockQuantity: item.product.stockQuantity,
          },
          quantity: item.quantity,
          total: (item.product.price || item.price) * item.quantity,
        }));

        setCartItems(transformedItems);
        setCartCount(data.data.cart.totalItems || 0);
        setCartTotal(data.data.cart.totalAmount || 0);
      } else {
        // Initialize empty cart
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    } catch (error) {
      console.error(
        'Backend cart fetch failed, trying frontend fallback:',
        error
      );
      // Fallback to frontend API if backend is not available
      try {
        const fallbackResponse = await makeAuthenticatedRequest('/api/cart');
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.success && fallbackData.cart) {
          setCartItems(fallbackData.cart.items || []);
          setCartCount(fallbackData.cart.totalItems || 0);
          setCartTotal(fallbackData.cart.totalAmount || 0);
        } else {
          setCartItems([]);
          setCartCount(0);
          setCartTotal(0);
        }
      } catch (fallbackError) {
        console.error('Fallback cart fetch failed:', fallbackError);
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add item to cart
  const addToCart = useCallback(
    async (productId: string, quantity: number = 1): Promise<boolean> => {
      if (!user) {
        showToast({
          message: 'Please login to add items to cart',
          type: 'warning',
          action: {
            label: 'Login',
            onClick: () => (window.location.href = '/auth/login'),
          },
        });
        return false;
      }

      try {
        setIsLoading(true);
        // Try backend first
        const response = await makeAuthenticatedRequest(
          'http://localhost:5000/api/cart',
          {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
          }
        );

        const data = await response.json();

        if (data.success) {
          await refreshCart();
          showCartToast(
            `${quantity} item${quantity > 1 ? 's' : ''} added to cart!`
          );
          return true;
        } else {
          showToast({
            message: data.message || 'Failed to add item to cart',
            type: 'error',
          });
          return false;
        }
      } catch (error: any) {
        console.error(
          'Backend add to cart failed, trying frontend fallback:',
          error
        );
        // Fallback to frontend API
        try {
          const fallbackResponse = await makeAuthenticatedRequest('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
          });

          const fallbackData = await fallbackResponse.json();

          if (fallbackData.success) {
            await refreshCart();
            showCartToast(
              `${quantity} item${quantity > 1 ? 's' : ''} added to cart!`
            );
            return true;
          } else {
            throw new Error(
              fallbackData.message || 'Failed to add item to cart'
            );
          }
        } catch (fallbackError: any) {
          console.error('Fallback add to cart failed:', fallbackError);
          const errorMessage = fallbackError.message.includes('token')
            ? 'Please login again to add items to cart'
            : 'Failed to add item to cart';
          showToast({
            message: errorMessage,
            type: 'error',
          });
          return false;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, showToast, showCartToast, refreshCart]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user) {
        showToast({
          message: 'Please login to manage your cart',
          type: 'error',
        });
        return false;
      }

      try {
        setIsLoading(true);
        // Try backend first
        const response = await makeAuthenticatedRequest(
          'http://localhost:5000/api/cart',
          {
            method: 'DELETE',
            body: JSON.stringify({ productId }),
          }
        );

        const data = await response.json();

        if (data.success) {
          await refreshCart();
          showToast({
            message: 'Item removed from cart successfully',
            type: 'success',
          });
          return true;
        } else {
          showToast({
            message: data.message || 'Failed to remove item from cart',
            type: 'error',
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
          type: 'error',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, showToast, refreshCart]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      if (!user) {
        showToast({
          message: 'Please login to manage your cart',
          type: 'error',
        });
        return false;
      }

      try {
        setIsLoading(true);
        // Try backend first
        const response = await makeAuthenticatedRequest(
          'http://localhost:5000/api/cart',
          {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity }),
          }
        );

        const data = await response.json();

        if (data.success) {
          await refreshCart();
          return true;
        } else {
          showToast({
            message: data.message || 'Failed to update quantity',
            type: 'error',
          });
          return false;
        }
      } catch (error: any) {
        console.error(
          'Backend update quantity failed, trying frontend fallback:',
          error
        );
        // Fallback to frontend API
        try {
          const fallbackResponse = await makeAuthenticatedRequest('/api/cart', {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity }),
          });

          const fallbackData = await fallbackResponse.json();

          if (fallbackData.success) {
            await refreshCart();
            return true;
          } else {
            throw new Error(
              fallbackData.message || 'Failed to update quantity'
            );
          }
        } catch (fallbackError: any) {
          console.error('Fallback update quantity failed:', fallbackError);
          const errorMessage = fallbackError.message.includes('token')
            ? 'Please login again to manage your cart'
            : 'Failed to update quantity';
          showToast({
            message: errorMessage,
            type: 'error',
          });
          return false;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, showToast, refreshCart]
  );

  // Clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      // Try backend first
      const response = await makeAuthenticatedRequest(
        'http://localhost:5000/api/cart/clear',
        {
          method: 'DELETE',
        }
      );

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
      console.error(
        'Backend clear cart failed, trying frontend fallback:',
        error
      );
      // Fallback to frontend API
      try {
        const fallbackResponse = await makeAuthenticatedRequest(
          '/api/cart/clear',
          {
            method: 'DELETE',
          }
        );

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.success) {
          setCartItems([]);
          setCartCount(0);
          setCartTotal(0);
          return true;
        } else {
          return false;
        }
      } catch (fallbackError) {
        console.error('Fallback clear cart failed:', fallbackError);
        return false;
      }
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
