'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

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
  clearWishlist: () => void;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
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

      if (data.success && data.wishlist) {
        setWishlistItems(data.wishlist.items || []);
        setWishlistCount(data.wishlist.totalItems || 0);
      } else {
        // If no wishlist exists or failed to fetch, initialize empty wishlist
        setWishlistItems([]);
        setWishlistCount(0);
        if (!data.success) {
          console.error('Failed to fetch wishlist:', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      alert('Please login to add items to wishlist');
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
        return true;
      } else {
        if (data.message === 'Item already in wishlist') {
          alert('Item is already in your wishlist');
        } else {
          alert(data.message || 'Failed to add item to wishlist');
        }
        return false;
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add item to wishlist');
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
      const response = await makeAuthenticatedRequest(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await refreshWishlist();
        return true;
      } else {
        alert(data.message || 'Failed to remove item from wishlist');
        return false;
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
    setWishlistCount(0);
  };

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      // Wishlist API will be implemented later
      console.log('Wishlist: User logged in');
    } else {
      clearWishlist();
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
