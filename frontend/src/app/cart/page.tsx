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
  const { cartItems, cartTotal, cartCount, removeFromCart, clearCart, updateQuantity, isLoading } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  // Remove the login requirement - allow guest users to view cart



  const handleIncreaseQuantity = useCallback(async (productId: string, currentQuantity: number, productName?: string) => {
    const success = await updateQuantity(productId, currentQuantity + 1);
    if (!success) {
      showToast({
        type: 'error',
        message: `Failed to update ${productName || 'item'} quantity`,
        duration: 3000
      });
    }
  }, [updateQuantity, showToast]);

  const handleDecreaseQuantity = useCallback(async (productId: string, currentQuantity: number, productName?: string) => {
    if (currentQuantity <= 1) {
      return; // Don't allow quantity to go below 1
    }

    const success = await updateQuantity(productId, currentQuantity - 1);

    if (!success) {
      showToast({
        type: 'error',
        message: `Failed to update ${productName || 'item'} quantity`,
        duration: 3000
      });
    }
  }, [updateQuantity, showToast]);

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
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-5 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">🛒 Shopping Cart</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-10 sm:py-12 md:py-16 px-4">
            <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6">🛒</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">Your cart is empty</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">Start shopping to add items to your cart</p>
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto min-h-[48px]">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items - Enhanced Mobile Layout */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 sm:p-5 md:p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center space-x-1 touch-manipulation py-2 px-1"
                  >
                    <svg className="h-4 w-4 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Clear Cart</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => (
                    <div key={item.id || item.productId || index} className="p-4 sm:p-5 md:p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-2xl sm:text-3xl">{item.product?.category?.image || '🌶️'}</div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/products/${item.productId}`} className="hover:text-orange-600 touch-manipulation">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-2 leading-tight">
                                {item.product?.name || 'Product'}
                              </h3>
                            </Link>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.product?.category?.name}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{item.product?.weight}</p>
                            <p className="text-lg sm:text-xl font-semibold text-orange-600 mt-2">
                              {formatCurrency(item.product?.price || 0)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveFromCart(item.productId, item.product?.name)}
                            disabled={isLoading}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 touch-manipulation"
                            title="Remove item"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Quantity Controls and Total - Mobile Layout */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-3">Qty:</span>
                            <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white">
                              {/* Decrease Button */}
                              <button
                                onClick={() => handleDecreaseQuantity(item.productId, item.quantity, item.product?.name)}
                                disabled={isLoading || item.quantity <= 1}
                                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-bold rounded-l-lg transition-all duration-200 touch-manipulation ${
                                  item.quantity <= 1
                                    ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                    : 'text-orange-600 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100'
                                }`}
                                title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                              >
                                −
                              </button>

                              {/* Quantity Display */}
                              <div className="w-12 h-10 sm:w-16 sm:h-12 flex items-center justify-center border-l border-r border-gray-300 bg-gray-50">
                                <span className="text-base sm:text-lg font-semibold text-gray-800">{item.quantity}</span>
                              </div>

                              {/* Increase Button */}
                              <button
                                onClick={() => handleIncreaseQuantity(item.productId, item.quantity, item.product?.name)}
                                disabled={isLoading}
                                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-bold text-orange-600 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100 rounded-r-lg transition-all duration-200 disabled:opacity-50 touch-manipulation"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-lg sm:text-xl font-semibold text-gray-900">
                              {formatCurrency(item.total)}
                            </p>
                          </div>
                        </div>
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
                  <Button className="w-full mb-3" size="lg" variant="primary">
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
