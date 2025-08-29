'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    role?: 'admin' | 'user'
  ) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  // Debug user state changes
  useEffect(() => {
    console.log('AuthContext - user state changed:', user);
  }, [user]);

  // Check for existing session on mount
  useEffect(() => {
    let token = Cookies.get('auth-token');
    let userData = Cookies.get('user-data');

    // Fallback to localStorage if cookies are not available
    if (!token || !userData) {
      token = localStorage.getItem('token');
      userData = localStorage.getItem('user');
    }

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        Cookies.remove('auth-token');
        Cookies.remove('user-data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: 'admin' | 'user' = 'user'
  ): Promise<boolean> => {
    setIsLoading(true);

    // First, test backend connectivity
    try {
      console.log('🔍 Testing backend connectivity...');
      const healthResponse = await axios.get(
        'http://localhost:5000/api/health'
      );
      console.log('🏥 Health check status:', healthResponse.status);
      if (healthResponse.status === 200) {
        console.log('✅ Backend is accessible:', healthResponse.data);
      } else {
        console.warn('⚠️ Backend health check failed');
      }
    } catch (healthError) {
      console.error('❌ Backend connectivity test failed:', healthError);
    }

    try {
      console.log('🔄 Attempting login with:', {
        email,
        password: password.substring(0, 3) + '***',
        role,
      });

      const requestBody = {
        email,
        password,
      };
      console.log('📤 Request body:', {
        ...requestBody,
        password: password.substring(0, 3) + '***',
      });

      const response = await axios.post(
        `http://localhost:5000/api/auth/login?t=${Date.now()}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        }
      );

      const data = response.data;
      console.log('📄 Login response data:', data);

      if (response.status === 200 && data.success) {
        console.log('✅ Login successful, processing user data...');

        const userData: User = {
          id: data.data.user._id || data.data.user.id,
          email:
            data.data.user.email ||
            data.data.user.mobile ||
            data.data.user.adminId,
          name: data.data.user.name,
          role: data.data.user.role,
          phone: data.data.user.phone || data.data.user.mobile,
          createdAt: new Date(data.data.user.createdAt || Date.now()),
          updatedAt: new Date(data.data.user.updatedAt || Date.now()),
        };

        setUser(userData);

        // Store in both cookies and localStorage for compatibility
        Cookies.set('auth-token', data.data.token, { expires: 7 }); // 7 days
        Cookies.set('user-data', JSON.stringify(userData), { expires: 7 });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect based on user role
        setTimeout(() => {
          if (userData.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/';
          }
        }, 100);

        return true;
      } else {
        console.error('❌ Login failed');
        console.error('Response status:', response.status);
        console.error('Data success:', data.success);
        console.error('Error message:', data.message);
        console.error('Full response data:', data);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  //register

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      if (response) {
        // Auto-login after successful registration
        return await login(userData.email, userData.password, 'user');
      } else {
        console.error('Registration failed:', data.message);
        return false;
      }
    } catch (error: any) {
      console.error(
        'Registration error:',
        error.response?.data || error.message
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('auth-token');
    Cookies.remove('user-data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
