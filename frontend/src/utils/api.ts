/**
 * API Configuration and Utilities
 * Centralized API configuration to prevent port mismatches and provide consistent API calls
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout',
    },
    // Product endpoints
    PRODUCTS: {
      LIST: '/api/products',
      DETAIL: (id: string) => `/api/products/${id}`,
      SEARCH: '/api/products/search',
    },
    // Cart endpoints
    CART: {
      GET: '/api/cart',
      ADD: '/api/cart',
      UPDATE: '/api/cart',
      REMOVE: '/api/cart',
      CLEAR: '/api/cart/clear',
    },
    // Wishlist endpoints
    WISHLIST: {
      GET: '/api/wishlist',
      ADD: '/api/wishlist',
      REMOVE: '/api/wishlist',
    },
    // Order endpoints
    ORDERS: {
      LIST: '/api/orders',
      CREATE: '/api/orders',
      DETAIL: (id: string) => `/api/orders/${id}`,
      UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
    },
    // Category endpoints
    CATEGORIES: {
      LIST: '/api/categories',
      DETAIL: (id: string) => `/api/categories/${id}`,
    },
    // Admin endpoints
    ADMIN: {
      DASHBOARD: '/api/admin/dashboard/stats',
      PRODUCTS: {
        LIST: '/api/admin/products',
        CREATE: '/api/admin/products',
        UPDATE: (id: string) => `/api/admin/products/${id}`,
        DELETE: (id: string) => `/api/admin/products/${id}`,
      },
      ORDERS: {
        LIST: '/api/admin/orders',
        UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
      },
      CATEGORIES: {
        LIST: '/api/admin/categories',
        CREATE: '/api/admin/categories',
        UPDATE: (id: string) => `/api/admin/categories/${id}`,
        DELETE: (id: string) => `/api/admin/categories/${id}`,
      },
    },
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token') ||
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('auth-token='))
          ?.split('=')[1]
      : null;

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Network error' }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

// Specific API methods
export const api = {
  // Auth methods
  auth: {
    login: (credentials: {
      identifier: string;
      password: string;
      authMethod: string;
    }) =>
      apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (userData: any) =>
      apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    getProfile: () => apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE),

    updateProfile: (profileData: any) =>
      apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Product methods
  products: {
    getAll: (params?: URLSearchParams) => {
      const endpoint = params
        ? `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
        : API_CONFIG.ENDPOINTS.PRODUCTS.LIST;
      return apiCall(endpoint);
    },

    getById: (id: string) => apiCall(API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL(id)),
  },

  // Cart methods
  cart: {
    get: () => apiCall(API_CONFIG.ENDPOINTS.CART.GET),

    add: (productId: string, quantity: number) =>
      apiCall(API_CONFIG.ENDPOINTS.CART.ADD, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),

    update: (productId: string, quantity: number) =>
      apiCall(API_CONFIG.ENDPOINTS.CART.UPDATE, {
        method: 'PUT',
        body: JSON.stringify({ productId, quantity }),
      }),

    remove: (productId: string) =>
      apiCall(`${API_CONFIG.ENDPOINTS.CART.REMOVE}?productId=${productId}`, {
        method: 'DELETE',
      }),

    clear: () =>
      apiCall(API_CONFIG.ENDPOINTS.CART.CLEAR, {
        method: 'DELETE',
      }),
  },

  // Order methods
  orders: {
    getAll: () => apiCall(API_CONFIG.ENDPOINTS.ORDERS.LIST),

    create: (orderData: any) =>
      apiCall(API_CONFIG.ENDPOINTS.ORDERS.CREATE, {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),

    updateStatus: (orderId: string, status: string) =>
      apiCall(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  // Admin methods
  admin: {
    getDashboardStats: () => apiCall(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD),

    products: {
      getAll: () => apiCall(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS.LIST),

      create: (productData: any) =>
        apiCall(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS.CREATE, {
          method: 'POST',
          body: JSON.stringify(productData),
        }),

      update: (id: string, productData: any) =>
        apiCall(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS.UPDATE(id), {
          method: 'PUT',
          body: JSON.stringify(productData),
        }),

      delete: (id: string) =>
        apiCall(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS.DELETE(id), {
          method: 'DELETE',
        }),
    },

    orders: {
      getAll: () => apiCall(API_CONFIG.ENDPOINTS.ADMIN.ORDERS.LIST),

      updateStatus: (orderId: string, status: string) =>
        apiCall(API_CONFIG.ENDPOINTS.ADMIN.ORDERS.UPDATE_STATUS(orderId), {
          method: 'PUT',
          body: JSON.stringify({ status }),
        }),
    },
  },
};

export default api;
