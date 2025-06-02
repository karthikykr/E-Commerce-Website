'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistItems, wishlistCount, removeFromWishlist, isLoading: wishlistLoading } = useWishlist();
  const { addToCart, isLoading: cartLoading } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    const success = await addToCart(productId, 1);
    if (success) {
      alert(`Added ${productName} to cart!`);
    }
  };

  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    const success = await removeFromWishlist(productId);
    if (success) {
      alert(`Removed ${productName} from wishlist!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistCount > 0 ? `${wishlistCount} item${wishlistCount !== 1 ? 's' : ''} in your wishlist` : 'Your wishlist is empty'}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8">Save items you love to your wishlist</p>
            <Link href="/products">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                  <div className="text-6xl">{item.product?.category?.image || '🌶️'}</div>
                  
                  {/* Remove from Wishlist Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId, item.product?.name || 'Product')}
                    disabled={wishlistLoading}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Stock Status */}
                  {!item.product?.inStock && (
                    <div className="absolute top-2 left-2 bg-gray-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Category */}
                  <p className="text-sm text-orange-600 font-medium mb-1">
                    {item.product?.category?.name}
                  </p>
                  
                  {/* Product Name */}
                  <Link href={`/products/${item.productId}`} className="hover:text-orange-600">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.product?.name || 'Product'}
                    </h3>
                  </Link>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.product?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {item.product?.rating} ({item.product?.reviewCount})
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">
                        ${item.product?.price}
                      </span>
                      {item.product?.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.product?.weight}
                    </span>
                  </div>
                  
                  {/* Origin */}
                  <p className="text-xs text-gray-500 mb-3">
                    Origin: {item.product?.origin}
                  </p>
                  
                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleAddToCart(item.productId, item.product?.name || 'Product')}
                      disabled={!item.product?.inStock || cartLoading}
                      className="w-full"
                      variant={item.product?.inStock ? 'primary' : 'secondary'}
                    >
                      {cartLoading ? 'Adding...' : item.product?.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    
                    <Link href={`/products/${item.productId}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Added Date */}
                  <p className="text-xs text-gray-400 mt-3">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
