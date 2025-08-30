'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill all fields');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      // If register succeeds (no throw), you can redirect or handle success here
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-orange-600">
                🌶️ SpiceHub
              </h1>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <form
            className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-md"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <Input
                id="name"
                name="name"
                type="text"
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
