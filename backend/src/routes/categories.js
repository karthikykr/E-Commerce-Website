const express = require('express');
const { body, validationResult } = require('express-validator');
const { Category, Product } = require('../models');
const { adminAuth } = require('../middleware/adminAuth');
const mongoose = require('mongoose');

const router = express.Router();

// Sample categories for when MongoDB is not connected
const sampleCategories = [
  {
    _id: '1',
    name: 'Spices & Seasonings',
    slug: 'spices-seasonings',
    description: 'Premium quality spices and seasonings',
    isActive: true,
    featured: true,
    productsCount: 3,
  },
  {
    _id: '2',
    name: 'Herbs & Aromatics',
    slug: 'herbs-aromatics',
    description: 'Fresh and dried herbs for cooking',
    isActive: true,
    featured: true,
    productsCount: 1,
  },
  {
    _id: '3',
    name: 'Masala Blends',
    slug: 'masala-blends',
    description: 'Traditional and modern spice blends',
    isActive: true,
    featured: true,
    productsCount: 1,
  },
  {
    _id: '4',
    name: 'Organic Collection',
    slug: 'organic-collection',
    description: 'Certified organic spices and herbs',
    isActive: true,
    featured: false,
    productsCount: 1,
  },
];

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, using sample categories');
      return res.json({
        success: true,
        message: 'Categories retrieved successfully (sample data)',
        data: {
          categories: sampleCategories,
        },
      });
    }

    const categories = await Category.find({ isActive: true })
      .populate('productsCount')
      .sort('sortOrder name');

    res.json({
      success: true,
      data: {
        categories: categories,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    }).populate('productsCount');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
    });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post(
  '/',
  [
    adminAuth,
    body('name').notEmpty().withMessage('Category name is required'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const category = new Category(req.body);
      await category.save();

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists',
        });
      }
      res.status(500).json({
        success: false,
        message: 'Server error while creating category',
      });
    }
  }
);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    adminAuth,
    body('name')
      .optional()
      .notEmpty()
      .withMessage('Category name cannot be empty'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists',
        });
      }
      res.status(500).json({
        success: false,
        message: 'Server error while updating category',
      });
    }
  }
);

// @route   DELETE /api/categories/:id
// @desc    Delete category (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      category: req.params.id,
      isActive: true,
    });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with active products',
      });
    }

    // Soft delete by setting isActive to false
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
    });
  }
});

module.exports = router;
