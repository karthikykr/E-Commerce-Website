const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Admin Authentication Middleware
 * Verifies JWT token and ensures user has admin role
 */
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.header('x-auth-token') ||
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    let user;

    // Handle hardcoded admin users
    if (decoded.id === 'admin-hardcoded-id') {
      user = {
        _id: 'admin-hardcoded-id',
        name: 'Admin User',
        email: 'admin@123.com',
        role: 'admin',
        isActive: true,
        authMethod: 'email',
      };
    } else if (decoded.id === 'admin-kaushik-id') {
      user = {
        _id: 'admin-kaushik-id',
        name: 'Kaushik B Shetty',
        email: 'kaushikbshetty1@gmail.com',
        role: 'admin',
        isActive: true,
        authMethod: 'email',
      };
    } else {
      // Get user from database for regular users
      user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.',
        });
      }
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication.',
    });
  }
};

/**
 * Log admin actions for audit trail
 */
const logAdminAction = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Log the action
      console.log(
        `[ADMIN ACTION] ${new Date().toISOString()} - User: ${req.user?.email} - Action: ${action} - IP: ${req.ip} - Status: ${res.statusCode}`
      );

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  adminAuth,
  logAdminAction,
};
