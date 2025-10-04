const express = require('express');
const { upload } = require('../middleware/uploadToCloudinary');
const doAuthenticate = require('../middleware/authMiddleware');
const { validateObjectId } = require('../validators/idValidator');
const validateResult = require('../middleware/validateResult');
const {
  createCategory,
  getCategoryById,
  updateCategory,
  getCategories,
  deleteCategory,
} = require('../controllers/categories');

const router = express.Router();

// Create Category
router.post(
  '/category',
  doAuthenticate(['admin']),
  upload([{ name: 'image', maxCount: 1 }]),
  createCategory
);

// Get Category By Id
router.get(
  '/category/:id',
  doAuthenticate(),
  validateObjectId('id'),
  validateResult,
  getCategoryById
);

//Get Ctegory By Filter
router.get(
  '/category',
  // doAuthenticate(),
  getCategories
);

// Update the Categories
router.patch(
  '/category/:id',
  doAuthenticate(['admin']),
  validateObjectId('id'),
  validateResult,
  upload([{ name: 'image', maxCount: 1 }]),
  updateCategory
);

// Delete Category By Id
router.delete(
  '/category/:id',
  doAuthenticate(['admin']),
  validateObjectId('id'),
  validateResult,
  deleteCategory
);

module.exports = router;
