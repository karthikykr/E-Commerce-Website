import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';
import Link from 'next/link';

export default function Home() {
  // Get featured products (highest rated)
  const featuredProducts = products
    .filter(product => product.inStock)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  // Get discounted products
  const discountedProducts = products
    .filter(product => product.originalPrice && product.inStock)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Premium <span className="text-orange-600">Spices</span> for Every Kitchen
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the finest collection of authentic spices, herbs, and spice blends.
            Fresh, aromatic, and sourced directly from farms around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Categories
              </Button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Premium Spices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">25+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Special Offers */}
        {discountedProducts.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">🔥 Special Offers</h2>
              <Link href="/products?discount=true">
                <Button variant="outline">View All Deals</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">⭐ Featured Products</h2>
            <Link href="/products?sort=rating">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/products?category=1" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group-hover:scale-105 transform duration-300">
                <div className="text-4xl mb-4">🌶️</div>
                <h3 className="text-xl font-semibold mb-2">Whole Spices</h3>
                <p className="text-gray-600">Fresh whole spices for maximum flavor and aroma</p>
              </div>
            </Link>
            <Link href="/products?category=2" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group-hover:scale-105 transform duration-300">
                <div className="text-4xl mb-4">🥄</div>
                <h3 className="text-xl font-semibold mb-2">Ground Spices</h3>
                <p className="text-gray-600">Finely ground spices ready for cooking</p>
              </div>
            </Link>
            <Link href="/products?category=3" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow group-hover:scale-105 transform duration-300">
                <div className="text-4xl mb-4">🌿</div>
                <h3 className="text-xl font-semibold mb-2">Spice Blends</h3>
                <p className="text-gray-600">Expertly crafted blends for authentic flavors</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose SpiceHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-4">Farm Fresh Quality</h3>
              <p className="text-gray-600">
                Sourced directly from farms around the world for maximum freshness and authentic flavors.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-gray-600">
                Free shipping on orders over $50. Get your spices delivered fresh to your doorstep.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-4">Quality Guarantee</h3>
              <p className="text-gray-600">
                100% satisfaction guarantee. If you're not happy, we'll make it right.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
