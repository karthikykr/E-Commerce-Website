'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid, GridContainer } from '@/components/ui/ProductGrid';
import { BannerDisplay, SimpleBanner } from '@/components/ui/BannerDisplay';
import FeaturedProductsShowcase from './FeaturedProductsShowcase';

interface SectionData {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content: any;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    padding?: any;
    margin?: any;
    customCSS?: string;
  };
  products?: any[];
  categories?: any[];
  banners?: any[];
}

interface DynamicSectionProps {
  section: SectionData;
  className?: string;
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({ section, className = '' }) => {
  const getSectionStyle = () => {
    const style: React.CSSProperties = {};
    
    if (section.settings.backgroundColor) {
      style.backgroundColor = section.settings.backgroundColor;
    }
    
    if (section.settings.textColor) {
      style.color = section.settings.textColor;
    }
    
    if (section.settings.padding) {
      const p = section.settings.padding;
      style.padding = `${p.top || 0}px ${p.right || 0}px ${p.bottom || 0}px ${p.left || 0}px`;
    }
    
    if (section.settings.margin) {
      const m = section.settings.margin;
      style.margin = `${m.top || 0}px 0 ${m.bottom || 0}px 0`;
    }
    
    return style;
  };

  const renderHeroBanner = () => {
    // If we have banners for hero position, use BannerDisplay
    if (section.banners && section.banners.length > 0) {
      return (
        <BannerDisplay
          banners={section.banners}
          position="hero"
          className="h-96 md:h-[500px] lg:h-[600px]"
          showNavigation={section.banners.length > 1}
          autoPlay={section.content.autoPlay}
        />
      );
    }

    // Fallback to default hero section
    return (
    <div className="bg-gradient-to-br from-orange-100 via-amber-100 to-red-100 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-orange-400 rounded-full"></div>
        <div className="absolute top-16 right-8 sm:top-32 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-red-400 rounded-full"></div>
        <div className="absolute bottom-12 left-16 sm:bottom-20 sm:left-32 w-8 h-8 sm:w-12 sm:h-12 bg-amber-400 rounded-full"></div>
        <div className="absolute bottom-16 right-4 sm:bottom-32 sm:right-10 w-14 h-14 sm:w-24 sm:h-24 bg-orange-300 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg">
                  JUST
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                    Gruhapaaka
                  </h2>
                  <span className="text-xs sm:text-sm text-orange-600 font-medium -mt-1">Homemade Food Products</span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">
                  Authentic
                </span>
                <span className="text-gray-700">.</span>
                <br />
                <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  Pure
                </span>
                <span className="text-gray-700">.</span>
                <br />
                <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Homemade
                </span>
                <span className="text-gray-700">.</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0 font-medium">
                Indulge in elegant homemade food products, crafted with the finest ingredients and traditional recipes passed down through generations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 sm:pt-8 px-4 lg:px-0">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                    🛒 Shop Now
                    <svg className="w-6 h-6 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button variant="outline" className="border-3 border-orange-400 text-orange-700 hover:bg-orange-50 hover:border-orange-500 px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                    Learn More
                    <svg className="w-6 h-6 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Product Showcase */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Product Display - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 transform rotate-1 sm:rotate-3 hover:rotate-0 transition-all duration-500 hover:shadow-2xl border border-orange-100">
                    <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-red-100 via-red-200 to-red-300 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
                      <span className="text-3xl sm:text-4xl animate-bounce">🌶️</span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-800 mb-2">FLAX SEEDS CHUTNEY POWDER</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-orange-600 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-bold">JUST</span>
                        <span className="ml-1 sm:ml-2 text-xs text-orange-600 font-semibold">Gruhapaaka</span>
                      </div>
                      <span className="text-orange-600 font-bold text-xs sm:text-sm">₹299</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6 sm:pt-12">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 transform -rotate-1 sm:-rotate-2 hover:rotate-0 transition-all duration-500 hover:shadow-2xl border border-orange-100">
                    <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-inner">
                      <span className="text-3xl sm:text-4xl animate-pulse">🥄</span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-800 mb-2">LEMON RASAM POWDER</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-orange-600 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-bold">JUST</span>
                        <span className="ml-1 sm:ml-2 text-xs text-orange-600 font-semibold">Gruhapaaka</span>
                      </div>
                      <span className="text-orange-600 font-bold text-xs sm:text-sm">₹249</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Products - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 transform rotate-1 hover:rotate-0 transition-all duration-300 hover:shadow-xl border border-orange-100">
                  <div className="w-full h-20 sm:h-24 bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200 rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-3 shadow-inner">
                    <span className="text-xl sm:text-2xl">🍯</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-800 text-center">PURE HONEY</h4>
                  <p className="text-orange-600 font-bold text-xs text-center mt-1">₹399</p>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 transform -rotate-1 hover:rotate-0 transition-all duration-300 hover:shadow-xl border border-orange-100">
                  <div className="w-full h-20 sm:h-24 bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-3 shadow-inner">
                    <span className="text-xl sm:text-2xl">🌿</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-800 text-center">CURRY LEAVES</h4>
                  <p className="text-orange-600 font-bold text-xs text-center mt-1">₹199</p>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 transform rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-xl border border-orange-100">
                  <div className="w-full h-20 sm:h-24 bg-gradient-to-br from-purple-100 via-purple-200 to-violet-200 rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-3 shadow-inner">
                    <span className="text-xl sm:text-2xl">🧄</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-800 text-center">GARLIC POWDER</h4>
                  <p className="text-orange-600 font-bold text-xs text-center mt-1">₹179</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderFeaturedProducts = () => (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 py-10 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6">
            <span className="text-2xl">⭐</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {section.title || 'Featured Products'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {section.subtitle || 'Discover our premium selection of authentic spices and seasonings, carefully curated for the finest homemade experience'}
          </p>
        </div>

        {section.products && section.products.length > 0 && (
          <div className="mb-6 sm:mb-8 md:mb-10">
            <ProductGrid
              products={section.products}
              variant="showcase"
              emptyMessage="No featured products available"
              emptyIcon="⭐"
            />
          </div>
        )}

        <div className="text-center px-4">
          <Link href="/products">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto">
              Explore All Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderSpecialOffers = () => (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🔥 {section.title || 'Special Offers'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {section.subtitle || 'Limited time deals on premium spices and authentic homemade products'}
          </p>
        </div>
        
        {section.products && section.products.length > 0 && (
          <ProductGrid
            products={section.products}
            variant="featured"
            emptyMessage="No special offers available"
            emptyIcon="🔥"
          />
        )}

        <div className="text-center mt-8 sm:mt-10">
          <Link href="/products?discount=true">
            <Button variant="outline" className="bg-white border-2 border-orange-400 text-orange-700 hover:bg-orange-50 hover:border-orange-500 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105">
              View All Deals
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="mb-16 sm:mb-20 lg:mb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 place-items-center">
          {section.categories && section.categories.length > 0 ? (
            section.categories.map((category, index) => {
              const icons = ['🌶️', '🥄', '🌿', '🌱', '🌰'];
              return (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="group w-full max-w-sm"
                >
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 transform border border-orange-100 hover:border-orange-300 p-6 sm:p-8 text-center h-full flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                        <span className="text-3xl sm:text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-300">
                          {icons[index] || '🌶️'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-center">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 group-hover:text-orange-700 transition-colors duration-200">
                        {category.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                        {category.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center text-orange-600 font-medium group-hover:text-orange-700 transition-colors duration-200">
                        <span className="text-sm sm:text-base">Explore Category</span>
                        <svg
                          className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            // Fallback categories
            [
              { name: 'Whole Spices', description: 'Fresh whole spices for maximum flavor and aroma', icon: '🌶️' },
              { name: 'Ground Spices', description: 'Finely ground spices ready for cooking', icon: '🥄' },
              { name: 'Spice Blends', description: 'Expertly crafted blends for authentic flavors', icon: '🌿' }
            ].map((category, index) => (
              <Link
                key={index}
                href="/products"
                className="group w-full max-w-sm"
              >
                <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 transform border border-orange-100 hover:border-orange-300 p-6 sm:p-8 text-center h-full flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                      <span className="text-3xl sm:text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 group-hover:text-orange-700 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                      {category.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center text-orange-600 font-medium group-hover:text-orange-700 transition-colors duration-200">
                      <span className="text-sm sm:text-base">Explore Category</span>
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAboutUs = () => (
    <div className="bg-gradient-to-br from-white via-orange-50 to-amber-50 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-red-400 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full"></div>
                <span className="text-orange-600 font-bold text-sm tracking-wider uppercase bg-orange-100 px-4 py-2 rounded-full">About Us</span>
                <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"></div>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent leading-tight">
                {section.title}
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                {section.subtitle || section.content.description}
              </p>
              {section.content.stats && (
                <div className="grid grid-cols-2 gap-6 pt-4">
                  {section.content.stats.map((stat: any, index: number) => (
                    <div key={index} className="text-center p-4 bg-white rounded-xl shadow-lg border border-orange-100">
                      <div className="text-3xl font-bold text-orange-600 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <div className="w-96 h-96 mx-auto">
                <div className="w-full h-full bg-gradient-to-br from-orange-200 via-amber-200 to-red-200 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <div className="w-80 h-80 bg-gradient-to-br from-orange-600 via-amber-600 to-red-600 rounded-full flex items-center justify-center shadow-inner relative">
                    <div className="absolute top-8 left-8 text-2xl animate-bounce">🌶️</div>
                    <div className="absolute top-8 right-8 text-2xl animate-pulse">🌿</div>
                    <div className="absolute bottom-8 left-8 text-2xl animate-bounce delay-300">🥄</div>
                    <div className="absolute bottom-8 right-8 text-2xl animate-pulse delay-500">🍯</div>
                    <span className="text-8xl animate-spin-slow">🥄</span>
                  </div>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg animate-float">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg animate-float delay-1000">
                    <span className="text-2xl">🌟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWhyChooseUs = () => (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl shadow-xl p-12 mb-20 border border-orange-100 mx-4 sm:mx-6 lg:mx-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-gray-600 max-w-2xl mx-auto">
              {section.subtitle}
            </p>
          )}
        </div>
        {section.content.features && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {section.content.features.map((feature: any, index: number) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNewsletter = () => (
    <div 
      className="rounded-3xl shadow-xl p-12 text-center text-white mb-20 mx-4 sm:mx-6 lg:mx-8"
      style={{ backgroundColor: section.content.backgroundColor || '#ea580c' }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
        {section.subtitle && (
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            {section.subtitle}
          </p>
        )}
        <div className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            placeholder={section.content.placeholder || 'Enter your email'}
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <Button className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-semibold">
            {section.content.buttonText || 'Subscribe'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCustomHtml = () => (
    <div 
      className={className}
      style={getSectionStyle()}
      dangerouslySetInnerHTML={{ __html: section.content.html || '' }}
    />
  );

  const renderSection = () => {
    switch (section.type) {
      case 'hero_banner':
        return renderHeroBanner();
      case 'featured_products':
        return renderFeaturedProducts();
      case 'special_offers':
        return renderSpecialOffers();
      case 'categories':
        return renderCategories();
      case 'about_us':
        return renderAboutUs();
      case 'why_choose_us':
        return renderWhyChooseUs();
      case 'newsletter':
        return renderNewsletter();
      case 'custom_html':
        return renderCustomHtml();
      default:
        return (
          <div className="py-12 px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
            {section.subtitle && (
              <p className="text-gray-600">{section.subtitle}</p>
            )}
          </div>
        );
    }
  };

  return (
    <section 
      className={className}
      style={getSectionStyle()}
    >
      {section.settings.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: section.settings.customCSS }} />
      )}
      {renderSection()}
    </section>
  );
};

export default DynamicSection;
