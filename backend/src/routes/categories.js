const express = require('express');
const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Get all categories endpoint - Coming soon' });
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', (req, res) => {
  res.json({ message: `Get category ${req.params.id} endpoint - Coming soon` });
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/', (req, res) => {
  res.json({ message: 'Create category endpoint - Coming soon' });
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put('/:id', (req, res) => {
  res.json({ message: `Update category ${req.params.id} endpoint - Coming soon` });
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete category ${req.params.id} endpoint - Coming soon` });
});

module.exports = router;
