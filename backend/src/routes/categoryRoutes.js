const express = require('express');
const { upload } = require('../middleware/uploadToCloudinary');
const doAuthenticate = require('../middleware/authMiddleware');
const {
  createCategory,
  getCategoryById,
  updateCategory,
} = require('../controllers/Admin/categories');

const router = express.Router();

router.post(
  '/category',
  doAuthenticate(['admin']),
  upload([{ name: 'image', maxCount: 1 }]),
  createCategory
);

router.get('/category/:id', doAuthenticate(), getCategoryById);

router.patch(
  '/category/:id',
  doAuthenticate(['admin']),
  upload([{ name: 'image', maxCount: 1 }]),
  updateCategory
);

// @route   GET /api/admin/categories
// @desc    Get all categories with admin details
// @access  Private (Admin)
// router.get(
//   '/',
//   adminAuth,
//   logAdminAction('VIEW_CATEGORIES'),
//   categoryController.getAllCategories
// );

// // @route   GET /api/admin/categories/:id
// // @desc    Get category details by ID
// // @access  Private (Admin)
// router.get(
//   '/:id',
//   adminAuth,
//   logAdminAction('VIEW_CATEGORY'),
//   categoryController.getCategoryById
// );

// // @route   POST /api/admin/categories
// // @desc    Create new category
// // @access  Private (Admin)
// router.post(
//   '/',
//   adminAuth,
//   categoryValidator.createCategory,
//   logAdminAction('CREATE_CATEGORY'),
//   categoryController.createCategory
// );

// // @route   PUT /api/admin/categories/:id
// // @desc    Update category
// // @access  Private (Admin)
// router.put(
//   '/:id',
//   adminAuth,
//   categoryValidator.updateCategory,
//   logAdminAction('UPDATE_CATEGORY'),
//   categoryController.updateCategory
// );

// // @route   DELETE /api/admin/categories/:id
// // @desc    Delete category
// // @access  Private (Admin)
// router.delete(
//   '/:id',
//   adminAuth,
//   logAdminAction('DELETE_CATEGORY'),
//   categoryController.deleteCategory
// );

// // @route   PUT /api/admin/categories/:id/toggle-status
// // @desc    Toggle category active status
// // @access  Private (Admin)
// router.put(
//   '/:id/toggle-status',
//   adminAuth,
//   logAdminAction('TOGGLE_CATEGORY_STATUS'),
//   categoryController.toggleCategoryStatus
// );

// // @route   PUT /api/admin/categories/reorder
// // @desc    Reorder categories
// // @access  Private (Admin)
// router.put(
//   '/reorder',
//   adminAuth,
//   categoryValidator.reorderCategories,
//   logAdminAction('REORDER_CATEGORIES'),
//   categoryController.reorderCategories
// );

module.exports = router;
