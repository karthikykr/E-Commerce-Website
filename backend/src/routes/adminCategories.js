const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth, logAdminAction } = require('../middleware/adminAuth');
const { Category, Product } = require('../models');

const router = express.Router();

// @route   GET /api/admin/categories
// @desc    Get all categories with admin details
// @access  Private (Admin)
router.get(
  '/',
  adminAuth,
  logAdminAction('VIEW_CATEGORIES'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        sortBy = 'sortOrder',
        sortOrder = 'asc',
      } = req.query;

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const categories = await Category.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      // Get product count for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id,
          });
          return {
            ...category.toObject(),
            productCount,
          };
        })
      );

      const totalCategories = await Category.countDocuments(query);
      const totalPages = Math.ceil(totalCategories / parseInt(limit));

      res.json({
        success: true,
        data: {
          categories: categoriesWithCount,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCategories,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
      });
    }
  }
);

// @route   GET /api/admin/categories/:id
// @desc    Get category details by ID
// @access  Private (Admin)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Get products in this category
    const products = await Product.find({ category: category._id })
      .select('name slug price stockQuantity isActive')
      .limit(10);

    const productCount = await Product.countDocuments({
      category: category._id,
    });

    res.json({
      success: true,
      data: {
        category: {
          ...category.toObject(),
          productCount,
        },
        recentProducts: products,
      },
    });
  } catch (error) {
    console.error('Get category details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category details',
    });
  }
});

// @route   POST /api/admin/categories
// @desc    Create new category
// @access  Private (Admin)
router.post(
  '/',
  [
    adminAuth,
    body('name').notEmpty().withMessage('Category name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Sort order must be a non-negative integer'),
  ],
  logAdminAction('CREATE_CATEGORY'),
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

      const { name, description, image, sortOrder } = req.body;

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }

      // Get next sort order if not provided
      let finalSortOrder = sortOrder;
      if (!finalSortOrder) {
        const lastCategory = await Category.findOne().sort({ sortOrder: -1 });
        finalSortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;
      }

      const category = new Category({
        name,
        slug,
        description,
        image: image || `/images/categories/${slug}.jpg`,
        sortOrder: finalSortOrder,
        isActive: true,
      });

      await category.save();

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category },
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating category',
      });
    }
  }
);

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Private (Admin)
router.put(
  '/:id',
  [
    adminAuth,
    body('name')
      .optional()
      .notEmpty()
      .withMessage('Category name cannot be empty'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Sort order must be a non-negative integer'),
  ],
  logAdminAction('UPDATE_CATEGORY'),
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

      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Update fields
      const updateFields = req.body;

      // If name is being updated, update slug too
      if (updateFields.name && updateFields.name !== category.name) {
        const newSlug = updateFields.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const existingCategory = await Category.findOne({
          slug: newSlug,
          _id: { $ne: category._id },
        });

        if (existingCategory) {
          return res.status(400).json({
            success: false,
            message: 'Category with this name already exists',
          });
        }

        updateFields.slug = newSlug;
      }

      Object.assign(category, updateFields);
      await category.save();

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category },
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category',
      });
    }
  }
);

// @route   DELETE /api/admin/categories/:id
// @desc    Delete category
// @access  Private (Admin)
router.delete(
  '/:id',
  adminAuth,
  logAdminAction('DELETE_CATEGORY'),
  async (req, res) => {
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
        category: category._id,
      });
      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category. It has ${productCount} products. Please move or delete the products first.`,
        });
      }

      await Category.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting category',
      });
    }
  }
);

// @route   PUT /api/admin/categories/:id/toggle-status
// @desc    Toggle category active status
// @access  Private (Admin)
router.put(
  '/:id/toggle-status',
  adminAuth,
  logAdminAction('TOGGLE_CATEGORY_STATUS'),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      category.isActive = !category.isActive;
      await category.save();

      res.json({
        success: true,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          category: {
            id: category._id,
            name: category.name,
            isActive: category.isActive,
          },
        },
      });
    } catch (error) {
      console.error('Toggle category status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category status',
      });
    }
  }
);

// @route   PUT /api/admin/categories/reorder
// @desc    Reorder categories
// @access  Private (Admin)
router.put(
  '/reorder',
  [
    adminAuth,
    body('categories').isArray().withMessage('Categories must be an array'),
    body('categories.*.id').isMongoId().withMessage('Invalid category ID'),
    body('categories.*.sortOrder')
      .isInt({ min: 0 })
      .withMessage('Sort order must be a non-negative integer'),
  ],
  logAdminAction('REORDER_CATEGORIES'),
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

      const { categories } = req.body;

      // Update sort order for each category
      const updatePromises = categories.map(({ id, sortOrder }) =>
        Category.findByIdAndUpdate(id, { sortOrder }, { new: true })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: 'Categories reordered successfully',
      });
    } catch (error) {
      console.error('Reorder categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error reordering categories',
      });
    }
  }
);

module.exports = router;
