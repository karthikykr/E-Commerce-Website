import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { categories, products } from '@/data/products';
import { Button } from '@/components/ui/Button';

export default function CategoriesPage() {
  // Get product count for each category
  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(product => product.category.id === categoryId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header - Mobile Responsive */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Spice Categories
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our carefully curated collection of spices, herbs, and blends
            organized by category to help you find exactly what you need.
          </p>
        </div>

        {/* Categories Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {categories.map(category => {
            const productCount = getCategoryProductCount(category.id);
            
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                {/* Category Image/Icon - Mobile Responsive */}
                <div className="h-40 sm:h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <div className="text-6xl sm:text-7xl lg:text-8xl group-hover:scale-110 transition-transform duration-300">
                    {category.image}
                  </div>
                </div>

                {/* Category Info - Mobile Responsive */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {productCount} product{productCount !== 1 ? 's' : ''}
                    </span>
                    <Link href={`/products?category=${category.id}`}>
                      <Button size="sm" className="w-full sm:w-auto">
                        View Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Our Spices?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold mb-2">Farm Fresh</h3>
                <p className="text-gray-600">
                  Sourced directly from farms around the world for maximum freshness and flavor.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="text-lg font-semibold mb-2">Quality Tested</h3>
                <p className="text-gray-600">
                  Every batch is tested for purity, potency, and quality before reaching you.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">Fresh Packaging</h3>
                <p className="text-gray-600">
                  Sealed in airtight containers to preserve aroma and extend shelf life.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Products Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Can't Decide? Start with Our Bestsellers
          </h2>
          <p className="text-gray-600 mb-8">
            These are the most loved spices by our customers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products?sort=rating">
              <Button size="lg">
                View Bestsellers
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg">
                Browse All Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-orange-50 rounded-lg p-8 mt-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Stay Updated with New Arrivals
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to know about new spices, recipes, and special offers
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button>
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
