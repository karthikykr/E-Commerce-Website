'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/adminLayout';
import { useToast } from '@/contexts/ToastContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import api from '@/lib/axios';

interface CategoryImage {
  name: string;
  url: string;
  publicId: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: CategoryImage;
  productCount?: number;
  sortOrder: number;
}

export default function AdminCategories() {
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrderState, setSortOrderState] = useState("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [errorState, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/category", {
        params: {
          search: searchTerm,
          sortBy: sortBy,
          sortOrder: sortOrderState,
          limit: limit,
          page: page,
        },
      });

      console.log('success');
      console.log(response);
      setCategories(response.data.categories || []);

    } catch (err: any) {
      console.log('fail');
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to fetch categories");
      showToast(err.response?.data?.message || "Failed to fetch categories", 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortOrderState, page, limit]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounce search term changes to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
      fetchCategories();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch on sort changes
  useEffect(() => {
    setPage(1); // Reset to first page on sort
    fetchCategories();
  }, [sortBy, sortOrderState]);

  const handleCreateCategory = async (categoryData: any) => {
    try {
      const response = await api.post("/category", categoryData);
      if (response.data) {
        showToast('Category created successfully', 'success');
        setShowCreateModal(false);
        fetchCategories();
      }
    } catch (err: any) {
      console.error('Error creating category:', err);
      showToast(err.response?.data?.message || 'Error creating category', 'error');
    }
  };

  const handleUpdateCategory = async (
    categoryId: string,
    categoryData: any
  ) => {
    try {
      const response = await api.put(`/category/${categoryId}`, categoryData);
      if (response.data) {
        showToast('Category updated successfully', 'success');
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (err: any) {
      console.error('Error updating category:', err);
      showToast(err.response?.data?.message || 'Error updating category', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await api.delete(`/category/${categoryId}`);
      if (response.data) {
        showToast('Category deleted successfully', 'success');
        fetchCategories();
      }
    } catch (err: any) {
      console.error('Error deleting category:', err);
      showToast(err.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>, categoryId: string) => {
    const target = e.currentTarget;
    const currentSrc = target.src;

    if (imageErrors.has(categoryId)) {
      // Already errored, hide the image completely
      target.style.display = 'none';
      return;
    }

    if (currentSrc.includes('placeholder-category.jpg')) {
      // Placeholder failed, mark as errored and hide
      setImageErrors(prev => new Set([...prev, categoryId]));
      target.style.display = 'none';
    } else {
      // First error, try placeholder
      target.src = '/images/placeholder-category.jpg';
    }
  }, [imageErrors]);

  if (loading && categories.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Category
          </button>
        </div>

        {errorState && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorState}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="sortOrder">Sort Order</option>
                <option value="name">Name</option>
                <option value="createdAt">Created Date</option>
                <option value="productCount">Product Count</option>
              </select>
              <select
                value={sortOrderState}
                onChange={(e) => setSortOrderState(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                <img
                  src={category.image?.url || '/images/placeholder-category.jpg'}
                  alt={category.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => handleImageError(e, category._id)}
                />
                {imageErrors.has(category._id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{category.productCount || 0} products</span>
                  <span>Order: {category.sortOrder}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    disabled={(category.productCount || 0) > 0}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      (category.productCount || 0) > 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                    title={
                      (category.productCount || 0) > 0
                        ? 'Cannot delete category with products'
                        : 'Delete category'
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              No categories found
            </div>
            <p className="text-gray-500">
              Create your first category to get started
            </p>
          </div>
        )}
      </div>

      {(showCreateModal || editingCategory) && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCategory(null);
          }}
          onSave={
            editingCategory
              ? (data) => handleUpdateCategory(editingCategory._id, data)
              : handleCreateCategory
          }
        />
      )}
    </AdminLayout>
  );
}

function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    imageUrl: category?.image?.url || '',
    imageName: category?.image?.name || '',
    sortOrder: category?.sortOrder || 0,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        imageUrl: category.image?.url || '',
        imageName: category.image?.name || '',
        sortOrder: category.sortOrder || 0,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        imageName: '',
        sortOrder: 0,
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      name: formData.name,
      description: formData.description,
      image: {
        name: formData.imageName,
        url: formData.imageUrl,
        publicId: category?.image?.publicId || '',
      },
      sortOrder: formData.sortOrder,
    };
    
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {category ? 'Edit Category' : 'Create Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Name
            </label>
            <input
              type="text"
              value={formData.imageName}
              onChange={(e) =>
                setFormData({ ...formData, imageName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="category-image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="/images/categories/category-name.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.description}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
