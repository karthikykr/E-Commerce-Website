const express = require('express');
const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Get all products endpoint - Coming soon' });
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', (req, res) => {
  res.json({ message: `Get product ${req.params.id} endpoint - Coming soon` });
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/', (req, res) => {
  res.json({ message: 'Create product endpoint - Coming soon' });
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', (req, res) => {
  res.json({ message: `Update product ${req.params.id} endpoint - Coming soon` });
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete product ${req.params.id} endpoint - Coming soon` });
});

module.exports = router;
