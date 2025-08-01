'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, StatsCard } from '@/components/ui/Card';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroImage, LazyImage } from '@/components/ui/OptimizedImage';
import FeaturedProductsShowcase from '@/components/homepage/FeaturedProductsShowcase';
import Link from 'next/link';

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

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products from dedicated endpoint
        const featuredResponse = await fetch('http://localhost:5000/api/products/featured?limit=8');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedProducts(featuredData.data || []);
        }

        // Fetch products with discounts
        const productsResponse = await fetch('http://localhost:5000/api/products?limit=20');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const allProducts = productsData.data?.products || [];

          // Set discounted products (products with originalPrice > price)
          const productsWithDiscount = allProducts.filter((p: Product) => p.originalPrice && p.originalPrice > p.price);
          setDiscountedProducts(productsWithDiscount.slice(0, 4));
        }

        // Fetch categories from backend
        const categoriesResponse = await fetch('http://localhost:5000/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.data?.categories?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing spices...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      <Header />

      {/* Hero Section - Enhanced Design */}
      <main className="relative">
        {/* Main Hero Banner - Mobile Responsive */}
        <div className="bg-gradient-to-br from-orange-100 via-amber-100 to-red-100 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Pattern - Responsive */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-orange-400 rounded-full"></div>
            <div className="absolute top-16 right-8 sm:top-32 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-red-400 rounded-full"></div>
            <div className="absolute bottom-12 left-16 sm:bottom-20 sm:left-32 w-8 h-8 sm:w-12 sm:h-12 bg-amber-400 rounded-full"></div>
            <div className="absolute bottom-16 right-4 sm:bottom-32 sm:right-10 w-14 h-14 sm:w-24 sm:h-24 bg-orange-300 rounded-full"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Left Content - Mobile Responsive */}
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
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent leading-tight">
                    Authentic.
                    <br />
                    <span className="text-orange-600">Pure.</span>
                    <br />
                    <span className="text-red-600">Homemade</span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-lg mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0">
                    Indulge in elegant homemade food products, made
                    with the finest ingredients and traditional
                    recipes passed down through generations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 px-4 lg:px-0">
                    <Link href="/products" className="w-full sm:w-auto">
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                        🛒 Shop Now
                      </Button>
                    </Link>
                    <Link href="/about" className="w-full sm:w-auto">
                      <Button variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Content - Dynamic Featured Products Showcase */}
              <div className="relative">
                <FeaturedProductsShowcase />

                {/* Enhanced Decorative Elements - Responsive */}
                <div className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-24 h-24 sm:w-40 sm:h-40 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 rounded-full transform rotate-45 animate-pulse"></div>
                </div>
                <div className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-20 h-20 sm:w-32 sm:h-32 opacity-15">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Us Section - Enhanced Design */}
        <div className="bg-gradient-to-br from-white via-orange-50 to-amber-50 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 bg-orange-400 rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-red-400 rounded-full"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-16 h-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full"></div>
                    <span className="text-orange-600 font-bold text-sm tracking-wider uppercase bg-orange-100 px-4 py-2 rounded-full">About Us</span>
                    <div className="w-16 h-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"></div>
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent leading-tight">
                    Thank You for
                    <br />
                    <span className="text-orange-600">Trusting Us</span>
                  </h2>
                  <p className="text-xl text-gray-700 leading-relaxed">
                    We dedicate ourselves to purity, authenticity, and traditional
                    methods in creating homemade food products. Our commitment to
                    traditional recipes and homemade goodness ensures every product
                    carries the essence of home-cooked meals.
                  </p>
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="text-center p-4 bg-white rounded-xl shadow-lg border border-orange-100">
                      <div className="text-3xl font-bold text-orange-600 mb-1">100+</div>
                      <div className="text-sm text-gray-600 font-medium">Premium Products</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl shadow-lg border border-orange-100">
                      <div className="text-3xl font-bold text-orange-600 mb-1">5000+</div>
                      <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Enhanced Visual */}
              <div className="relative">
                <div className="relative z-10">
                  <div className="w-96 h-96 mx-auto">
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 via-amber-200 to-red-200 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
                      {/* Inner Circle */}
                      <div className="w-80 h-80 bg-gradient-to-br from-orange-600 via-amber-600 to-red-600 rounded-full flex items-center justify-center shadow-inner relative">
                        {/* Spice Icons */}
                        <div className="absolute top-8 left-8 text-2xl animate-bounce">🌶️</div>
                        <div className="absolute top-8 right-8 text-2xl animate-pulse">🌿</div>
                        <div className="absolute bottom-8 left-8 text-2xl animate-bounce delay-300">🥄</div>
                        <div className="absolute bottom-8 right-8 text-2xl animate-pulse delay-500">🍯</div>

                        {/* Center Icon */}
                        <span className="text-8xl animate-spin-slow">🥄</span>
                      </div>

                      {/* Floating Elements */}
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

        {/* Special Offers - Improved grid layout */}
        {discountedProducts.length > 0 && (
          <div className="mb-16 sm:mb-20">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🔥 Special Offers</h2>
                <p className="text-sm sm:text-base text-gray-600">Limited time deals on premium spices</p>
              </div>
              <Link href="/products?discount=true">
                <Button variant="outline" className="hidden sm:flex items-center gap-2">
                  View All Deals
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
            {/* Optimized grid with better spacing */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {discountedProducts.map(product => (
                <div key={product._id} className="group w-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="text-center mt-6 sm:mt-8 sm:hidden">
              <Link href="/products?discount=true">
                <Button variant="outline" className="w-full">View All Deals</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Popular Products (Featured) - Mobile Optimized */}
        {featuredProducts.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 py-10 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-6 sm:mb-8 md:mb-10">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-orange-600 font-bold text-sm tracking-wider uppercase bg-orange-100 px-3 py-1 rounded-full">Popular Products</span>
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Demanded Products</h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                  Handpicked favorites that our customers love most - premium quality spices and seasonings
                </p>
              </div>

              {/* Optimized grid layout for better card display */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10">
                {featuredProducts.map(product => (
                  <div key={product._id} className="group w-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Explore Products Button - Mobile Responsive */}
              <div className="text-center px-4">
                <Link href="/products">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto">
                    Explore All Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Featured Categories */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Popular Categories
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Explore our carefully curated categories of premium spices and seasonings
            </p>
          </div>

          {/* Responsive Grid Container with proper centering */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 place-items-center">
              {categories.length > 0 ? (
                categories.map((category, index) => {
                  const icons = ['🌶️', '🥄', '🌿', '🌱', '🌰'];
                  return (
                    <Link
                      key={category._id}
                      href={`/products?category=${category._id}`}
                      className="group w-full max-w-sm"
                    >
                      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 transform border border-orange-100 hover:border-orange-300 p-6 sm:p-8 text-center h-full flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
                        {/* Icon Container with consistent sizing */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                            <span className="text-3xl sm:text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-300">
                              {icons[index] || '🌶️'}
                            </span>
                          </div>
                        </div>

                        {/* Content Container */}
                        <div className="flex-grow flex flex-col justify-center">
                          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 group-hover:text-orange-700 transition-colors duration-200">
                            {category.name}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                            {category.description}
                          </p>
                        </div>

                        {/* CTA Button */}
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
                // Fallback categories if API fails
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
                      {/* Icon Container with consistent sizing */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                          <span className="text-3xl sm:text-4xl lg:text-5xl group-hover:scale-110 transition-transform duration-300">
                            {category.icon}
                          </span>
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="flex-grow flex flex-col justify-center">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 group-hover:text-orange-700 transition-colors duration-200">
                          {category.name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                          {category.description}
                        </p>
                      </div>

                      {/* CTA Button */}
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

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl shadow-xl p-12 mb-20 border border-orange-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Gruhapaaka?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to bringing you the finest homemade food products with unmatched quality and traditional taste
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">🏠</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Homemade Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Made with love in home kitchens using traditional recipes and the finest ingredients.
                </p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">🚚</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Free shipping on orders over $50. Get your homemade delicacies delivered fresh to your doorstep.
                </p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">🔒</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Quality Guarantee</h3>
                <p className="text-gray-600 leading-relaxed">
                  100% satisfaction guarantee. If you're not happy, we'll make it right.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-orange-600 rounded-3xl shadow-xl p-12 text-center text-white mb-20">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Gruhapaaka</h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            Get the latest updates on new homemade products, special offers, and traditional recipes delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Button className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-semibold">
              Subscribe
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
