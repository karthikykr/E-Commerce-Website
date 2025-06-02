'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, isLoading } = useCart();
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
          <p className="text-gray-600 mb-8">You need to be logged in to view your cart.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <Link href="/products">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-3xl">{item.product?.category?.image || '🌶️'}</div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`} className="hover:text-orange-600">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.product?.name || 'Product'}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">{item.product?.category?.name}</p>
                        <p className="text-sm text-gray-500">{item.product?.weight}</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ${item.product?.price || 0}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={isLoading}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= (item.product?.stockQuantity || 0)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${item.total.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          disabled={isLoading}
                          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cartTotal >= 50 ? 'Free' : '$5.99'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">
                        ${(cartTotal + (cartTotal >= 50 ? 0 : 5.99) + cartTotal * 0.08).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {cartTotal >= 50 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700">
                      🎉 You qualify for free shipping!
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-orange-700">
                      Add ${(50 - cartTotal).toFixed(2)} more for free shipping
                    </p>
                  </div>
                )}

                <Button className="w-full mb-3" size="lg">
                  Proceed to Checkout
                </Button>
                
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
