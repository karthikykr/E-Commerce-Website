'use client';

import React from 'react';
import { ProductCard } from '@/components/product/ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  inStock: boolean;
  stockQuantity: number;
  weight: {
    value: number;
    unit: string;
  };
  origin: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  discountPercentage?: number;
}

interface ProductGridProps {
  products: Product[];
  variant?: 'default' | 'compact' | 'featured' | 'showcase';
  className?: string;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

const gridVariants = {
  default: {
    container: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-responsive',
    item: 'w-full'
  },
  compact: {
    container: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-responsive',
    item: 'w-full'
  },
  featured: {
    container: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8',
    item: 'w-full max-w-sm mx-auto hover-lift'
  },
  showcase: {
    container: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-responsive',
    item: 'w-full hover-lift'
  }
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  variant = 'default',
  className = '',
  showLoadMore = false,
  onLoadMore,
  loading = false,
  emptyMessage = 'No products found',
  emptyIcon = '🛍️'
}) => {
  const gridConfig = gridVariants[variant];

  if (products.length === 0 && !loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">{emptyIcon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Products Grid */}
      <div className={gridConfig.container}>
        {products.map((product, index) => (
          <div 
            key={product._id} 
            className={`${gridConfig.item} animate-fade-in-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
        
        {/* Loading Skeleton Cards */}
        {loading && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className={gridConfig.item}>
                <ProductCardSkeleton />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Load More Button */}
      {showLoadMore && onLoadMore && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Products'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Product Card Skeleton Component
const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-40 sm:h-44 md:h-48 bg-gray-200"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Price */}
        <div className="flex items-center space-x-2">
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
          ))}
          <div className="h-3 bg-gray-200 rounded w-8 ml-2"></div>
        </div>
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

// Responsive Product Grid Hook
export const useResponsiveGrid = (totalItems: number) => {
  const getOptimalColumns = () => {
    if (typeof window === 'undefined') return 4;
    
    const width = window.innerWidth;
    
    if (width < 640) return 2; // sm
    if (width < 768) return 2; // md
    if (width < 1024) return 3; // lg
    if (width < 1280) return 4; // xl
    return 5; // 2xl
  };

  const [columns, setColumns] = React.useState(getOptimalColumns);

  React.useEffect(() => {
    const handleResize = () => {
      setColumns(getOptimalColumns());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rows = Math.ceil(totalItems / columns);
  
  return { columns, rows };
};

// Grid Container Component for consistent spacing
interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  padding?: boolean;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
  padding = true
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <div className={`
      ${maxWidthClasses[maxWidth]} mx-auto
      ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default ProductGrid;
