'use client';

import { useState, useEffect } from 'react';
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
        const productsResponse = await fetch('http://localhost:5001/api/products?limit=8');
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
        const categoriesResponse = await fetch('http://localhost:5001/api/categories');
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
        {/* Main Hero Banner */}
        <div className="bg-gradient-to-br from-orange-100 via-amber-100 to-red-100 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-red-400 rounded-full"></div>
            <div className="absolute bottom-20 left-32 w-12 h-12 bg-amber-400 rounded-full"></div>
            <div className="absolute bottom-32 right-10 w-24 h-24 bg-orange-300 rounded-full"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                      JUST
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                        Gruhapaaka
                      </h2>
                      <span className="text-sm text-orange-600 font-medium -mt-1">Fresh Spices & More</span>
                    </div>
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent leading-tight">
                    Authentic.
                    <br />
                    <span className="text-orange-600">Pure.</span>
                    <br />
                    <span className="text-red-600">Homemade</span>
                  </h1>
                  <p className="text-xl text-gray-700 max-w-lg leading-relaxed">
                    Indulge in elegant homemade food products, made
                    with the finest ingredients and traditional
                    recipes passed down through generations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Link href="/products">
                      <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        🛒 Shop Now
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Content - Enhanced Product Showcase */}
              <div className="relative">
                <div className="relative z-10">
                  {/* Main Product Display */}
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-all duration-500 hover:shadow-2xl border border-orange-100">
                        <div className="w-full h-40 bg-gradient-to-br from-red-100 via-red-200 to-red-300 rounded-xl flex items-center justify-center mb-4 shadow-inner">
                          <span className="text-4xl animate-bounce">🌶️</span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-800 mb-2">FLAX SEEDS CHUTNEY POWDER</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">JUST</span>
                            <span className="ml-2 text-xs text-orange-600 font-semibold">Gruhapaaka</span>
                          </div>
                          <span className="text-orange-600 font-bold text-sm">₹299</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 pt-12">
                      <div className="bg-white rounded-2xl shadow-xl p-6 transform -rotate-2 hover:rotate-0 transition-all duration-500 hover:shadow-2xl border border-orange-100">
                        <div className="w-full h-40 bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 rounded-xl flex items-center justify-center mb-4 shadow-inner">
                          <span className="text-4xl animate-pulse">🥄</span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-800 mb-2">LEMON RASAM POWDER</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">JUST</span>
                            <span className="ml-2 text-xs text-orange-600 font-semibold">Gruhapaaka</span>
                          </div>
                          <span className="text-orange-600 font-bold text-sm">₹249</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Products */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-4 transform rotate-1 hover:rotate-0 transition-all duration-300 hover:shadow-xl border border-orange-100">
                      <div className="w-full h-24 bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-200 rounded-lg flex items-center justify-center mb-3 shadow-inner">
                        <span className="text-2xl">🍯</span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-800 text-center">PURE HONEY</h4>
                      <p className="text-orange-600 font-bold text-xs text-center mt-1">₹399</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 transform -rotate-1 hover:rotate-0 transition-all duration-300 hover:shadow-xl border border-orange-100">
                      <div className="w-full h-24 bg-gradient-to-br from-amber-100 via-amber-200 to-orange-200 rounded-lg flex items-center justify-center mb-3 shadow-inner">
                        <span className="text-2xl">🥜</span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-800 text-center">ORGANIC JAGGERY</h4>
                      <p className="text-orange-600 font-bold text-xs text-center mt-1">₹199</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 transform rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-xl border border-orange-100">
                      <div className="w-full h-24 bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 rounded-lg flex items-center justify-center mb-3 shadow-inner">
                        <span className="text-2xl">🌿</span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-800 text-center">FRESH HERBS</h4>
                      <p className="text-orange-600 font-bold text-xs text-center mt-1">₹149</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Decorative Elements */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-400 rounded-full transform rotate-45 animate-pulse"></div>
                </div>
                <div className="absolute -top-10 -right-10 w-32 h-32 opacity-15">
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

        {/* Special Offers */}
        {discountedProducts.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 Special Offers</h2>
                <p className="text-gray-600">Limited time deals on premium spices</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedProducts.map(product => (
                <div key={product._id} className="group">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/products?discount=true">
                <Button variant="outline" className="w-full">View All Deals</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Featured Products</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover our premium selection of authentic spices and seasonings
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {featuredProducts.map(product => (
                  <div key={product._id} className="group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Explore Products Button */}
              <div className="text-center">
                <Link href="/products">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    Explore All Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Featured Categories */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated categories of premium spices and seasonings
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              Why Choose SpiceHub?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to bringing you the finest spices with unmatched quality and service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">🌱</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Farm Fresh Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sourced directly from farms around the world for maximum freshness and authentic flavors.
                </p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-200">🚚</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Free shipping on orders over $50. Get your spices delivered fresh to your doorstep.
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
          <h2 className="text-3xl font-bold mb-4">Stay Updated with SpiceHub</h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            Get the latest updates on new arrivals, special offers, and cooking tips delivered to your inbox.
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
