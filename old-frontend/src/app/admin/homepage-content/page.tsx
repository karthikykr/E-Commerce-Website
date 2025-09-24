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

interface Section {
  _id: string;
  type: string;
  title: string;
  subtitle?: string;
  content: any;
  isActive: boolean;
  displayOrder: number;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    padding?: any;
    margin?: any;
    customCSS?: string;
  };
}

interface HomePageContent {
  _id: string;
  name: string;
  isActive: boolean;
  sections: Section[];
  globalSettings: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCSS?: string;
  };
  seoSettings: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  lastModified: string;
  modifiedBy?: {
    name: string;
    email: string;
  };
}

const sectionTypeLabels: Record<string, string> = {
  hero_banner: '🎯 Hero Banner',
  featured_products: '⭐ Featured Products',
  special_offers: '🔥 Special Offers',
  categories: '📂 Categories',
  about_us: '👥 About Us',
  why_choose_us: '✨ Why Choose Us',
  newsletter: '📧 Newsletter',
  testimonials: '💬 Testimonials',
  custom_html: '🔧 Custom HTML',
};

export default function HomePageContentAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'settings' | 'seo'>(
    'sections'
  );

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchContent();
      }
    }
  }, [user, router, isLoading]);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/admin/homepage-content',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setContent(data.data.content);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load homepage content',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (updateData: Partial<HomePageContent>) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/admin/homepage-content',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setContent(data.data.content);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Homepage content updated successfully',
          duration: 3000,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating content:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update homepage content',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = async (sectionId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/admin/homepage-content/sections/${sectionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setContent(data.data.content);
        addToast({
          type: 'success',
          title: 'Success',
          message: `Section ${isActive ? 'enabled' : 'disabled'} successfully`,
          duration: 3000,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error toggling section:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update section',
        duration: 5000,
      });
    }
  };

  const reorderSections = async (
    sectionOrders: Array<{ sectionId: string; displayOrder: number }>
  ) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/admin/homepage-content/sections/reorder',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sectionOrders }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setContent(data.data.content);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Sections reordered successfully',
          duration: 3000,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error reordering sections:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to reorder sections',
        duration: 5000,
      });
    }
  };

  const moveSectionUp = (index: number) => {
    if (index === 0 || !content) return;

    const sections = [...content.sections].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    const sectionOrders = sections.map((section, i) => {
      if (i === index) {
        return {
          sectionId: section._id,
          displayOrder: sections[index - 1].displayOrder,
        };
      } else if (i === index - 1) {
        return {
          sectionId: section._id,
          displayOrder: sections[index].displayOrder,
        };
      } else {
        return { sectionId: section._id, displayOrder: section.displayOrder };
      }
    });

    reorderSections(sectionOrders);
  };

  const moveSectionDown = (index: number) => {
    if (!content || index === content.sections.length - 1) return;

    const sections = [...content.sections].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    const sectionOrders = sections.map((section, i) => {
      if (i === index) {
        return {
          sectionId: section._id,
          displayOrder: sections[index + 1].displayOrder,
        };
      } else if (i === index + 1) {
        return {
          sectionId: section._id,
          displayOrder: sections[index].displayOrder,
        };
      } else {
        return { sectionId: section._id, displayOrder: section.displayOrder };
      }
    });

    reorderSections(sectionOrders);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading homepage content...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Content Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Homepage content could not be loaded.
                </p>
                <Button onClick={fetchContent}>Try Again</Button>
              </div>
            </CardBody>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const sortedSections = [...content.sections].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Homepage Content Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your website's homepage content and layout
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin/homepage-content/preview" target="_blank">
                <Button variant="outline">👁️ Preview</Button>
              </Link>
              <Button
                onClick={() => window.open('/', '_blank')}
                variant="outline"
              >
                🌐 View Live
              </Button>
            </div>
          </div>

          {content.modifiedBy && (
            <div className="mt-4 text-sm text-gray-500">
              Last modified by {content.modifiedBy.name} on{' '}
              {new Date(content.lastModified).toLocaleString()}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                {
                  id: 'sections',
                  label: '📄 Sections',
                  count: content.sections.length,
                },
                { id: 'settings', label: '⚙️ Global Settings' },
                { id: 'seo', label: '🔍 SEO Settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {/* Add Section Button */}
            <Card>
              <CardBody>
                <div className="text-center py-6">
                  <Link href="/admin/homepage-content/sections/add">
                    <Button>➕ Add New Section</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>

            {/* Sections List */}
            {sortedSections.map((section, index) => (
              <Card key={section._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {sectionTypeLabels[section.type]?.split(' ')[0] || '📄'}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {sectionTypeLabels[section.type] || section.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          section.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {section.subtitle && (
                        <p className="text-gray-600 mb-2">{section.subtitle}</p>
                      )}
                      <div className="text-sm text-gray-500">
                        Display Order: {section.displayOrder}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Move Up/Down */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSectionDown(index)}
                        disabled={index === sortedSections.length - 1}
                      >
                        ↓
                      </Button>

                      {/* Toggle Active */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleSection(section._id, !section.isActive)
                        }
                      >
                        {section.isActive ? 'Disable' : 'Enable'}
                      </Button>

                      {/* Edit */}
                      <Link
                        href={`/admin/homepage-content/sections/${section._id}/edit`}
                      >
                        <Button variant="outline" size="sm">
                          ✏️ Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Global Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Global Settings</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={content.globalSettings.theme}
                    onChange={(e) =>
                      updateContent({
                        globalSettings: {
                          ...content.globalSettings,
                          theme: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="default">Default</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={content.globalSettings.primaryColor}
                    onChange={(e) =>
                      updateContent({
                        globalSettings: {
                          ...content.globalSettings,
                          primaryColor: e.target.value,
                        },
                      })
                    }
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={content.globalSettings.secondaryColor}
                    onChange={(e) =>
                      updateContent({
                        globalSettings: {
                          ...content.globalSettings,
                          secondaryColor: e.target.value,
                        },
                      })
                    }
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <input
                    type="text"
                    value={content.globalSettings.fontFamily}
                    onChange={(e) =>
                      updateContent({
                        globalSettings: {
                          ...content.globalSettings,
                          fontFamily: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Inter, sans-serif"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={content.globalSettings.customCSS || ''}
                  onChange={(e) =>
                    updateContent({
                      globalSettings: {
                        ...content.globalSettings,
                        customCSS: e.target.value,
                      },
                    })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="/* Add custom CSS here */"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* SEO Settings Tab */}
        {activeTab === 'seo' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">SEO Settings</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={content.seoSettings.title || ''}
                    onChange={(e) =>
                      updateContent({
                        seoSettings: {
                          ...content.seoSettings,
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Gruhapaaka - Authentic Homemade Food Products"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(content.seoSettings.title || '').length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={content.seoSettings.description || ''}
                    onChange={(e) =>
                      updateContent({
                        seoSettings: {
                          ...content.seoSettings,
                          description: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Indulge in elegant homemade food products, made with the finest ingredients and traditional recipes."
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(content.seoSettings.description || '').length}/160
                    characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={content.seoSettings.keywords?.join(', ') || ''}
                    onChange={(e) =>
                      updateContent({
                        seoSettings: {
                          ...content.seoSettings,
                          keywords: e.target.value
                            .split(',')
                            .map((k) => k.trim())
                            .filter((k) => k),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="homemade food, spices, traditional recipes, authentic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Image URL
                  </label>
                  <input
                    type="url"
                    value={content.seoSettings.ogImage || ''}
                    onChange={(e) =>
                      updateContent({
                        seoSettings: {
                          ...content.seoSettings,
                          ogImage: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
