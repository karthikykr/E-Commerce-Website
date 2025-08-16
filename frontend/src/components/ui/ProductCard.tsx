'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from './Button';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
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
  origin?: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  isFeatured: boolean;
  discountPercentage?: number;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickAdd?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  showQuickAdd = true
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product.id || product._id, 1);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsTogglingWishlist(true);
    try {
      const productId = product.id || product._id;
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className={`group relative bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
          {discountPercentage}% OFF
        </div>
      )}

      {/* Wishlist Button - Enhanced for mobile touch */}
      <button
        onClick={handleToggleWishlist}
        disabled={isTogglingWishlist}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-11 h-11 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50 touch-manipulation"
      >
        <svg
          className={`w-5 h-5 transition-colors duration-200 ${
            isInWishlist(product.id || product._id) ? 'text-red-500 fill-current' : 'text-gray-400'
          }`}
          fill={isInWishlist(product.id || product._id) ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <Link href={`/products/${product.slug}`}>
        {/* Product Image - Enhanced responsive sizing */}
        <div className="relative h-44 sm:h-48 md:h-56 lg:h-64 bg-orange-100 overflow-hidden">
          {primaryImage?.url ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl opacity-50">🌶️</span>
            </div>
          )}

          {/* Stock Status Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base md:text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info - Enhanced mobile spacing */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
          {/* Category */}
          <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1.5 sm:mb-2">
            {product.category.name}
          </p>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 leading-tight">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Weight */}
          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 font-medium">
            {product.weight.value} {product.weight.unit}
          </p>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center mb-2 sm:mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 ml-1.5 sm:ml-2">
                {product.rating} ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-base sm:text-lg md:text-xl font-bold text-orange-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Enhanced mobile touch target */}
      {showQuickAdd && (
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            size="md"
            fullWidth
            className={`min-h-[48px] sm:min-h-[44px] rounded-xl font-semibold transition-all duration-200 touch-manipulation ${
              product.inStock
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="text-sm sm:text-base">Adding...</span>
              </div>
            ) : product.inStock ? (
              <span className="text-sm sm:text-base">Add to Cart</span>
            ) : (
              <span className="text-sm sm:text-base">Out of Stock</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
