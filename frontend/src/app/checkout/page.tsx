'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';
import { StripePayment } from '@/components/payment/StripePayment';
import { formatOrderSummary, formatCurrency } from '@/utils/currency';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'credit_card',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    
    if (cartCount === 0) {
      router.push('/cart');
      return;
    }
  }, [user, cartCount, router]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validate shipping address
      if (!shippingAddress.firstName) newErrors.firstName = 'First name is required';
      if (!shippingAddress.lastName) newErrors.lastName = 'Last name is required';
      if (!shippingAddress.email) newErrors.email = 'Email is required';
      if (!shippingAddress.phone) newErrors.phone = 'Phone is required';
      if (!shippingAddress.address) newErrors.address = 'Address is required';
      if (!shippingAddress.city) newErrors.city = 'City is required';
      if (!shippingAddress.state) newErrors.state = 'State is required';
      if (!shippingAddress.zipCode) newErrors.zipCode = 'ZIP code is required';
    }

    if (step === 2 && paymentMethod.type !== 'cash_on_delivery') {
      // Validate payment method
      if (!paymentMethod.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!paymentMethod.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!paymentMethod.cvv) newErrors.cvv = 'CVV is required';
      if (!paymentMethod.cardholderName) newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        shippingAddress,
        paymentMethod: paymentMethod.type,
        billingAddress: shippingAddress, // Using same as shipping for now
      };

      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        addToast({
          type: 'success',
          title: 'Order Placed Successfully!',
          message: `Your order #${data.data.order.orderNumber} has been placed.`,
          duration: 5000,
        });
        router.push(`/orders/${data.data.order._id}`);
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      addToast({
        type: 'error',
        title: 'Order Failed',
        message: 'There was an error placing your order. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || cartCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const orderSummary = formatOrderSummary(cartTotal);

  const steps = [
    { number: 1, title: 'Shipping', description: 'Enter your shipping information' },
    { number: 2, title: 'Payment', description: 'Choose your payment method' },
    { number: 3, title: 'Review', description: 'Review and place your order' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${currentStep >= step.number 
                    ? 'bg-orange-600 border-orange-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                  }
                `}>
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 text-left">
                  <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-orange-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-4 transition-all duration-300
                    ${currentStep > step.number ? 'bg-orange-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card padding="lg" className="animate-fade-in-up">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                    <p className="text-gray-600 mt-1">Please provide your shipping details</p>
                  </CardHeader>

                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        error={errors.firstName}
                        required
                      />
                      <Input
                        label="Last Name"
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        error={errors.lastName}
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                        error={errors.email}
                        required
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        error={errors.phone}
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <Input
                        label="Address"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                        error={errors.address}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Input
                        label="City"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        error={errors.city}
                        required
                      />
                      <Input
                        label="State"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        error={errors.state}
                        required
                      />
                      <Input
                        label="ZIP Code"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        error={errors.zipCode}
                        required
                      />
                    </div>
                  </CardBody>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                    <p className="text-gray-600 mt-1">Choose how you'd like to pay</p>
                  </CardHeader>

                  <CardBody>
                    <div className="space-y-4">
                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className={`
                            border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                            ${paymentMethod.type === 'credit_card'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                          onClick={() => setPaymentMethod({...paymentMethod, type: 'credit_card'})}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={paymentMethod.type === 'credit_card'}
                              onChange={() => setPaymentMethod({...paymentMethod, type: 'credit_card'})}
                              className="mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">Credit Card</p>
                              <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`
                            border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                            ${paymentMethod.type === 'cash_on_delivery'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                          onClick={() => setPaymentMethod({...paymentMethod, type: 'cash_on_delivery'})}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={paymentMethod.type === 'cash_on_delivery'}
                              onChange={() => setPaymentMethod({...paymentMethod, type: 'cash_on_delivery'})}
                              className="mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">Cash on Delivery</p>
                              <p className="text-sm text-gray-500">Pay when you receive your order</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Credit Card Form */}
                      {paymentMethod.type === 'credit_card' && (
                        <div className="mt-6 space-y-4 animate-fade-in-up">
                          <Input
                            label="Cardholder Name"
                            value={paymentMethod.cardholderName || ''}
                            onChange={(e) => setPaymentMethod({...paymentMethod, cardholderName: e.target.value})}
                            error={errors.cardholderName}
                            required
                          />
                          <Input
                            label="Card Number"
                            value={paymentMethod.cardNumber || ''}
                            onChange={(e) => setPaymentMethod({...paymentMethod, cardNumber: e.target.value})}
                            error={errors.cardNumber}
                            placeholder="1234 5678 9012 3456"
                            required
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Expiry Date"
                              value={paymentMethod.expiryDate || ''}
                              onChange={(e) => setPaymentMethod({...paymentMethod, expiryDate: e.target.value})}
                              error={errors.expiryDate}
                              placeholder="MM/YY"
                              required
                            />
                            <Input
                              label="CVV"
                              value={paymentMethod.cvv || ''}
                              onChange={(e) => setPaymentMethod({...paymentMethod, cvv: e.target.value})}
                              error={errors.cvv}
                              placeholder="123"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-900">Review Your Order</h2>
                    <p className="text-gray-600 mt-1">Please review your order before placing it</p>
                  </CardHeader>

                  <CardBody>
                    <div className="space-y-6">
                      {/* Shipping Address Review */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-900">
                            {shippingAddress.firstName} {shippingAddress.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{shippingAddress.address}</p>
                          <p className="text-sm text-gray-600">
                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                          </p>
                          <p className="text-sm text-gray-600">{shippingAddress.phone}</p>
                        </div>
                      </div>

                      {/* Payment Method Review */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-900">
                            {paymentMethod.type === 'credit_card' ? 'Credit Card' : 'Cash on Delivery'}
                          </p>
                          {paymentMethod.type === 'credit_card' && paymentMethod.cardNumber && (
                            <p className="text-sm text-gray-600">
                              **** **** **** {paymentMethod.cardNumber.slice(-4)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Items Review */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                  <span className="text-sm">{item.product?.category?.image || '🌶️'}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency((item.product?.price || 0) * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <div>
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handlePreviousStep}>
                      Previous
                    </Button>
                  )}
                </div>
                <div>
                  {currentStep < 3 ? (
                    <Button onClick={handleNextStep}>
                      Next Step
                    </Button>
                  ) : (
                    <Button 
                      onClick={handlePlaceOrder} 
                      loading={isLoading}
                      variant="gradient"
                      size="lg"
                    >
                      Place Order
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card padding="lg" variant="elevated" className="sticky top-8 animate-fade-in-up">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              </CardHeader>
              
              <CardBody>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{item.product?.category?.image || '🌶️'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{orderSummary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">{orderSummary.shipping}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="text-gray-900">{orderSummary.tax}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-orange-600">{orderSummary.total}</span>
                  </div>
                </div>

                {orderSummary.freeShippingEligible ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-green-700">
                      🎉 You qualify for free shipping!
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-orange-700">
                      Add {formatCurrency(orderSummary.freeShippingRemaining)} more for free shipping
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
