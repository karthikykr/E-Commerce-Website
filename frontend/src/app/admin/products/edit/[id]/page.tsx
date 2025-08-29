'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  stockQuantity: number;
  weight: {
    value: number;
    unit: string;
  };
  images: Array<{
    url: string;
    alt: string;
  }>;
  specifications: Array<{
    key: string;
    value: string;
  }>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export default function EditProduct() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    category: '',
    stockQuantity: '',
    weight: { value: '', unit: 'g' },
    images: [{ url: '', alt: '' }],
    specifications: [{ key: '', value: '' }],
    tags: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    if (user && user.role === 'admin' && productId) {
      fetchCategories();
      fetchProduct();
    }
  }, [user, productId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories || data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        const productData = data.data;
        setProduct(productData);

        // Populate form with existing data
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          shortDescription: productData.shortDescription || '',
          price: productData.price?.toString() || '',
          category: productData.category?._id || '',
          stockQuantity: productData.stockQuantity?.toString() || '',
          weight: {
            value: productData.weight?.value?.toString() || '',
            unit: productData.weight?.unit || 'g',
          },
          images:
            productData.images?.length > 0
              ? productData.images
              : [{ url: '', alt: '' }],
          specifications:
            productData.specifications?.length > 0
              ? productData.specifications
              : [{ key: '', value: '' }],
          tags: productData.tags?.join(', ') || '',
          isActive:
            productData.isActive !== undefined ? productData.isActive : true,
          isFeatured:
            productData.isFeatured !== undefined
              ? productData.isFeatured
              : false,
        });
      } else {
        setError('Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Network error while fetching product');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith('weight.')) {
      const weightField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        weight: {
          ...prev.weight,
          [weightField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleImageChange = (
    index: number,
    field: 'url' | 'alt',
    value: string
  ) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '' }],
    }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleSpecificationChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecificationField = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const removeSpecificationField = (index: number) => {
    if (formData.specifications.length > 1) {
      const newSpecs = formData.specifications.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, specifications: newSpecs }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      // Filter out empty images and specifications
      const filteredImages = formData.images.filter(
        (img) => img.url.trim() !== ''
      );
      const filteredSpecs = formData.specifications.filter(
        (spec) => spec.key.trim() !== '' && spec.value.trim() !== ''
      );

      const productData = {
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        shortDescription:
          formData.shortDescription || formData.description.substring(0, 100),
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity),
        weight: {
          value: parseFloat(formData.weight.value) || 100,
          unit: formData.weight.unit || 'g',
        },
        images:
          filteredImages.length > 0
            ? filteredImages
            : [{ url: 'https://via.placeholder.com/500', alt: formData.name }],
        specifications: filteredSpecs,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag !== '')
          : [],
        isActive: formData.isActive,
        isFeatured: formData.isFeatured || false,
      };

      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          router.push('/admin/products');
        }, 2000);
      } else {
        setError(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Network error while updating product');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8">
            You need admin privileges to access this page.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <button className="text-orange-600 hover:text-orange-700">
                ← Back to Products
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-2">Update product information</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label
                htmlFor="shortDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Short Description
              </label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                rows={2}
                value={formData.shortDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter short description (optional)"
              />
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter tags separated by commas (e.g., organic, spice, premium)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label
                  htmlFor="stockQuantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Weight Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="weight.value"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Weight Value
                </label>
                <input
                  type="number"
                  id="weight.value"
                  name="weight.value"
                  min="0"
                  step="0.1"
                  value={formData.weight.value}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label
                  htmlFor="weight.unit"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Weight Unit
                </label>
                <select
                  id="weight.unit"
                  name="weight.unit"
                  value={formData.weight.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="l">Liters (l)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Product is Active
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Featured Product
                </label>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="flex gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={image.url}
                      onChange={(e) =>
                        handleImageChange(index, 'url', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={image.alt}
                      onChange={(e) =>
                        handleImageChange(index, 'alt', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="text-orange-600 hover:text-orange-700 text-sm"
              >
                + Add Another Image
              </button>
            </div>

            {/* Specifications Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Specifications
              </label>
              {formData.specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Specification name"
                      value={spec.key}
                      onChange={(e) =>
                        handleSpecificationChange(index, 'key', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Specification value"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecificationChange(
                          index,
                          'value',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecificationField(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecificationField}
                className="text-orange-600 hover:text-orange-700 text-sm"
              >
                + Add Another Specification
              </button>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/admin/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
