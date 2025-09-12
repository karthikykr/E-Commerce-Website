const express = require('express');
// const { adminAuth, logAdminAction } = require('../middleware/adminAuth');
// const categoryValidator = require('../validators/categories');
// const categoryController = require('../controllers/adminCategories');
const { createCategory } = require('../controllers/Admin/categories');
// const { Cloudinary } = require('../cloudinary');
const { upload } = require('../middleware/uploadToCloudinary');

const router = express.Router();

router.post(
  '/addcategory',
  upload([{ name: 'image', maxCount: 1 }]),
  createCategory
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
