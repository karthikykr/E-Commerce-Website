'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ImageUpload from '@/components/ui/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios'; // For API calls

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    weight: { value: '', unit: '' },
    numberOfUnits: '',
    category: '',
    stock: '',
    status: 'active',
    productInfo: {
      weight: '',
      size: '',
      shelfLife: '',
      ingredients: '',
      nutritionalInfo: {
        calories: '',
        protein: '',
        fat: '',
        carbohydrates: '',
        fiber: '',
        sugar: '',
        sodium: '',
      },
      storageInstructions: '',
      usageInstructions: '',
      certifications: '',
      countryOfOrigin: '',
    },
  });

  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (user?.token) {
          const response = await axios.get('http://localhost:5000/api/category', {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          setCategories(response.data.categories || []);
          setError('');
        }
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        setCategories([]);
        setError(err.response?.data?.message || "Failed to load categories");
      }
    };

    fetchCategories();
  }, [user]); // run only once on mount if user doesn't change, but re-runs if user updates

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('productInfo.nutritionalInfo.')) {
      const field = name.split('.')[2]; // e.g., 'calories'
      setFormData((prev) => ({
        ...prev,
        productInfo: {
          ...prev.productInfo,
          nutritionalInfo: { ...prev.productInfo.nutritionalInfo, [field]: value },
        },
      }));
    } else if (name.startsWith('productInfo.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        productInfo: { ...prev.productInfo, [field]: value },
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Process ingredients and certifications: split comma-separated strings into arrays and trim whitespace
    const processedFormData = {
      ...formData,
      productInfo: {
        ...formData.productInfo,
        ingredients: formData.productInfo.ingredients
          ? formData.productInfo.ingredients.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        certifications: formData.productInfo.certifications
          ? formData.productInfo.certifications.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        nutritionalInfo: {
          calories: formData.productInfo.nutritionalInfo.calories ? parseFloat(formData.productInfo.nutritionalInfo.calories) : null,
          protein: formData.productInfo.nutritionalInfo.protein ? parseFloat(formData.productInfo.nutritionalInfo.protein) : null,
          fat: formData.productInfo.nutritionalInfo.fat ? parseFloat(formData.productInfo.nutritionalInfo.fat) : null,
          carbohydrates: formData.productInfo.nutritionalInfo.carbohydrates ? parseFloat(formData.productInfo.nutritionalInfo.carbohydrates) : null,
          fiber: formData.productInfo.nutritionalInfo.fiber ? parseFloat(formData.productInfo.nutritionalInfo.fiber) : null,
          sugar: formData.productInfo.nutritionalInfo.sugar ? parseFloat(formData.productInfo.nutritionalInfo.sugar) : null,
          sodium: formData.productInfo.nutritionalInfo.sodium ? parseFloat(formData.productInfo.nutritionalInfo.sodium) : null,
        },
      },
    };

    // Prepare form data for submission
    const submissionData = new FormData();

    // Send all form data as a single JSON string to preserve nested structures
    submissionData.append('data', JSON.stringify(processedFormData));

    // Handle file uploads
    imageFiles.forEach((file) => {
      submissionData.append('productImage', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/product', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`, // Added for consistency with GET request
        },
      });
      setSuccess(response.data.message || 'Product added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-600 mt-2">
                Create a new product for your store
              </p>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
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
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
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
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  min="0"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weight.value" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="weight.unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight Unit
                </label>
                <select
                  id="weight.unit"
                  name="weight.unit"
                  value={formData.weight.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select unit</option>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="l">Liters (l)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="numberOfUnits" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Units
                </label>
                <input
                  type="number"
                  id="numberOfUnits"
                  name="numberOfUnits"
                  min="0"
                  value={formData.numberOfUnits}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Product Info Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Product Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="productInfo.weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Info Weight
                  </label>
                  <input
                    type="text"
                    id="productInfo.weight"
                    name="productInfo.weight"
                    value={formData.productInfo.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., 500g"
                  />
                </div>

                <div>
                  <label htmlFor="productInfo.size" className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    id="productInfo.size"
                    name="productInfo.size"
                    value={formData.productInfo.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="productInfo.shelfLife" className="block text-sm font-medium text-gray-700 mb-2">
                  Shelf Life
                </label>
                <input
                  type="text"
                  id="productInfo.shelfLife"
                  name="productInfo.shelfLife"
                  value={formData.productInfo.shelfLife}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., 12 months"
                />
              </div>

              <div>
                <label htmlFor="productInfo.ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients
                </label>
                <textarea
                  id="productInfo.ingredients"
                  name="productInfo.ingredients"
                  rows={3}
                  value={formData.productInfo.ingredients}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="List ingredients separated by commas, e.g., Flour, Sugar, Eggs"
                />
              </div>

              {/* Structured Nutritional Info Inputs */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-800">Nutritional Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="productInfo.nutritionalInfo.calories" className="block text-sm font-medium text-gray-700 mb-2">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      id="productInfo.nutritionalInfo.calories"
                      name="productInfo.nutritionalInfo.calories"
                      min="0"
                      step="0.1"
                      value={formData.productInfo.nutritionalInfo.calories}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 200"
                    />
                  </div>

                  <div>
                    <label htmlFor="productInfo.nutritionalInfo.protein" className="block text-sm font-medium text-gray-700 mb-2">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      id="productInfo.nutritionalInfo.protein"
                      name="productInfo.nutritionalInfo.protein"
                      min="0"
                      step="0.1"
                      value={formData.productInfo.nutritionalInfo.protein}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div>
                    <label htmlFor="productInfo.nutritionalInfo.fat" className="block text-sm font-medium text-gray-700 mb-2">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      id="productInfo.nutritionalInfo.fat"
                      name="productInfo.nutritionalInfo.fat"
                      min="0"
                      step="0.1"
                      value={formData.productInfo.nutritionalInfo.fat}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div>
                    <label htmlFor="productInfo.nutritionalInfo.carbohydrates" className="block text-sm font-medium text-gray-700 mb-2">
                      Carbohydrates (g)
                    </label>
                    <input
                      type="number"
                      id="productInfo.nutritionalInfo.carbohydrates"
                      name="productInfo.nutritionalInfo.carbohydrates"
                      min="0"
                      step="0.1"
                      value={formData.productInfo.nutritionalInfo.carbohydrates}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div>
                    <label htmlFor="productInfo.nutritionalInfo.fiber" className="block text-sm font-medium text-gray-700 mb-2">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      id="productInfo.nutritionalInfo.fiber"
                      name="productInfo.nutritionalInfo.fiber"
                      min="0"
                      step="0.1"
                      value={formData.productInfo.nutritionalInfo.fiber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 2"
                    />
                  </div>

                  <div>
                    <label htmlFor="productInfo.nutritionalInfo.sugar" className="block text-sm font-medium text-gray-700 mb-2">
                      Sugar (g)
                    </label>
                    <input
                      type="number"
                      id="productInfo.nutritionalInfo.sugar"
                      name="productInfo.nutritionalInfo.sugar"
                      min="0"
                      step="0.1"
                      value={formData.productInfo.nutritionalInfo.sugar}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div>
                    <label htmlFor="productInfo.nutritionalInfo.sodium" className="block text-sm font-medium text-gray-700 mb-2">
                      Sodium (mg)
                    </label>
                    <input
                      type="number"
                      id="productInfo.nutritionalInfo.sodium"
                      name="productInfo.nutritionalInfo.sodium"
                      min="0"
                      step="0.1"
                      value={formData.productInfo.nutritionalInfo.sodium}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 150"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="productInfo.storageInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Instructions
                </label>
                <textarea
                  id="productInfo.storageInstructions"
                  name="productInfo.storageInstructions"
                  rows={3}
                  value={formData.productInfo.storageInstructions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter storage instructions"
                />
              </div>

              <div>
                <label htmlFor="productInfo.usageInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Instructions
                </label>
                <textarea
                  id="productInfo.usageInstructions"
                  name="productInfo.usageInstructions"
                  rows={3}
                  value={formData.productInfo.usageInstructions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter usage instructions"
                />
              </div>

              <div>
                <label htmlFor="productInfo.certifications" className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <input
                  type="text"
                  id="productInfo.certifications"
                  name="productInfo.certifications"
                  value={formData.productInfo.certifications}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="List certifications separated by commas, e.g., Organic, Vegan"
                />
              </div>

              <div>
                <label htmlFor="productInfo.countryOfOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Origin
                </label>
                <input
                  type="text"
                  id="productInfo.countryOfOrigin"
                  name="productInfo.countryOfOrigin"
                  value={formData.productInfo.countryOfOrigin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., India"
                />
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Images
              </label>
              <ImageUpload
                onImagesChange={setImageFiles}
                maxFiles={10}
                maxSizeInMB={5}
                showPreview={true}
                allowReorder={true}
                allowSetPrimary={true}
                className="mb-4"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/admin/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddProductForm;
