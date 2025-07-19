'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/utils/currency';

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, cartCount, removeFromCart, clearCart, isLoading } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  // Remove the login requirement - allow guest users to view cart



  const handleRemoveFromCart = useCallback(async (productId: string, productName?: string) => {
    const success = await removeFromCart(productId);

    if (success) {
      showToast({
        type: 'info',
        message: `${productName || 'Item'} removed from cart`,
        duration: 3000
      });
    } else {
      showToast({
        type: 'error',
        message: 'Failed to remove item from cart',
        duration: 3000
      });
    }
  }, [removeFromCart, showToast]);

  const handleClearCart = useCallback(async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      const success = await clearCart();
      if (success) {
        showToast({
          type: 'info',
          message: 'Cart cleared successfully',
          duration: 3000
        });
      } else {
        showToast({
          type: 'error',
          message: 'Failed to clear cart',
          duration: 3000
        });
      }
    }
  }, [clearCart, showToast]);

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
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Cart</span>
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => (
                    <div key={item.id || item.productId || index} className="p-6 flex items-center space-x-4">
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
                          {formatCurrency(item.product?.price || 0)}
                        </p>
                      </div>

                      {/* Quantity Display Only */}
                      <div className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg bg-gray-50">
                            <span className="text-lg font-semibold text-gray-800">{item.quantity}</span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">qty</span>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(item.total)}
                        </p>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId, item.product?.name)}
                          disabled={isLoading}
                          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center space-x-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
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
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cartTotal >= 2000 ? 'Free' : formatCurrency(99)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-medium">{formatCurrency(cartTotal * 0.18)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">
                        {formatCurrency(cartTotal + (cartTotal >= 2000 ? 0 : 99) + cartTotal * 0.18)}
                      </span>
                    </div>
                  </div>
                </div>

                {cartTotal >= 2000 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700">
                      🎉 You qualify for free shipping!
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-orange-700">
                      Add {formatCurrency(2000 - cartTotal)} more for free shipping
                    </p>
                  </div>
                )}

                <Link href="/checkout">
                  <Button className="w-full mb-3" size="lg" variant="gradient">
                    Proceed to Checkout
                  </Button>
                </Link>
                
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
