/**
 * Currency utility functions for Indian Rupees (INR)
 */

/**
 * Format a number as Indian Rupees
 * @param amount - The amount in paise (smallest unit) or rupees
 * @param inPaise - Whether the amount is in paise (true) or rupees (false)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, inPaise: boolean = false): string => {
  const rupees = inPaise ? amount / 100 : amount;
  
  // Use Indian number formatting with commas
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(rupees);
};

/**
 * Format currency without the currency symbol
 * @param amount - The amount in paise or rupees
 * @param inPaise - Whether the amount is in paise (true) or rupees (false)
 * @returns Formatted number string with commas
 */
export const formatCurrencyNumber = (amount: number, inPaise: boolean = false): string => {
  const rupees = inPaise ? amount / 100 : amount;
  
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(rupees);
};

/**
 * Convert USD to INR (approximate conversion rate)
 * @param usdAmount - Amount in USD
 * @returns Amount in INR
 */
export const convertUSDToINR = (usdAmount: number): number => {
  const exchangeRate = 83; // Approximate USD to INR rate
  return Math.round(usdAmount * exchangeRate);
};

/**
 * Format price with discount calculation
 * @param price - Current price in rupees
 * @param originalPrice - Original price in rupees (optional)
 * @returns Object with formatted prices and discount percentage
 */
export const formatPriceWithDiscount = (price: number, originalPrice?: number) => {
  const formattedPrice = formatCurrency(price);
  
  if (originalPrice && originalPrice > price) {
    const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
    const formattedOriginalPrice = formatCurrency(originalPrice);
    
    return {
      price: formattedPrice,
      originalPrice: formattedOriginalPrice,
      discountPercentage,
      hasDiscount: true,
      savings: formatCurrency(originalPrice - price)
    };
  }
  
  return {
    price: formattedPrice,
    originalPrice: null,
    discountPercentage: 0,
    hasDiscount: false,
    savings: null
  };
};

/**
 * Calculate tax amount (GST for India)
 * @param amount - Base amount in rupees
 * @param taxRate - Tax rate as decimal (default 18% GST)
 * @returns Tax amount in rupees
 */
export const calculateTax = (amount: number, taxRate: number = 0.18): number => {
  return Math.round(amount * taxRate);
};

/**
 * Calculate shipping cost based on order value
 * @param orderValue - Total order value in rupees
 * @param freeShippingThreshold - Minimum order value for free shipping (default ₹2000)
 * @returns Shipping cost in rupees
 */
export const calculateShipping = (orderValue: number, freeShippingThreshold: number = 2000): number => {
  if (orderValue >= freeShippingThreshold) {
    return 0;
  }
  return 99; // Standard shipping cost ₹99
};

/**
 * Format order summary with all calculations
 * @param subtotal - Subtotal in rupees
 * @param taxRate - Tax rate as decimal
 * @param freeShippingThreshold - Free shipping threshold
 * @returns Complete order summary
 */
export const formatOrderSummary = (
  subtotal: number, 
  taxRate: number = 0.18, 
  freeShippingThreshold: number = 2000
) => {
  const tax = calculateTax(subtotal, taxRate);
  const shipping = calculateShipping(subtotal, freeShippingThreshold);
  const total = subtotal + tax + shipping;
  
  return {
    subtotal: formatCurrency(subtotal),
    subtotalRaw: subtotal,
    tax: formatCurrency(tax),
    taxRaw: tax,
    shipping: shipping === 0 ? 'Free' : formatCurrency(shipping),
    shippingRaw: shipping,
    total: formatCurrency(total),
    totalRaw: total,
    freeShippingEligible: subtotal >= freeShippingThreshold,
    freeShippingRemaining: subtotal < freeShippingThreshold ? freeShippingThreshold - subtotal : 0
  };
};

/**
 * Currency constants for the application
 */
export const CURRENCY_CONFIG = {
  symbol: '₹',
  code: 'INR',
  name: 'Indian Rupee',
  locale: 'en-IN',
  freeShippingThreshold: 2000,
  standardShipping: 99,
  gstRate: 0.18
};
