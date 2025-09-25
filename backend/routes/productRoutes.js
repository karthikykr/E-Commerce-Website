const express = require('express');
const { upload } = require('../middleware/uploadToCloudinary');
const doAuthenticate = require('../middleware/authMiddleware');
const { validateObjectId } = require('../validators/idValidator');
const validateResult = require('../middleware/validateResult');
const {
  addProduct,
  updateProduct,
  getProductById,
  getProductsByFilter,
  deleteProductById,
} = require('../controllers/products');

const router = express.Router();

// Create Product
router.post(
  '/product',
  doAuthenticate(['admin']),
  upload([{ name: 'productImage', maxCount: 5 }]),
  addProduct
);

// Get Product By filter
router.get('/product', getProductsByFilter);

// Get Product By Id
router.get(
  '/product/:id',
  validateObjectId('id'),
  validateResult,
  getProductById
);

// Get Product By Id
router.delete(
  '/product/:id',
  doAuthenticate(['admin']),
  validateObjectId('id'),
  validateResult,
  deleteProductById
);

// Update Product
router.patch(
  '/product/:id',
  doAuthenticate(['admin']),
  validateObjectId('id'),
  validateResult,
  upload([{ name: 'productImage', maxCount: 5 }]),
  updateProduct
);

module.exports = router;
