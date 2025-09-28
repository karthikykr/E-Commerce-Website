'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'md',
}) => {
  // Mobile-first responsive base classes with improved touch targets
  const baseClasses =
    'font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 relative overflow-hidden group disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 touch-manipulation select-none';

  const variantClasses = {
    primary:
      'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white focus:ring-orange-500 shadow-lg hover:shadow-xl',
    secondary:
      'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500 shadow-lg hover:shadow-xl',
    outline:
      'border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white active:bg-orange-700 focus:ring-orange-500 bg-white hover:shadow-lg',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500 hover:shadow-md',
    gradient:
      'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:from-orange-800 active:to-red-800 text-white focus:ring-orange-500 shadow-lg hover:shadow-xl',
  };

  // Enhanced mobile-first sizing with minimum touch targets (44px)
  const sizeClasses = {
    xs: 'px-3 py-2 text-xs min-h-[44px] sm:px-3 sm:py-2 sm:min-h-[36px] sm:text-xs',
    sm: 'px-4 py-2.5 text-sm min-h-[44px] sm:px-4 sm:py-2 sm:min-h-[40px] sm:text-sm',
    md: 'px-5 py-3 text-sm min-h-[48px] sm:px-5 sm:py-2.5 sm:min-h-[44px] sm:text-base md:px-6 md:py-3',
    lg: 'px-6 py-3.5 text-base min-h-[52px] sm:px-6 sm:py-3 sm:min-h-[48px] sm:text-lg md:px-7 md:py-3.5',
    xl: 'px-8 py-4 text-lg min-h-[56px] sm:px-8 sm:py-4 sm:min-h-[52px] sm:text-xl md:px-10 md:py-5',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  const disabledClasses =
    disabled || loading ? 'opacity-50 cursor-not-allowed hover:scale-100' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]} ${disabledClasses} ${widthClasses} ${className}`}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-shimmer"></div>

      <div className="flex items-center justify-center space-x-2">
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </div>
    </button>
  );
};
