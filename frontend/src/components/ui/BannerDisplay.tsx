'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { ProductImage } from './ProductImage';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: {
    url: string;
    alt?: string;
    thumbnail?: {
      url: string;
    };
  };
  link: {
    url?: string;
    text?: string;
    openInNewTab: boolean;
  };
  position: string;
  settings: {
    backgroundColor: string;
    textColor: string;
    overlayOpacity: number;
    textAlignment: 'left' | 'center' | 'right';
    animation: 'none' | 'fade' | 'slide' | 'zoom';
    autoPlay: boolean;
    duration: number;
  };
}

interface BannerDisplayProps {
  banners: Banner[];
  position: string;
  className?: string;
  showNavigation?: boolean;
  autoPlay?: boolean;
}

export const BannerDisplay: React.FC<BannerDisplayProps> = ({
  banners,
  position,
  className = '',
  showNavigation = true,
  autoPlay = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Filter banners by position
  const filteredBanners = banners.filter(banner => banner.position === position);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || filteredBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
    }, filteredBanners[currentIndex]?.settings.duration || 5000);

    return () => clearInterval(interval);
  }, [isPlaying, filteredBanners.length, currentIndex]);

  // Track banner click
  const handleBannerClick = async (bannerId: string) => {
    try {
      await fetch(`http://localhost:5000/api/banners/${bannerId}/click`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error tracking banner click:', error);
    }
  };

  if (filteredBanners.length === 0) {
    return null;
  }

  const currentBanner = filteredBanners[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredBanners.length) % filteredBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'fade':
        return 'animate-fadeIn';
      case 'slide':
        return 'animate-slideInRight';
      case 'zoom':
        return 'animate-zoomIn';
      default:
        return '';
    }
  };

  const getTextAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };

  const renderBannerContent = (banner: Banner) => {
    const BannerWrapper = banner.link.url ? 'a' : 'div';
    const wrapperProps = banner.link.url ? {
      href: banner.link.url,
      target: banner.link.openInNewTab ? '_blank' : '_self',
      rel: banner.link.openInNewTab ? 'noopener noreferrer' : undefined,
      onClick: () => handleBannerClick(banner._id)
    } : {};

    return (
      <BannerWrapper
        {...wrapperProps}
        className={`relative w-full h-full block ${banner.link.url ? 'cursor-pointer' : ''}`}
        style={{ backgroundColor: banner.settings.backgroundColor }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <ProductImage
            src={banner.image.url}
            alt={banner.image.alt || banner.title}
            className="w-full h-full"
            objectFit="cover"
            priority={currentIndex === 0}
            lazy={false}
          />
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: banner.settings.overlayOpacity }}
          />
        </div>

        {/* Content */}
        <div className={`relative z-10 h-full flex items-center justify-center p-8 ${getAnimationClass(banner.settings.animation)}`}>
          <div className={`max-w-4xl mx-auto ${getTextAlignmentClass(banner.settings.textAlignment)}`}>
            <h1 
              className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
              style={{ color: banner.settings.textColor }}
            >
              {banner.title}
            </h1>
            
            {banner.subtitle && (
              <h2 
                className="text-xl md:text-2xl mb-6 opacity-90"
                style={{ color: banner.settings.textColor }}
              >
                {banner.subtitle}
              </h2>
            )}
            
            {banner.description && (
              <p 
                className="text-lg mb-8 opacity-80 max-w-2xl mx-auto"
                style={{ color: banner.settings.textColor }}
              >
                {banner.description}
              </p>
            )}
            
            {banner.link.url && banner.link.text && (
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick(banner._id);
                }}
              >
                {banner.link.text}
              </Button>
            )}
          </div>
        </div>
      </BannerWrapper>
    );
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Banner Content */}
      <div className="relative">
        {renderBannerContent(currentBanner)}
      </div>

      {/* Navigation Controls */}
      {showNavigation && filteredBanners.length > 1 && (
        <>
          {/* Previous/Next Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 z-20"
            aria-label="Previous banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 z-20"
            aria-label="Next banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {filteredBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 z-20"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </>
      )}

      {/* Banner Counter */}
      {filteredBanners.length > 1 && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-20">
          {currentIndex + 1} / {filteredBanners.length}
        </div>
      )}
    </div>
  );
};

// Simple banner component for single banner display
interface SimpleBannerProps {
  banner: Banner;
  className?: string;
  height?: string;
}

export const SimpleBanner: React.FC<SimpleBannerProps> = ({
  banner,
  className = '',
  height = 'h-64'
}) => {
  const handleBannerClick = async () => {
    try {
      await fetch(`http://localhost:5000/api/banners/${banner._id}/click`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error tracking banner click:', error);
    }
  };

  const BannerWrapper = banner.link.url ? Link : 'div';
  const wrapperProps = banner.link.url ? {
    href: banner.link.url,
    target: banner.link.openInNewTab ? '_blank' : '_self',
    onClick: handleBannerClick
  } : {};

  return (
    <BannerWrapper
      {...wrapperProps}
      className={`relative ${height} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${className} ${banner.link.url ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: banner.settings.backgroundColor }}
    >
      {/* Background Image */}
      <ProductImage
        src={banner.image.url}
        alt={banner.image.alt || banner.title}
        className="w-full h-full"
        objectFit="cover"
        lazy={true}
      />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: banner.settings.overlayOpacity }}
      />

      {/* Content */}
      <div className={`absolute inset-0 flex items-center justify-center p-6 ${getTextAlignmentClass(banner.settings.textAlignment)}`}>
        <div>
          <h3 
            className="text-2xl font-bold mb-2"
            style={{ color: banner.settings.textColor }}
          >
            {banner.title}
          </h3>
          
          {banner.subtitle && (
            <p 
              className="text-lg opacity-90"
              style={{ color: banner.settings.textColor }}
            >
              {banner.subtitle}
            </p>
          )}
        </div>
      </div>
    </BannerWrapper>
  );
};

// Helper function for text alignment (moved outside component to avoid recreation)
const getTextAlignmentClass = (alignment: string) => {
  switch (alignment) {
    case 'left':
      return 'text-left';
    case 'right':
      return 'text-right';
    case 'center':
    default:
      return 'text-center';
  }
};

export default BannerDisplay;
