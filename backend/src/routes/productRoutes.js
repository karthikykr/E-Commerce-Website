const express = require('express');
const { upload } = require('../middleware/uploadToCloudinary');
const doAuthenticate = require('../middleware/authMiddleware');
const { validateObjectId } = require('../validators/idValidator');
const validateResult = require('../middleware/validateResult');
const { addProduct } = require('../controllers/products');

const router = express.Router();

// Create Product
router.post(
  '/product',
  doAuthenticate(['admin']),
  upload([{ name: 'productImage', maxCount: 5 }]),
  addProduct
);

module.exports = router;
