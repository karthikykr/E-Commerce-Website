'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  showFallbackIcon?: boolean;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Product image',
  width,
  height,
  className = '',
  fallbackSrc = '/images/placeholder-product.png',
  showFallbackIcon = true,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
  objectFit = 'cover',
  lazy = true,
  onLoad,
  onError,
  placeholder = 'empty',
  blurDataURL,
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Update image source when prop changes
  useEffect(() => {
    setImageSrc(src);
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    onError?.();
  };

  const shouldShowImage = isInView && imageSrc && !imageError;
  const shouldShowFallback = imageError || (!imageSrc && showFallbackIcon);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ width, height }}
    >
      {/* Loading Skeleton */}
      {isLoading && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-2xl">📸</div>
        </div>
      )}

      {/* Main Image */}
      {shouldShowImage && (
        <>
          {width && height ? (
            <Image
              src={imageSrc!}
              alt={alt}
              width={width}
              height={height}
              className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              style={{ objectFit }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={priority}
              sizes={sizes}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
            />
          ) : (
            <Image
              src={imageSrc!}
              alt={alt}
              fill
              className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              style={{ objectFit }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={priority}
              sizes={sizes}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
            />
          )}
        </>
      )}

      {/* Fallback Icon */}
      {shouldShowFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">🌶️</div>
            <div className="text-xs">No Image</div>
          </div>
        </div>
      )}

      {/* Lazy Loading Placeholder */}
      {!isInView && lazy && !priority && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-2xl">⏳</div>
        </div>
      )}
    </div>
  );
};

// Product Image Gallery Component
interface ProductImageGalleryProps {
  images: Array<{
    id?: string;
    url: string;
    alt?: string;
    thumbnail?: string;
    isPrimary?: boolean;
  }>;
  className?: string;
  showThumbnails?: boolean;
  allowZoom?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images = [],
  className = '',
  showThumbnails = true,
  allowZoom = false,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  if (images.length === 0) {
    return (
      <div
        className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">🌶️</div>
          <div className="text-lg">No Images Available</div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <ProductImage
          src={currentImage.url}
          alt={currentImage.alt || `Product image ${currentIndex + 1}`}
          className="w-full h-full"
          objectFit="cover"
          priority={currentIndex === 0}
          lazy={false}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
              aria-label="Previous image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
              aria-label="Next image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Zoom Button */}
        {allowZoom && (
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
            aria-label="Zoom image"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </button>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-orange-500 ring-2 ring-orange-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ProductImage
                src={image.thumbnail || image.url}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full"
                objectFit="cover"
                lazy={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <ProductImage
              src={currentImage.url}
              alt={currentImage.alt || 'Zoomed product image'}
              className="max-w-full max-h-full"
              objectFit="contain"
              lazy={false}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              aria-label="Close zoom"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
      )}
    </div>
  );
};

export default ProductImage;
