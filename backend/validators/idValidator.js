const { param } = require('express-validator');
const mongoose = require('mongoose');

exports.validateObjectId = (paramName = 'id') => [
  param(paramName)
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`Invalid ID format`),
];
