const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (customers only)
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('authMethod').isIn(['email', 'mobile']).withMessage('Auth method must be email or mobile'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('mobile').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, authMethod, password, email, mobile, phone, address } = req.body;

    // Check if user already exists
    let existingUser;
    if (authMethod === 'email') {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required for email authentication'
        });
      }
      existingUser = await User.findOne({ email, authMethod: 'email' });
    } else if (authMethod === 'mobile') {
      if (!mobile) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number is required for mobile authentication'
        });
      }
      existingUser = await User.findOne({ mobile, authMethod: 'mobile' });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this credential'
      });
    }

    // Create new user
    const userData = {
      name,
      authMethod,
      password,
      role: 'user',
      phone,
      address
    };

    if (authMethod === 'email') {
      userData.email = email;
    } else if (authMethod === 'mobile') {
      userData.mobile = mobile;
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          authMethod: user.authMethod
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Role-based login (admin, email, mobile)
// @access  Public
router.post('/login', [
  body('identifier').notEmpty().withMessage('Login identifier is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('authMethod').isIn(['email', 'mobile', 'admin']).withMessage('Invalid auth method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { identifier, password, authMethod } = req.body;

    // Find user based on auth method
    let user;
    if (authMethod === 'email') {
      user = await User.findOne({ email: identifier, authMethod: 'email' }).select('+password');
    } else if (authMethod === 'mobile') {
      user = await User.findOne({ mobile: identifier, authMethod: 'mobile' }).select('+password');
    } else if (authMethod === 'admin') {
      user = await User.findOne({ adminId: identifier, authMethod: 'admin', role: 'admin' }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          adminId: user.adminId,
          role: user.role,
          authMethod: user.authMethod
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          adminId: user.adminId,
          role: user.role,
          authMethod: user.authMethod,
          phone: user.phone,
          address: user.address,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
