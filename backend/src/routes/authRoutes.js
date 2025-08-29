const express = require('express');
const { login, register } = require('../controllers/authController');
const { loginValidator, registerValidator } = require('../validators/authValidator');
const validateResult = require('../middleware/validateResult');

const router = express.Router();

router.post('/login', loginValidator, validateResult, login);

router.post('/register', registerValidator, validateResult, register);

module.exports = router;
