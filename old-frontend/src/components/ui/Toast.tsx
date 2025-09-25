'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showCartToast: (message: string) => void;
  showWishlistToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Provide a fallback implementation instead of throwing an error
    console.warn(
      'useToast is being used outside of ToastProvider. Using fallback implementation.'
    );
    return {
      toasts: [],
      addToast: (toast: Omit<Toast, 'id'>) => {
        console.log('Toast (fallback):', toast.title, toast.message);
      },
      removeToast: (id: string) => {
        console.log('Remove toast (fallback):', id);
      },
      showToast: (toast: Omit<Toast, 'id'>) => {
        console.log('Toast (fallback):', toast.title, toast.message);
      },
      showCartToast: (message: string) => {
        console.log('Cart toast (fallback):', message);
      },
      showWishlistToast: (message: string) => {
        console.log('Wishlist toast (fallback):', message);
      },
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = addToast; // Alias for compatibility
  const showCartToast = (message: string) => {
    addToast({
      type: 'success',
      title: 'Added to Cart',
      message,
      duration: 4000,
    });
  };
  const showWishlistToast = (message: string) => {
    addToast({
      type: 'success',
      title: 'Added to Wishlist',
      message,
      duration: 4000,
    });
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showToast,
        showCartToast,
        showWishlistToast,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`
      ${getToastStyles()}
      border rounded-lg p-3 sm:p-4 shadow-lg max-w-xs sm:max-w-sm w-full
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right hover:scale-105
    `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-base sm:text-lg mr-2 sm:mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs sm:text-sm">{toast.title}</p>
          {toast.message && (
            <p className="text-xs sm:text-sm mt-1 opacity-90">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 ml-1 sm:ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-3 w-3 sm:h-4 sm:w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
