'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import DynamicSection from './DynamicSection';

interface SectionData {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content: any;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    padding?: any;
    margin?: any;
    customCSS?: string;
  };
  products?: any[];
  categories?: any[];
}

interface HomePageData {
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
  sections: SectionData[];
}

export default function DynamicHomePage() {
  const [homePageData, setHomePageData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHomePageContent();
  }, []);

  const fetchHomePageContent = async () => {
    try {
      // Fetch homepage content
      const contentResponse = await fetch('http://localhost:5000/api/homepage-content');
      const contentData = await contentResponse.json();

      if (!contentData.success) {
        throw new Error(contentData.message || 'Failed to fetch homepage content');
      }

      // Fetch banners
      const bannersResponse = await fetch('http://localhost:5000/api/banners');
      const bannersData = await bannersResponse.json();

      const banners = bannersData.success ? bannersData.data.banners : [];

      // Group banners by position
      const bannersByPosition = banners.reduce((acc: any, banner: any) => {
        if (!acc[banner.position]) {
          acc[banner.position] = [];
        }
        acc[banner.position].push(banner);
        return acc;
      }, {});

      // Add banners to sections
      const sectionsWithBanners = contentData.data.sections.map((section: any) => {
        if (section.type === 'hero_banner' && bannersByPosition.hero) {
          return { ...section, banners: bannersByPosition.hero };
        }
        return section;
      });

      setHomePageData({
        ...contentData.data,
        sections: sectionsWithBanners
      });
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      setError('Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  // Apply global styles
  useEffect(() => {
    if (homePageData?.globalSettings) {
      const { primaryColor, secondaryColor, fontFamily, customCSS } = homePageData.globalSettings;
      
      // Apply CSS custom properties
      const root = document.documentElement;
      if (primaryColor) {
        root.style.setProperty('--primary-color', primaryColor);
      }
      if (secondaryColor) {
        root.style.setProperty('--secondary-color', secondaryColor);
      }
      if (fontFamily) {
        root.style.setProperty('--font-family', fontFamily);
      }
      
      // Apply custom CSS
      if (customCSS) {
        const styleElement = document.createElement('style');
        styleElement.textContent = customCSS;
        styleElement.id = 'homepage-custom-css';
        
        // Remove existing custom CSS
        const existingStyle = document.getElementById('homepage-custom-css');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        document.head.appendChild(styleElement);
      }
    }
    
    // Cleanup function
    return () => {
      const customStyle = document.getElementById('homepage-custom-css');
      if (customStyle) {
        customStyle.remove();
      }
    };
  }, [homePageData]);

  // Update document head with SEO settings
  useEffect(() => {
    if (homePageData?.seoSettings) {
      const { title, description, keywords, ogImage } = homePageData.seoSettings;
      
      if (title) {
        document.title = title;
      }
      
      // Update meta description
      if (description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);
      }
      
      // Update meta keywords
      if (keywords && keywords.length > 0) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywords.join(', '));
      }
      
      // Update Open Graph image
      if (ogImage) {
        let ogImageMeta = document.querySelector('meta[property="og:image"]');
        if (!ogImageMeta) {
          ogImageMeta = document.createElement('meta');
          ogImageMeta.setAttribute('property', 'og:image');
          document.head.appendChild(ogImageMeta);
        }
        ogImageMeta.setAttribute('content', ogImage);
      }
    }
  }, [homePageData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing content...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !homePageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error || 'Failed to load homepage content'}</p>
            <button
              onClick={fetchHomePageContent}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white"
      style={{ 
        fontFamily: homePageData.globalSettings.fontFamily || 'Inter, sans-serif',
        '--primary-color': homePageData.globalSettings.primaryColor || '#ea580c',
        '--secondary-color': homePageData.globalSettings.secondaryColor || '#f97316'
      } as React.CSSProperties}
    >
      <Header />
      
      <main className="relative">
        {homePageData.sections.map((section, index) => (
          <DynamicSection
            key={section.id}
            section={section}
            className={index === 0 ? '' : 'relative'}
          />
        ))}
      </main>
      
      <Footer />
    </div>
  );
}
