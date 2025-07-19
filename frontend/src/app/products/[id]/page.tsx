'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const product = products.find(p => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Get related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.category.id === product.category.id && p.id !== product.id)
    .slice(0, 4);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      alert(`Added ${quantity} x ${product.name} to cart!`);
    }
  };

  const handleAddToWishlist = async () => {
    if (isInWishlist(product.id)) {
      const success = await removeFromWishlist(product.id);
      if (success) {
        alert(`Removed ${product.name} from wishlist!`);
      }
    } else {
      const success = await addToWishlist(product.id);
      if (success) {
        alert(`Added ${product.name} to wishlist!`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-orange-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-orange-600">Products</Link></li>
            <li>/</li>
            <li><Link href={`/categories/${product.category.slug}`} className="hover:text-orange-600">{product.category.name}</Link></li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-9xl">{product.category.image}</div>
              </div>
              {/* Thumbnail images would go here in a real app */}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <div>
                <Link href={`/categories/${product.category.slug}`} className="text-orange-600 hover:text-orange-700 font-medium">
                  {product.category.name}
                </Link>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-semibold">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
                  {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Product Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{product.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium">{product.origin}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quantity and Add to Cart */}
              {product.inStock && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-700 font-medium">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={handleAddToCart} className="flex-1" size="lg">
                      Add to Cart - ${(product.price * quantity).toFixed(2)}
                    </Button>
                    <Button
                      onClick={handleAddToWishlist}
                      variant="outline"
                      size="lg"
                      disabled={wishlistLoading}
                    >
                      <svg
                        className={`h-5 w-5 ${isInWishlist(product.id) ? 'text-red-500 fill-current' : ''}`}
                        fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {['description', 'specifications', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    selectedTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {selectedTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="font-medium text-gray-900">Weight</dt>
                    <dd className="text-gray-700">{product.weight}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Origin</dt>
                    <dd className="text-gray-700">{product.origin}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Category</dt>
                    <dd className="text-gray-700">{product.category.name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Stock</dt>
                    <dd className="text-gray-700">{product.stockQuantity} units</dd>
                  </div>
                </dl>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <p className="text-gray-600">Reviews feature coming soon...</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
