const { body } = require('express-validator');

//login validator

exports.loginValidator = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// register validator

exports.registerValidator = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number'),
  body('address.street')
    .optional()
    .notEmpty()
    .withMessage('Street address is required if address is provided'),
  body('address.city')
    .optional()
    .notEmpty()
    .withMessage('City is required if address is provided'),
  body('address.state')
    .optional()
    .notEmpty()
    .withMessage('State is required if address is provided'),
  body('address.zipCode')
    .optional()
    .notEmpty()
    .withMessage('ZIP code is required if address is provided'),
  body('address.country')
    .optional()
    .notEmpty()
    .withMessage('Country is required if address is provided'),
];
