'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, StatsCard } from '@/components/ui/Card';
import { ProfileSkeleton, OrderHistorySkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/components/ui/Toast';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: {
      name: string;
      price: number;
      images?: Array<{ url: string; alt: string }>;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { addToast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Initialize profile data
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
    });

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load order history.',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (data.success) {
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
          duration: 3000,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been logged out successfully.',
      duration: 3000,
    });
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'orders', name: 'Orders', icon: '📦' },
    { id: 'wishlist', name: 'Wishlist', icon: '❤️' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and view your order history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Cart Items"
            value={cartCount}
            icon="🛒"
            change={{ value: 12, type: 'increase' }}
          />
          <StatsCard
            title="Wishlist Items"
            value={wishlistCount}
            icon="❤️"
          />
          <StatsCard
            title="Total Orders"
            value={orders.length}
            icon="📦"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === tab.id
                        ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="mr-3 text-lg">🚪</span>
                  Logout
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card padding="lg">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-gray-600 mt-1">Update your personal information</p>
                </CardHeader>
                
                <CardBody>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        required
                      />
                      <Input
                        label="Last Name"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    
                    <Input
                      label="Address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="City"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      />
                      <Input
                        label="State"
                        value={profileData.state}
                        onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                      />
                      <Input
                        label="ZIP Code"
                        value={profileData.zipCode}
                        onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        loading={isUpdating}
                        variant="gradient"
                        size="lg"
                      >
                        Update Profile
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <Card padding="lg">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                  <p className="text-gray-600 mt-1">View and track your orders</p>
                </CardHeader>
                
                <CardBody>
                  {isLoading ? (
                    <OrderHistorySkeleton count={3} />
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
                      <Link href="/products">
                        <Button variant="gradient" size="lg">
                          Start Shopping
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm">🌶️</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-500 ml-13">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <p className="font-semibold text-gray-900">
                              Total: ${order.total.toFixed(2)}
                            </p>
                            <Link href={`/orders/${order._id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <Card padding="lg">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">My Wishlist</h2>
                  <p className="text-gray-600 mt-1">Items you've saved for later</p>
                </CardHeader>
                
                <CardBody>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-8">Save items you love to your wishlist</p>
                    <Link href="/products">
                      <Button variant="gradient" size="lg">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card padding="lg">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                  <p className="text-gray-600 mt-1">Manage your account preferences</p>
                </CardHeader>
                
                <CardBody>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                      <p className="text-sm text-gray-600 mb-4">Update your password to keep your account secure</p>
                      <Button variant="outline">
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Email Notifications</h4>
                      <p className="text-sm text-gray-600 mb-4">Manage your email preferences</p>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Order updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Promotional emails</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-700 mb-4">Permanently delete your account and all data</p>
                      <Button variant="danger" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
