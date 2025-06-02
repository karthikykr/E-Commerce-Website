'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(product.id, 1);
    if (success) {
      alert(`Added ${product.name} to cart!`);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-100 flex items-center justify-center">
          {/* Placeholder for product image */}
          <div className="text-6xl">
            {product.category.image}
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              Out of Stock
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 ${
              wishlistLoading ? 'cursor-not-allowed' : ''
            }`}
          >
            <svg
              className={`h-5 w-5 transition-colors ${
                isInWishlist(product.id)
                  ? 'text-red-500 fill-current'
                  : 'text-gray-600 hover:text-red-500'
              }`}
              fill={isInWishlist(product.id) ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-sm text-orange-600 font-medium mb-1">
            {product.category.name}
          </p>

          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {product.weight}
            </span>
          </div>

          {/* Origin */}
          <p className="text-xs text-gray-500 mb-3">
            Origin: {product.origin}
          </p>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || cartLoading}
            className="w-full"
            variant={product.inStock ? 'primary' : 'secondary'}
          >
            {cartLoading ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </Link>
  );
};
