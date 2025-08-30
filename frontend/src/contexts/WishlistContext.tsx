'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistItem {
  id: string;
  productId: string;
  product: any;
  addedAt: Date;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<boolean>;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { showWishlistToast, showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    const token = Cookies.get('auth-token') || localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const backendUrl = url.startsWith('/api/')
      ? `http://localhost:5000${url}`
      : url;

    const response = await fetch(backendUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Token might be expired or invalid
      // Cookies.remove('auth-token');
      // Cookies.remove('user-data');
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // throw new Error('Authentication failed. Please login again.');
    }

    return response;
  };

  // Fetch wishlist data from backend
  const refreshWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/api/wishlist');
      const data = await response.json();

      if (data.success && data.data && data.data.wishlist) {
        // Transform backend data structure to match frontend expectations
        const transformedItems = (data.data.wishlist.items || []).map(
          (item: any) => ({
            id:
              item._id ||
              item.id ||
              `${item.product._id || item.product.id}_${Date.now()}`,
            productId: item.product._id || item.product.id,
            product: {
              ...item.product,
              id: item.product._id || item.product.id,
              inStock: item.product.stockQuantity > 0,
            },
            addedAt: item.addedAt,
          })
        );

        setWishlistItems(transformedItems);
        setWishlistCount(transformedItems.length);
      } else {
        // If no wishlist exists or failed to fetch, initialize empty wishlist
        setWishlistItems([]);
        setWishlistCount(0);
        if (!data.success) {
          console.error('Failed to fetch wishlist:', data.message);
        }
      }
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      // Set empty state on error
      setWishlistItems([]);
      setWishlistCount(0);

      // Show error toast for network issues
      if (
        error.message &&
        (error.message.includes('fetch') || error.message.includes('network'))
      ) {
        showToast({
          message: 'Unable to load wishlist. Please check your connection.',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      showToast({
        message: 'Please login to add items to wishlist',
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
      const response = await makeAuthenticatedRequest('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshWishlist();
        showWishlistToast('Item added to wishlist!');
        return true;
      } else {
        if (data.message === 'Product already in wishlist') {
          showToast({
            message: 'Item is already in your wishlist',
            type: 'info',
            action: {
              label: 'View Wishlist',
              onClick: () => (window.location.href = '/wishlist'),
            },
          });
        } else {
          showToast({
            message: data.message || 'Failed to add item to wishlist',
            type: 'error',
          });
        }
        return false;
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      const errorMessage =
        error.message.includes('authentication') ||
        error.message.includes('login')
          ? 'Please login again to manage your wishlist'
          : 'Failed to add item to wishlist';
      showToast({
        message: errorMessage,
        type: 'error',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest(
        `/api/wishlist/${productId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        await refreshWishlist();
        showToast({
          message: 'Item removed from wishlist',
          type: 'info',
        });
        return true;
      } else {
        showToast({
          message: data.message || 'Failed to remove item from wishlist',
          type: 'error',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      const errorMessage =
        error.message.includes('authentication') ||
        error.message.includes('login')
          ? 'Please login again to manage your wishlist'
          : 'Failed to remove item from wishlist';
      showToast({
        message: errorMessage,
        type: 'error',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(
      (item) =>
        item.productId === productId ||
        item.product?.id === productId ||
        item.product?._id === productId
    );
  };

  // Clear wishlist
  const clearWishlist = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest('/api/wishlist', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setWishlistItems([]);
        setWishlistCount(0);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      // Clear local wishlist state when user logs out
      setWishlistItems([]);
      setWishlistCount(0);
    }
  }, [user]);

  const value = {
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    isLoading,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
