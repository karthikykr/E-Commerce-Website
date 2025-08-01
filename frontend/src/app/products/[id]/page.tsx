'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  // Fetch product data from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the specific product
        const productResponse = await fetch(`http://localhost:5000/api/products/${productId}`);
        const productData = await productResponse.json();

        if (productData.success && productData.data) {
          const fetchedProduct = productData.data;
          setProduct(fetchedProduct);

          // Fetch related products from the same category
          const relatedResponse = await fetch(`http://localhost:5000/api/products?category=${fetchedProduct.category._id || fetchedProduct.category.id}&limit=4`);
          const relatedData = await relatedResponse.json();

          if (relatedData.success && relatedData.data?.products) {
            // Filter out the current product from related products
            const filtered = relatedData.data.products.filter((p: Product) =>
              (p._id || p.id) !== productId
            ).slice(0, 4);
            setRelatedProducts(filtered);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product Not Found'}
          </h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();

  const productIdForActions = product._id || product.id;

  const handleAddToCart = async () => {
    const success = await addToCart(productIdForActions, quantity);
    if (success) {
      alert(`Added ${quantity} x ${product.name} to cart!`);
    }
  };

  const handleAddToWishlist = async () => {
    if (isInWishlist(productIdForActions)) {
      const success = await removeFromWishlist(productIdForActions);
      if (success) {
        alert(`Removed ${product.name} from wishlist!`);
      }
    } else {
      const success = await addToWishlist(productIdForActions);
      if (success) {
        alert(`Added ${product.name} to wishlist!`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb - Mobile Responsive */}
        <nav className="mb-4 sm:mb-6 lg:mb-8">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
            <li><Link href="/" className="hover:text-orange-600 whitespace-nowrap">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-orange-600 whitespace-nowrap">Products</Link></li>
            <li>/</li>
            <li><Link href={`/categories/${product.category.slug}`} className="hover:text-orange-600 whitespace-nowrap">{product.category.name}</Link></li>
            <li>/</li>
            <li className="text-gray-900 truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details - Mobile Responsive */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
            {/* Product Image - Mobile Responsive */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl">{product.category.image}</div>
              </div>
              {/* Thumbnail images would go here in a real app */}
            </div>

            {/* Product Info - Mobile Responsive */}
            <div className="space-y-4 sm:space-y-6">
              {/* Category */}
              <div>
                <Link href={`/categories/${product.category.slug}`} className="text-orange-600 hover:text-orange-700 font-medium text-sm sm:text-base">
                  {product.category.name}
                </Link>
              </div>

              {/* Product Name */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm sm:text-base text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl text-gray-500 line-through">${product.originalPrice}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs sm:text-sm font-semibold">
                      Save {discountPercentage}%
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Status - Mobile Responsive */}
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm sm:text-base font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
                  {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Product Details - Mobile Responsive */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Weight:</span>
                  <span className="text-sm sm:text-base font-medium">{product.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Origin:</span>
                  <span className="text-sm sm:text-base font-medium">{product.origin}</span>
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
                        className={`h-5 w-5 ${isInWishlist(productIdForActions) ? 'text-red-500 fill-current' : ''}`}
                        fill={isInWishlist(productIdForActions) ? 'currentColor' : 'none'}
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
                <ProductCard key={relatedProduct._id || relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
