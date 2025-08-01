'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  hover = false,
  clickable = false,
  onClick,
}) => {
  const baseClasses = 'transition-all duration-300';

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-white border-2 border-gray-300',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
  };

  // Enhanced mobile-first responsive padding with better touch spacing
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4 md:p-3',
    md: 'p-4 sm:p-5 md:p-4 lg:p-5',
    lg: 'p-5 sm:p-6 md:p-6 lg:p-7 xl:p-6',
    xl: 'p-6 sm:p-7 md:p-8 lg:p-9 xl:p-8',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const clickableClasses = clickable ? 'cursor-pointer hover:shadow-md' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${roundedClasses[rounded]}
        ${hoverClasses}
        ${clickableClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  divider = true,
}) => {
  return (
    <div className={`${divider ? 'border-b border-gray-200 pb-4 mb-4' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Card Body Component
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  divider = true,
}) => {
  return (
    <div className={`${divider ? 'border-t border-gray-200 pt-4 mt-4' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Product Card Component
interface ProductCardWrapperProps {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}

export const ProductCardWrapper: React.FC<ProductCardWrapperProps> = ({
  children,
  className = '',
  featured = false,
}) => {
  return (
    <Card
      variant="elevated"
      padding="none"
      rounded="xl"
      hover
      clickable
      className={`
        overflow-hidden group h-full flex flex-col
        ${featured ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}
        ${className}
      `}
    >
      {children}
    </Card>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  className = '',
}) => {
  return (
    <Card variant="elevated" padding="lg" className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.type === 'increase' ? (
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              ) : (
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
              )}
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl text-orange-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
