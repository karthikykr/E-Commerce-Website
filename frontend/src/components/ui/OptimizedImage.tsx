'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  onLoad,
  onError,
  fallback,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate blur placeholder
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 loading-shimmer"
          style={{ width, height }}
        />
      )}

      {/* Actual image */}
      {(isInView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={defaultBlurDataURL}
          sizes={sizes}
          loading={loading}
          className={`
            transition-opacity duration-300 image-optimized
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${objectFit ? `object-${objectFit}` : ''}
          `}
          style={{
            objectPosition,
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

// Lazy Image Component with Intersection Observer
interface LazyImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) => {
  return (
    <OptimizedImage
      {...props}
      loading="lazy"
      priority={false}
    />
  );
};

// Hero Image Component with priority loading
export const HeroImage: React.FC<OptimizedImageProps> = (props) => {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      quality={90}
      loading="eager"
    />
  );
};

// Product Image Component with specific optimizations
interface ProductImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  variant?: 'card' | 'detail' | 'thumbnail';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  variant = 'card',
  ...props
}) => {
  const getSizes = () => {
    switch (variant) {
      case 'card':
        return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
      case 'detail':
        return '(max-width: 768px) 100vw, 50vw';
      case 'thumbnail':
        return '80px';
      default:
        return '100vw';
    }
  };

  const getQuality = () => {
    switch (variant) {
      case 'detail':
        return 90;
      case 'thumbnail':
        return 60;
      default:
        return 75;
    }
  };

  return (
    <OptimizedImage
      {...props}
      sizes={getSizes()}
      quality={getQuality()}
      placeholder="blur"
    />
  );
};

// Avatar Image Component
interface AvatarImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  };

  const { width, height } = sizeMap[size];

  return (
    <OptimizedImage
      {...props}
      width={width}
      height={height}
      className={`rounded-full ${className}`}
      objectFit="cover"
      quality={80}
      sizes={`${width}px`}
    />
  );
};
