'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProductCardWrapper } from '@/components/ui/Card';
import { ProductImage } from '@/components/ui/ProductImage';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPriceWithDiscount } from '@/utils/currency';

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  inStock: boolean;
  stockQuantity: number;
  weight: {
    value: number;
    unit: string;
  };
  origin: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  discountPercentage?: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();
  const { showToast } = useToast();

  const priceInfo = formatPriceWithDiscount(product.price, product.originalPrice);

  const productId = product.id || product._id;
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const weightDisplay = `${product.weight.value}${product.weight.unit}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(productId, 1);
    if (success) {
      showToast({
        type: 'success',
        message: `${product.name} has been added to your cart.`,
        duration: 3000,
      });
    } else {
      showToast({
        type: 'error',
        message: 'Could not add item to cart. Please try again.',
        duration: 3000,
      });
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(productId)) {
      const success = await removeFromWishlist(productId);
      if (success) {
        showToast({
          type: 'info',
          message: `${product.name} has been removed from your wishlist.`,
          duration: 3000,
        });
      }
    } else {
      const success = await addToWishlist(productId);
      if (success) {
        showToast({
          type: 'success',
          message: `${product.name} has been added to your wishlist.`,
          duration: 3000,
        });
      }
    }
  };

  return (
    <ProductCardWrapper featured={product.isFeatured} className="hover-lift animate-fade-in-up">
      <Link href={`/products/${productId}`} className="block h-full flex flex-col">
        {/* Product Image - Consistent aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
          <ProductImage
            src={primaryImage?.url}
            alt={primaryImage?.alt || product.name}
            className="w-full h-full group-hover:scale-110 transition-transform duration-300"
            objectFit="cover"
            lazy={true}
            showFallbackIcon={true}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />

          {/* Discount Badge */}
          {priceInfo.hasDiscount && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
              -{priceInfo.discountPercentage}%
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              ⭐ Featured
            </div>
          )}

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Out of Stock
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-50 hover:scale-110 ${
              wishlistLoading ? 'cursor-not-allowed' : ''
            }`}
            aria-label={isInWishlist(productId) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                isInWishlist(productId)
                  ? 'text-red-500 fill-current'
                  : 'text-gray-600 hover:text-red-500'
              }`}
              fill={isInWishlist(productId) ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Product Info - Reduced padding for compact design */}
        <div className="p-3 sm:p-4 md:p-5 flex-grow flex flex-col">
          {/* Category */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full">
              {product.category.name}
            </span>
            {product.stockQuantity <= 10 && product.inStock && (
              <span className="text-xs text-red-600 font-medium">
                Only {product.stockQuantity} left!
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          {/* Description - Reduced margin */}
          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Rating - Reduced margin */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-xs sm:text-sm text-gray-600 font-medium">
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>

          {/* Price - Reduced margin and font size */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {priceInfo.price}
              </span>
              {priceInfo.hasDiscount && priceInfo.originalPrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {priceInfo.originalPrice}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {weightDisplay}
            </span>
          </div>

          {/* Origin & Tags - Reduced margin */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">
              📍 {product.origin}
            </p>
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Spacer to push button to bottom */}
          <div className="flex-grow"></div>

          {/* Add to Cart Button - More compact */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || cartLoading}
            variant="gradient"
            size="md"
            fullWidth
            loading={cartLoading}
            icon={!cartLoading && product.inStock ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
              </svg>
            ) : undefined}
            className="shadow-glow hover:shadow-glow-lg text-sm"
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </Link>
    </ProductCardWrapper>
  );
};
