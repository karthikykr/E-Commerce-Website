'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  customerInfo: {
    name: string;
    email: string;
  };
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onSuccess,
  onError,
  customerInfo,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { addToast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent on component mount
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          customer: customerInfo,
        }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      onError('Failed to initialize payment. Please try again.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
      });

      if (error) {
        console.error('Payment error:', error);
        onError(error.message || 'Payment failed. Please try again.');
        addToast({
          type: 'error',
          title: 'Payment Failed',
          message: error.message || 'Please check your card details and try again.',
          duration: 5000,
        });
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
        addToast({
          type: 'success',
          title: 'Payment Successful!',
          message: 'Your payment has been processed successfully.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  return (
    <Card variant="outlined" padding="lg">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Credit Card Payment
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Secure payment powered by Stripe
        </p>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-xs text-gray-500">
              Your payment information is encrypted and secure.
            </p>
          </div>

          {/* Security Features */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">Secure Payment</p>
                <p className="text-xs text-green-700">256-bit SSL encryption</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            loading={isProcessing}
            variant="gradient"
            size="lg"
            fullWidth
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          >
            {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </Button>

          {/* Accepted Cards */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500">We accept:</span>
            <div className="flex space-x-2">
              <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                VISA
              </div>
              <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                MC
              </div>
              <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                AMEX
              </div>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

interface StripePaymentProps {
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  customerInfo: {
    name: string;
    email: string;
  };
}

export const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

// Alternative Payment Methods Component
export const AlternativePaymentMethods: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card variant="outlined" padding="md" className="cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
              PayPal
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">PayPal</p>
              <p className="text-sm text-gray-500">Pay with your PayPal account</p>
            </div>
          </div>
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>

      <Card variant="outlined" padding="md" className="cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-sm">
              Pay
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">Apple Pay</p>
              <p className="text-sm text-gray-500">Pay with Touch ID or Face ID</p>
            </div>
          </div>
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>

      <Card variant="outlined" padding="md" className="cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm">
              G Pay
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">Google Pay</p>
              <p className="text-sm text-gray-500">Pay with Google Pay</p>
            </div>
          </div>
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </div>
  );
};
