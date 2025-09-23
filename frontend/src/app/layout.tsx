import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
// import { CartProvider } from '@/contexts/CartContext';
// import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gruhapaaka - Authentic Homemade Food Products',
  description:
    'Indulge in elegant homemade food products, made with the finest ingredients and traditional recipes. Authentic, Pure, Homemade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            {/* <CartProvider> */}
              {/* <WishlistProvider>{children}</WishlistProvider> */}
              {children}
            {/* </CartProvider> */}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
