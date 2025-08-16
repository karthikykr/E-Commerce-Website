'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: {
    url: string;
    alt?: string;
    thumbnail?: {
      url: string;
    };
  };
  link: {
    url?: string;
    text?: string;
    openInNewTab: boolean;
  };
  position: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  analytics: {
    views: number;
    clicks: number;
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const positionLabels: Record<string, string> = {
  hero: '🎯 Hero Section',
  top: '⬆️ Top Banner',
  middle: '➡️ Middle Section',
  bottom: '⬇️ Bottom Banner',
  sidebar: '📌 Sidebar'
};

export default function BannersAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchBanners();
      }
    }
  }, [user, router, isLoading]);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/admin/banners?limit=50';
      
      if (selectedPosition !== 'all') {
        url += `&position=${selectedPosition}`;
      }
      if (selectedStatus !== 'all') {
        url += `&isActive=${selectedStatus === 'active'}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBanners(data.data.banners);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load banners',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBanners();
    }
  }, [selectedPosition, selectedStatus]);

  const toggleBanner = async (bannerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/banners/${bannerId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBanners(banners.map(banner => 
          banner._id === bannerId 
            ? { ...banner, isActive: !banner.isActive }
            : banner
        ));
        addToast({
          type: 'success',
          title: 'Success',
          message: data.message,
          duration: 3000
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error toggling banner:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to toggle banner status',
        duration: 5000
      });
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setBanners(banners.filter(banner => banner._id !== bannerId));
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Banner deleted successfully',
          duration: 3000
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete banner',
        duration: 5000
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading banners...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
              <p className="text-gray-600 mt-2">Manage promotional banners and hero sections</p>
            </div>
            <Link href="/admin/banners/add">
              <Button>
                ➕ Add New Banner
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Positions</option>
                  <option value="hero">Hero Section</option>
                  <option value="top">Top Banner</option>
                  <option value="middle">Middle Section</option>
                  <option value="bottom">Bottom Banner</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Banners List */}
        {banners.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Banners Found</h3>
                <p className="text-gray-600 mb-6">Create your first banner to get started.</p>
                <Link href="/admin/banners/add">
                  <Button>
                    Create Banner
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {banners.map((banner) => (
              <Card key={banner._id}>
                <CardBody>
                  <div className="flex items-start space-x-4">
                    {/* Banner Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={banner.image.thumbnail?.url || banner.image.url}
                        alt={banner.image.alt || banner.title}
                        className="w-24 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    
                    {/* Banner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {banner.title}
                          </h3>
                          {banner.subtitle && (
                            <p className="text-gray-600 mb-2">{banner.subtitle}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              {positionLabels[banner.position] || banner.position}
                            </span>
                            <span>Order: {banner.displayOrder}</span>
                            <span>👁️ {banner.analytics.views} views</span>
                            <span>🖱️ {banner.analytics.clicks} clicks</span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            banner.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Banner Link */}
                      {banner.link.url && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Links to: </span>
                          <a 
                            href={banner.link.url} 
                            target={banner.link.openInNewTab ? '_blank' : '_self'}
                            rel={banner.link.openInNewTab ? 'noopener noreferrer' : undefined}
                            className="text-sm text-orange-600 hover:text-orange-700"
                          >
                            {banner.link.text || banner.link.url}
                          </a>
                        </div>
                      )}
                      
                      {/* Date Range */}
                      {(banner.startDate || banner.endDate) && (
                        <div className="mt-2 text-sm text-gray-500">
                          {banner.startDate && (
                            <span>From: {new Date(banner.startDate).toLocaleDateString()}</span>
                          )}
                          {banner.startDate && banner.endDate && <span> • </span>}
                          {banner.endDate && (
                            <span>To: {new Date(banner.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBanner(banner._id)}
                      >
                        {banner.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      
                      <Link href={`/admin/banners/${banner._id}/edit`}>
                        <Button variant="outline" size="sm">
                          ✏️ Edit
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBanner(banner._id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
