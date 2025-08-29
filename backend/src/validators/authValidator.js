const { body } = require('express-validator');

//login validator

exports.loginValidator = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// register validator

exports.registerValidator = [
  body('name').notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];
