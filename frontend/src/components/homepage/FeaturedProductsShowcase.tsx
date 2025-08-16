'use client';

import { useEffect, useState } from 'react';

interface FeaturedProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: {
    url: string;
    alt: string;
  };
  emoji: string;
  backgroundColor: string;
  position: string;
  animation: string;
  rotation: string;
  hoverRotation: string;
  discountPercentage: number;
}

interface GroupedProducts {
  heroMain: FeaturedProduct[];
  heroBottom: FeaturedProduct[];
}

export default function FeaturedProductsShowcase() {
  const [featuredProducts, setFeaturedProducts] = useState<GroupedProducts>({
    heroMain: [],
    heroBottom: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/featured-products/homepage');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFeaturedProducts(data.data.featuredProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="relative z-10">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-200 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 animate-pulse">
                <div className="w-full h-32 sm:h-40 bg-gray-300 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 sm:pt-12">
              <div className="bg-gray-200 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 animate-pulse">
                <div className="w-full h-32 sm:h-40 bg-gray-300 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 animate-pulse">
                <div className="w-full h-20 sm:h-24 bg-gray-300 rounded-md sm:rounded-lg mb-2 sm:mb-3"></div>
                <div className="h-3 bg-gray-300 rounded mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative z-10">
        {/* Main Product Display - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
          {/* Hero Main Products */}
          {featuredProducts.heroMain.map((product, index) => (
            <div 
              key={product._id} 
              className={`space-y-4 sm:space-y-6 ${index === 1 ? 'sm:pt-12' : ''}`}
            >
              <div className={`bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 transform ${product.rotation} hover:${product.hoverRotation} transition-all duration-500 hover:shadow-2xl border border-orange-100`}>
                <div className={`w-full h-32 sm:h-40 bg-gradient-to-br ${product.backgroundColor} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-inner relative overflow-hidden`}>
                  {product.image?.url ? (
                    <img
                      src={`http://localhost:5000${product.image.url}`}
                      alt={product.image.alt}
                      className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                    />
                  ) : (
                    <span className={`text-3xl sm:text-4xl animate-${product.animation}`}>
                      {product.emoji}
                    </span>
                  )}
                  {product.discountPercentage > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
                        -{product.discountPercentage}%
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-800 mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="bg-orange-600 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-bold">JUST</span>
                    <span className="ml-1 sm:ml-2 text-xs text-orange-600 font-semibold">Gruhapaaka</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-orange-600 font-bold text-xs sm:text-sm">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-xs">₹{product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Products - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {featuredProducts.heroBottom.map((product) => (
            <div 
              key={product._id} 
              className={`bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 transform ${product.rotation} hover:${product.hoverRotation} transition-all duration-300 hover:shadow-xl border border-orange-100 relative overflow-hidden`}
            >
              <div className={`w-full h-20 sm:h-24 bg-gradient-to-br ${product.backgroundColor} rounded-md sm:rounded-lg flex items-center justify-center mb-2 sm:mb-3 shadow-inner relative`}>
                {product.image?.url ? (
                  <img
                    src={`http://localhost:5000${product.image.url}`}
                    alt={product.image.alt}
                    className="w-full h-full object-cover rounded-md sm:rounded-lg"
                  />
                ) : (
                  <span className={`text-xl sm:text-2xl animate-${product.animation}`}>
                    {product.emoji}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <div className="absolute top-1 right-1">
                    <span className="bg-red-500 text-white px-1 py-0.5 text-xs font-bold rounded">
                      -{product.discountPercentage}%
                    </span>
                  </div>
                )}
              </div>
              <h4 className="font-bold text-xs text-gray-800 text-center">{product.name}</h4>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <p className="text-orange-600 font-bold text-xs text-center">₹{product.price}</p>
                {product.originalPrice && (
                  <span className="text-gray-400 line-through text-xs">₹{product.originalPrice}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
