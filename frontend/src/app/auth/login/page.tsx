'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (role: 'user' | 'admin') => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password, formData.role);

      if (success) {
        // Redirect based on role
        if (formData.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError('Invalid credentials. Please check your email, password, and role.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-orange-600">🌶️ SpiceHub</h1>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/register" className="font-medium text-orange-600 hover:text-orange-500">
              create a new account
            </Link>
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Account Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRoleChange('user')}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                formData.role === 'user'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">Customer</div>
              <div className="text-sm text-gray-500">Shop for spices</div>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                formData.role === 'admin'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">👨‍💼</div>
              <div className="font-medium">Admin</div>
              <div className="text-sm text-gray-500">Manage store</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : `Sign in as ${formData.role === 'admin' ? 'Admin' : 'Customer'}`}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Admin:</strong> admin@spicehub.com / admin123</div>
            <div><strong>Customer:</strong> user@spicehub.com / user123</div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
