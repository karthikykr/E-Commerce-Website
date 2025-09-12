import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Verify JWT and attach user to request
 * @param {string} roleRequired Optional: 'admin' or 'user'
 */
export const authMiddleware = (roleRequired = null) => {
  return async (req, res, next) => {
    try {
      // Get token from Authorization header or cookie
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

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB
      const user = await User.findById(decoded.id).select('-password');

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

      // Check role if specified
      if (roleRequired && user.role !== roleRequired) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${roleRequired} privileges required.`,
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);

      if (error.name === 'JsonWebTokenError') {
        return res
          .status(401)
          .json({ success: false, message: 'Invalid token.' });
      }

      if (error.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ success: false, message: 'Token expired.' });
      }

      res
        .status(500)
        .json({ success: false, message: 'Server error in authentication.' });
    }
  };
};
