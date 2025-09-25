'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import { useAuth } from '@/contexts/AuthContext';
// import { useCart } from '@/contexts/CartContext';
// import { useWishlist } from '@/contexts/WishlistContext';

export const Header = () => {
  const { user, logout } = useAuth();
  // const { cartCount } = useCart();
  // const { wishlistCount } = useWishlist();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        menuButtonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg border-b border-orange-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-16">
          {/* Logo - Enhanced mobile sizing */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-md transform group-hover:scale-105 transition-transform duration-200">
                  JUST
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent leading-tight">
                    Gruhapaaka
                  </h1>
                  <span className="text-xs text-orange-600 font-medium -mt-0.5 hidden sm:block">
                    Homemade Delights
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-4 xl:space-x-8">
            <Link
              href="/"
              className="relative text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium px-2 py-1 rounded-md hover:bg-orange-50 group"
            >
              <span className="text-sm xl:text-base">Home</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-600 to-red-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/products"
              className="relative text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium px-2 py-1 rounded-md hover:bg-orange-50 group"
            >
              <span className="text-sm xl:text-base">Products</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-600 to-red-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/categories"
              className="relative text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium px-2 py-1 rounded-md hover:bg-orange-50 group"
            >
              <span className="text-sm xl:text-base">Categories</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-600 to-red-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/about"
              className="relative text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium px-2 py-1 rounded-md hover:bg-orange-50 group"
            >
              <span className="text-sm xl:text-base">About</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-600 to-red-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/contact"
              className="relative text-gray-700 hover:text-orange-600 transition-all duration-200 font-medium px-2 py-1 rounded-md hover:bg-orange-50 group"
            >
              <span className="text-sm xl:text-base">Contact</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-600 to-red-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
          </nav>

          {/* Right Side Icons & Buttons - Enhanced mobile touch targets */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 lg:space-x-4">
            {/* Cart Icon - Enhanced mobile touch target */}
            <Link
              href="/cart"
              className="relative p-2 sm:p-2.5 md:p-3 text-gray-600 hover:text-orange-600 active:text-orange-700 transition-all duration-200 rounded-lg hover:bg-orange-50 active:bg-orange-100 group touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {/* Cart Badge - Enhanced visibility */}
              {/* {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center animate-pulse shadow-lg font-bold min-w-[20px] sm:min-w-[24px] border-2 border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )} */}
            </Link>

            {/* Wishlist Icon - Enhanced mobile touch target */}
            <Link
              href="/wishlist"
              className="relative p-2 sm:p-2.5 md:p-3 text-gray-600 hover:text-red-500 active:text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50 active:bg-red-100 group touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {/* {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-lg font-bold min-w-[20px] sm:min-w-[24px] border-2 border-white">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )} */}
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-orange-50 transition-all duration-200 border border-transparent hover:border-orange-200 group"
                >
                  <div className="h-10 w-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || ''}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="block text-gray-700 font-semibold text-sm">
                      {user.name}
                    </span>
                    <span className="block text-orange-600 text-xs font-medium">
                      {user.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <svg
                    className="h-4 w-4 text-gray-500 group-hover:text-orange-600 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-orange-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 text-xs bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full font-medium shadow-sm">
                        {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        href={
                          user.role === 'admin'
                            ? '/admin/dashboard'
                            : '/customer/dashboard'
                        }
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-150"
                      >
                        <svg
                          className="h-4 w-4 mr-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        {user.role === 'admin'
                          ? 'Admin Dashboard'
                          : 'My Dashboard'}
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-150"
                      >
                        <svg
                          className="h-4 w-4 mr-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-150"
                      >
                        <svg
                          className="h-4 w-4 mr-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        Wishlist
                      </Link>
                      {user.role === 'admin' && (
                        <>
                          <div className="border-t border-orange-100 my-1"></div>
                          <Link
                            href="/admin/products"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-150"
                          >
                            <svg
                              className="h-4 w-4 mr-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            Manage Products
                          </Link>
                          <Link
                            href="/admin/orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-150"
                          >
                            <svg
                              className="h-4 w-4 mr-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            Manage Orders
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="border-t border-orange-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      >
                        <svg
                          className="h-4 w-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 font-medium"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Enhanced touch target with animation */}
            <button
              ref={menuButtonRef}
              onClick={toggleMenu}
              className="lg:hidden p-2.5 sm:p-3 text-gray-600 hover:text-orange-600 transition-all duration-300 rounded-lg hover:bg-orange-50 active:bg-orange-100 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center group"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div
                  className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`}
                >
                  <svg
                    className="h-6 w-6 group-hover:scale-110 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
                <div
                  className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}`}
                >
                  <svg
                    className="h-6 w-6 group-hover:scale-110 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced with better touch targets and animations */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="py-4 sm:py-5 border-t border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <nav className="flex flex-col space-y-1 sm:space-y-2 px-2 sm:px-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1 hover:shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3 text-lg">🏠</span>
                <span>Home</span>
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1 hover:shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3 text-lg">🛍️</span>
                <span>Products</span>
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1 hover:shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3 text-lg">📂</span>
                <span>Categories</span>
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1 hover:shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3 text-lg">ℹ️</span>
                <span>About</span>
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1 hover:shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3 text-lg">📞</span>
                <span>Contact</span>
              </Link>
              <div className="flex flex-col space-y-2 pt-3 sm:pt-4 border-t border-orange-200/60 mt-2">
                {user ? (
                  <>
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/70 rounded-lg mx-1 sm:mx-0 shadow-sm">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {user.email}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-1 text-xs bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full font-medium">
                        {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                      </span>
                    </div>
                    <Link
                      href={
                        user.role === 'admin'
                          ? '/admin/dashboard'
                          : '/customer/dashboard'
                      }
                      className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3 text-lg">
                        {user.role === 'admin' ? '⚡' : '📊'}
                      </span>
                      <span>
                        {user.role === 'admin'
                          ? 'Admin Dashboard'
                          : 'My Dashboard'}
                      </span>
                    </Link>
                    <Link
                      href="/orders"
                      className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3 text-lg">📦</span>
                      <span>My Orders</span>
                    </Link>
                    {user.role === 'admin' && (
                      <>
                        <div className="border-t border-orange-200/60 my-2 mx-2"></div>
                        <Link
                          href="/admin/products"
                          className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="mr-3 text-lg">🛠️</span>
                          <span>Manage Products</span>
                        </Link>
                        <Link
                          href="/admin/orders"
                          className="text-gray-700 hover:text-orange-600 active:text-orange-700 transition-all duration-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-white/60 active:bg-white/80 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="mr-3 text-lg">📋</span>
                          <span>Manage Orders</span>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="text-red-600 hover:text-red-700 active:text-red-800 transition-all duration-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-red-50 active:bg-red-100 font-medium text-base touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center transform hover:translate-x-1 text-left"
                    >
                      <span className="mr-3 text-lg">🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 px-1 sm:px-0">
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-12 text-base font-medium"
                        >
                          <span className="mr-2">🔑</span>
                          Login
                        </Button>
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button
                          size="sm"
                          className="w-full h-12 text-base font-medium"
                        >
                          <span className="mr-2">✨</span>
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
