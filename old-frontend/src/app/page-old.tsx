'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, StatsCard } from '@/components/ui/Card';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroImage, LazyImage } from '@/components/ui/OptimizedImage';
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
        // Fetch all products from backend
        const productsResponse = await fetch('http://localhost:5000/api/products?limit=8');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const allProducts = productsData.data?.products || [];

          // Set featured products (first 4)
          setFeaturedProducts(allProducts.slice(0, 4));

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

  const pageContent = (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white">
      <Header />
      <main className="relative">
      <main className="relative">
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
                      <div className="w-full h-20 sm:h-24 bg-gradient-to-br from-amber-100 via-amber-200 to-orange-200 rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-3 shadow-inner">
                        <span className="text-xl sm:text-2xl">🥜</span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-800 text-center">ORGANIC JAGGERY</h4>
                      <p className="text-orange-600 font-bold text-xs text-center mt-1">₹199</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 transform rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-xl border border-orange-100 col-span-2 sm:col-span-1">
                      <div className="w-full h-20 sm:h-24 bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-3 shadow-inner">
                        <span className="text-xl sm:text-2xl">🌿</span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-800 text-center">FRESH HERBS</h4>
                      <p className="text-orange-600 font-bold text-xs text-center mt-1">₹149</p>
                    </div>
                  </div>
                </div>

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

        {/* Special Offers - Centered and improved layout */}
        {discountedProducts.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  🔥 Special Offers
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                  Limited time deals on premium spices and authentic homemade products
                </p>
              </div>

              {/* Perfectly sized grid with optimal spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
                {discountedProducts.map(product => (
                  <div key={product._id} className="group w-full flex justify-center">
                    <div className="w-full max-w-sm">
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/products?discount=true">
                  <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    View All Special Deals
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Featured Products - Premium centered layout */}
        {featuredProducts.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6">
                  <span className="text-2xl">⭐</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Featured Products
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Discover our premium selection of authentic spices and seasonings, carefully curated for the finest homemade experience
                </p>
              </div>

              {/* Perfectly sized grid with optimal spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
                {featuredProducts.map(product => (
                  <div key={product._id} className="group w-full flex justify-center">
                    <div className="w-full max-w-sm">
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced CTA Button */}
              <div className="text-center">
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Explore All Products
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">1000+</div>
                <div className="text-orange-100 text-sm sm:text-base font-medium">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-orange-100 text-sm sm:text-base font-medium">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">5★</div>
                <div className="text-orange-100 text-sm sm:text-base font-medium">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
                <div className="text-orange-100 text-sm sm:text-base font-medium">Customer Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Categories - Enhanced design */}
        <div className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                <span className="text-2xl">🌿</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Popular Categories
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore our carefully curated categories of premium spices and seasonings, each selected for their exceptional quality and authentic flavors
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.length > 0 ? (
              categories.map((category, index) => {
                const icons = ['🌶️', '🥄', '🌿', '🌱', '🌰'];
                return (
                  <Link key={category._id} href={`/products?category=${category._id}`} className="group">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 group-hover:scale-105 transform border border-orange-100 hover:border-orange-200">
                      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">
                        {icons[index] || '🌶️'}
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900">{category.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{category.description}</p>
                      <div className="mt-4 inline-flex items-center text-orange-600 font-medium group-hover:text-orange-700">
                        Explore Category
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
                <Link key={index} href="/products" className="group">
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 group-hover:scale-105 transform border border-orange-100 hover:border-orange-200">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{category.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{category.description}</p>
                    <div className="mt-4 inline-flex items-center text-orange-600 font-medium group-hover:text-orange-700">
                      Explore Category
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
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

  return pageContent;
}
