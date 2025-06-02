'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchSuggestions } from '@/components/ui/SearchSuggestions';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after navigation
      setIsSearchOpen(false); // Close mobile search
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-orange-600">🌶️ SpiceHub</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-orange-600 transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-orange-600 transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for spices..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 1);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 1)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <SearchSuggestions
                  searchQuery={searchQuery}
                  onSelect={(suggestion) => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                  isVisible={showSuggestions}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            </form>
          </div>

          {/* Right Side Icons & Buttons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon (Mobile) */}
            <button
              onClick={toggleSearch}
              className="lg:hidden p-2 text-gray-600 hover:text-orange-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {/* Cart Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist Icon */}
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-orange-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium">{user.name}</span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                    <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Wishlist
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-600 hover:text-orange-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for spices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-orange-600 transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-orange-600 transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {user ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                    <Link href="/profile" className="text-gray-700 hover:text-orange-600 transition-colors py-2">
                      My Profile
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-orange-600 transition-colors py-2">
                      My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" className="text-gray-700 hover:text-orange-600 transition-colors py-2">
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="text-left text-red-600 hover:text-red-700 transition-colors py-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" size="sm" className="w-full">Login</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm" className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
