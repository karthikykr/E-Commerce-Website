import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export const useAdminAPI = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5001/api/admin${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Dashboard APIs
  const getDashboardStats = useCallback(async () => {
    return apiCall('/dashboard/stats');
  }, [apiCall]);

  const getDashboardCharts = useCallback(async (period: string = '7d') => {
    return apiCall(`/dashboard/charts?period=${period}`);
  }, [apiCall]);

  const getRecentActivity = useCallback(async (limit: number = 20) => {
    return apiCall(`/recent-activity?limit=${limit}`);
  }, [apiCall]);

  // User Management APIs
  const getUsers = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return apiCall(`/users?${queryParams.toString()}`);
  }, [apiCall]);

  const getUserDetails = useCallback(async (userId: string) => {
    return apiCall(`/users/${userId}`);
  }, [apiCall]);

  const updateUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    return apiCall(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }, [apiCall]);

  // Product Management APIs
  const getProducts = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return apiCall(`/products?${queryParams.toString()}`);
  }, [apiCall]);

  const getProductDetails = useCallback(async (productId: string) => {
    return apiCall(`/products/${productId}`);
  }, [apiCall]);

  const createProduct = useCallback(async (productData: any) => {
    return apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }, [apiCall]);

  const updateProduct = useCallback(async (productId: string, productData: any) => {
    return apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }, [apiCall]);

  const deleteProduct = useCallback(async (productId: string) => {
    return apiCall(`/products/${productId}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const updateProductStock = useCallback(async (productId: string, stockQuantity: number) => {
    return apiCall(`/products/${productId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stockQuantity }),
    });
  }, [apiCall]);

  // Order Management APIs
  const getOrders = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return apiCall(`/orders?${queryParams.toString()}`);
  }, [apiCall]);

  const getOrderDetails = useCallback(async (orderId: string) => {
    return apiCall(`/orders/${orderId}`);
  }, [apiCall]);

  const updateOrderStatus = useCallback(async (
    orderId: string, 
    orderStatus: string, 
    trackingNumber?: string, 
    notes?: string
  ) => {
    return apiCall(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus, trackingNumber, notes }),
    });
  }, [apiCall]);

  const getOrderStats = useCallback(async (period: string = '30d') => {
    return apiCall(`/orders/stats/summary?period=${period}`);
  }, [apiCall]);

  const processRefund = useCallback(async (
    orderId: string, 
    amount: number, 
    reason: string, 
    refundMethod?: string
  ) => {
    return apiCall(`/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason, refundMethod }),
    });
  }, [apiCall]);

  // Category Management APIs
  const getCategories = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    return apiCall(`/categories?${queryParams.toString()}`);
  }, [apiCall]);

  const getCategoryDetails = useCallback(async (categoryId: string) => {
    return apiCall(`/categories/${categoryId}`);
  }, [apiCall]);

  const createCategory = useCallback(async (categoryData: any) => {
    return apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }, [apiCall]);

  const updateCategory = useCallback(async (categoryId: string, categoryData: any) => {
    return apiCall(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }, [apiCall]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    return apiCall(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const toggleCategoryStatus = useCallback(async (categoryId: string) => {
    return apiCall(`/categories/${categoryId}/toggle-status`, {
      method: 'PUT',
    });
  }, [apiCall]);

  const reorderCategories = useCallback(async (categories: Array<{id: string, sortOrder: number}>) => {
    return apiCall('/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ categories }),
    });
  }, [apiCall]);

  return {
    loading,
    error,
    // Dashboard
    getDashboardStats,
    getDashboardCharts,
    getRecentActivity,
    // Users
    getUsers,
    getUserDetails,
    updateUserStatus,
    // Products
    getProducts,
    getProductDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    // Orders
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    getOrderStats,
    processRefund,
    // Categories
    getCategories,
    getCategoryDetails,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    reorderCategories,
  };
};

export default useAdminAPI;
