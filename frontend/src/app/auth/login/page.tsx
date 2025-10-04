'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/redux/slices/authSlice';
import { AppDispatch, RootState } from '@/redux/store';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error, isInitialized } = useSelector((state: RootState) => state.auth); // NEW: Add isInitialized
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoading && user) {
      console.log('User already logged in', user);
      if (user.role === 'admin') {
        console.log('Redirecting logged-in user to dashboard');
        router.push('/admin/dashboard');
      } else {
        console.log('Redirecting logged-in customer to home');
        router.push('/');
      }
    }
    return () => {
      dispatch(clearError());
    };
  }, [user, isLoading, isInitialized, router, dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  // NEW: Show loading until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Header />
      <div className="flex items-center justify-center py-6 sm:py-8 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-md w-full space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-5">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-md">
                  JUST
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                  Gruhapaaka
                </h1>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base leading-relaxed">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  📧 Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-base touch-manipulation min-h-[52px] sm:min-h-[48px]"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  🔒 Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-base touch-manipulation min-h-[52px] sm:min-h-[48px]"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
