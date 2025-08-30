const express = require('express');
const { body, validationResult } = require('express-validator');
const { Product, Order } = require('../models');
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('reviews.user', 'name')
      .select('reviews rating averageRating');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: {
        reviews: product.reviews,
        averageRating: product.averageRating,
        totalReviews: product.reviews.length,
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
    });
  }
});

// @route   POST /api/reviews/product/:productId
// @desc    Add a review for a product
// @access  Private
router.post(
  '/product/:productId',
  [
    auth,
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters'),
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { rating, comment, title } = req.body;
      const productId = req.params.productId;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if user has purchased this product
      const userOrder = await Order.findOne({
        user: req.user._id,
        'items.product': productId,
        orderStatus: 'delivered',
      });

      if (!userOrder) {
        return res.status(400).json({
          success: false,
          message:
            'You can only review products you have purchased and received',
        });
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product',
        });
      }

      // Add review
      const review = {
        user: req.user._id,
        rating,
        comment,
        title,
        createdAt: new Date(),
      };

      product.reviews.push(review);
      product.calculateAverageRating();
      await product.save();

      // Populate the new review
      await product.populate('reviews.user', 'name');
      const newReview = product.reviews[product.reviews.length - 1];

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: { review: newReview },
      });
    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while adding review',
      });
    }
  }
);

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private
router.put(
  '/:reviewId',
  [
    auth,
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters'),
    body('title')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { rating, comment, title } = req.body;

      // Find product with this review
      const product = await Product.findOne({
        'reviews._id': req.params.reviewId,
      });
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      const review = product.reviews.id(req.params.reviewId);

      // Check if user owns this review
      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this review',
        });
      }

      // Update review
      if (rating !== undefined) review.rating = rating;
      if (comment !== undefined) review.comment = comment;
      if (title !== undefined) review.title = title;
      review.updatedAt = new Date();

      product.calculateAverageRating();
      await product.save();

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: { review },
      });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating review',
      });
    }
  }
);

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    // Find product with this review
    const product = await Product.findOne({
      'reviews._id': req.params.reviewId,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const review = product.reviews.id(req.params.reviewId);

    // Check if user owns this review or is admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    // Remove review
    product.reviews.pull(req.params.reviewId);
    product.calculateAverageRating();
    await product.save();

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
    });
  }
});

// @route   GET /api/reviews/admin
// @desc    Get all reviews (Admin only)
// @access  Private (Admin)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .populate('reviews.user', 'name email')
      .select('name reviews')
      .sort({ 'reviews.createdAt': -1 })
      .skip(skip)
      .limit(limit);

    // Flatten reviews with product info
    const allReviews = [];
    products.forEach((product) => {
      product.reviews.forEach((review) => {
        allReviews.push({
          _id: review._id,
          product: {
            _id: product._id,
            name: product.name,
          },
          user: review.user,
          rating: review.rating,
          comment: review.comment,
          title: review.title,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        });
      });
    });

    // Sort by creation date
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalReviews = allReviews.length;

    res.json({
      success: true,
      data: {
        reviews: allReviews.slice(skip, skip + limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page < Math.ceil(totalReviews / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
    });
  }
});

module.exports = router;
