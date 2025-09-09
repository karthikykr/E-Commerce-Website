const { body } = require('express-validator');

exports.createCategory = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

exports.updateCategory = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Category name cannot be empty'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

exports.reorderCategories = [
  body('categories').isArray().withMessage('Categories must be an array'),
  body('categories.*.id').isMongoId().withMessage('Invalid category ID'),
  body('categories.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];