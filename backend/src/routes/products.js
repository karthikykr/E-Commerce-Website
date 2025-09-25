const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Product, Category } = require('../models');
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const mongoose = require('mongoose');

const router = express.Router();

// Sample data for when MongoDB is not connected
const sampleProducts = [
  {
    _id: '1',
    name: 'Premium Turmeric Powder',
    slug: 'premium-turmeric-powder',
    description:
      'High-quality turmeric powder with rich color and aroma. Perfect for cooking and health benefits.',
    shortDescription: 'Premium quality turmeric powder',
    price: 299,
    originalPrice: 399,
    category: {
      _id: '1',
      name: 'Spices & Seasonings',
      slug: 'spices-seasonings',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
        alt: 'Premium Turmeric Powder',
        isPrimary: true,
      },
    ],
    inStock: true,
    stockQuantity: 100,
    weight: { value: 250, unit: 'g' },
    origin: 'India',
    tags: ['turmeric', 'spice', 'healthy', 'organic'],
    rating: 4.8,
    reviewCount: 124,
    isFeatured: true,
    isActive: true,
    discountPercentage: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Garam Masala Blend',
    slug: 'garam-masala-blend',
    description:
      'Traditional Indian spice blend with perfect balance of warmth and flavor.',
    shortDescription: 'Authentic garam masala blend',
    price: 199,
    originalPrice: 249,
    category: { _id: '3', name: 'Masala Blends', slug: 'masala-blends' },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
        alt: 'Garam Masala Blend',
        isPrimary: true,
      },
    ],
    inStock: true,
    stockQuantity: 75,
    weight: { value: 100, unit: 'g' },
    origin: 'India',
    tags: ['garam-masala', 'blend', 'indian', 'traditional'],
    rating: 4.6,
    reviewCount: 89,
    isFeatured: true,
    isActive: true,
    discountPercentage: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    name: 'Organic Cardamom Pods',
    slug: 'organic-cardamom-pods',
    description:
      'Premium organic green cardamom pods with intense aroma and flavor.',
    shortDescription: 'Organic green cardamom pods',
    price: 899,
    originalPrice: 999,
    category: {
      _id: '4',
      name: 'Organic Collection',
      slug: 'organic-collection',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
        alt: 'Organic Cardamom Pods',
        isPrimary: true,
      },
    ],
    inStock: true,
    stockQuantity: 50,
    weight: { value: 50, unit: 'g' },
    origin: 'Kerala, India',
    tags: ['cardamom', 'organic', 'premium', 'aromatic'],
    rating: 4.9,
    reviewCount: 67,
    isFeatured: false,
    isActive: true,
    discountPercentage: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '4',
    name: 'Red Chili Powder',
    slug: 'red-chili-powder',
    description: 'Spicy red chili powder made from premium quality chilies.',
    shortDescription: 'Premium red chili powder',
    price: 179,
    originalPrice: 199,
    category: {
      _id: '1',
      name: 'Spices & Seasonings',
      slug: 'spices-seasonings',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
        alt: 'Red Chili Powder',
        isPrimary: true,
      },
    ],
    inStock: true,
    stockQuantity: 80,
    weight: { value: 200, unit: 'g' },
    origin: 'Rajasthan, India',
    tags: ['chili', 'spicy', 'red', 'powder'],
    rating: 4.5,
    reviewCount: 92,
    isFeatured: true,
    isActive: true,
    discountPercentage: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleCategories = [
  {
    _id: '1',
    name: 'Spices & Seasonings',
    slug: 'spices-seasonings',
    description: 'Premium quality spices and seasonings',
    isActive: true,
    featured: true,
  },
  {
    _id: '2',
    name: 'Herbs & Aromatics',
    slug: 'herbs-aromatics',
    description: 'Fresh and dried herbs for cooking',
    isActive: true,
    featured: true,
  },
  {
    _id: '3',
    name: 'Masala Blends',
    slug: 'masala-blends',
    description: 'Traditional and modern spice blends',
    isActive: true,
    featured: true,
  },
  {
    _id: '4',
    name: 'Organic Collection',
    slug: 'organic-collection',
    description: 'Certified organic spices and herbs',
    isActive: true,
    featured: false,
  },
];

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn([
        'name',
        'price',
        'rating',
        'createdAt',
        '-name',
        '-price',
        '-rating',
        '-createdAt',
      ]),
    query('category').optional().isMongoId().withMessage('Invalid category ID'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be non-negative'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be non-negative'),
    query('inStock')
      .optional()
      .isBoolean()
      .withMessage('inStock must be boolean'),
    query('featured')
      .optional()
      .isBoolean()
      .withMessage('featured must be boolean'),
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

      // Check if MongoDB is connected
      if (mongoose.connection.readyState !== 1) {
        // Use sample data when MongoDB is not connected
        console.log('⚠️  MongoDB not connected, using sample data');

        const { page = 1, limit = 12, search, category, featured } = req.query;

        let filteredProducts = [...sampleProducts];

        // Apply filters to sample data
        if (search) {
          const searchLower = search.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.name.toLowerCase().includes(searchLower) ||
              product.description.toLowerCase().includes(searchLower) ||
              product.tags.some((tag) =>
                tag.toLowerCase().includes(searchLower)
              )
          );
        }

        if (category) {
          filteredProducts = filteredProducts.filter(
            (product) => product.category._id === category
          );
        }

        if (featured !== undefined) {
          filteredProducts = filteredProducts.filter(
            (product) => product.isFeatured === (featured === 'true')
          );
        }

        // Simple pagination for sample data
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedProducts = filteredProducts.slice(
          skip,
          skip + parseInt(limit)
        );

        return res.json({
          success: true,
          message: 'Products retrieved successfully (sample data)',
          data: {
            products: paginatedProducts,
            pagination: {
              currentPage: parseInt(page),
              totalPages: Math.ceil(filteredProducts.length / parseInt(limit)),
              totalProducts: filteredProducts.length,
              hasNextPage: skip + parseInt(limit) < filteredProducts.length,
              hasPrevPage: parseInt(page) > 1,
            },
          },
        });
      }

      const {
        page = 1,
        limit = 12,
        sort = '-createdAt',
        search,
        category,
        minPrice,
        maxPrice,
        inStock,
        featured,
        tags,
      } = req.query;

      // Build filter object
      const filter = { isActive: true };

      if (search) {
        filter.$text = { $search: search };
      }

      if (category) {
        filter.category = category;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
      }

      if (inStock !== undefined) {
        filter.inStock = inStock === 'true';
      }

      if (featured !== undefined) {
        filter.isFeatured = featured === 'true';
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        filter.tags = { $in: tagArray };
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const products = await Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-reviews');

      const total = await Product.countDocuments(filter);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts: total,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching products',
      });
    }
  }
);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isActive: true,
      isFeatured: true,
      inStock: true,
    })
      .populate('category', 'name slug')
      .sort('-rating')
      .limit(parseInt(limit))
      .select('-reviews');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products',
    });
  }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
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

      const { q, page = 1, limit = 12 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.find({
        $text: { $search: q },
        isActive: true,
      })
        .populate('category', 'name slug')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-reviews');

      const total = await Product.countDocuments({
        $text: { $search: q },
        isActive: true,
      });

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProducts: total,
          },
        },
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while searching products',
      });
    }
  }
);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    })
      .populate('category', 'name slug description')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post(
  '/',
  [
    adminAuth,
    body('name').notEmpty().withMessage('Product name is required'),
    body('description')
      .notEmpty()
      .withMessage('Product description is required'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category').isMongoId().withMessage('Valid category ID is required'),
    body('stockQuantity')
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be non-negative'),
    body('weight.value')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Weight value must be positive'),
    body('weight.unit')
      .optional()
      .isIn(['g', 'kg', 'ml', 'l', 'oz', 'lb'])
      .withMessage('Invalid weight unit'),
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

      // Check if category exists
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found',
        });
      }

      const product = new Product(req.body);
      await product.save();

      const populatedProduct = await Product.findById(product._id).populate(
        'category',
        'name slug'
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: populatedProduct,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Product with this slug already exists',
        });
      }
      res.status(500).json({
        success: false,
        message: 'Server error while creating product',
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    adminAuth,
    body('name')
      .optional()
      .notEmpty()
      .withMessage('Product name cannot be empty'),
    body('description')
      .optional()
      .notEmpty()
      .withMessage('Product description cannot be empty'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .optional()
      .isMongoId()
      .withMessage('Valid category ID is required'),
    body('stockQuantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be non-negative'),
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

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if category exists (if being updated)
      if (req.body.category) {
        const category = await Category.findById(req.body.category);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found',
          });
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('category', 'name slug');

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Product with this slug already exists',
        });
      }
      res.status(500).json({
        success: false,
        message: 'Server error while updating product',
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Soft delete by setting isActive to false
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add product review
// @access  Private
router.post(
  '/:id/reviews',
  [
    auth,
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters'),
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

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find(
        (review) => review.user.toString() === req.user.id
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product',
        });
      }

      const review = {
        user: req.user.id,
        rating: req.body.rating,
        comment: req.body.comment,
      };

      product.reviews.push(review);
      product.calculateAverageRating();
      await product.save();

      const updatedProduct = await Product.findById(req.params.id).populate(
        'reviews.user',
        'name'
      );

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while adding review',
      });
    }
  }
);

// @route   PUT /api/products/:id/reviews/:reviewId
// @desc    Update product review
// @access  Private
router.put(
  '/:id/reviews/:reviewId',
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

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const review = product.reviews.id(req.params.reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      // Check if user owns this review
      if (review.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this review',
        });
      }

      if (req.body.rating) review.rating = req.body.rating;
      if (req.body.comment !== undefined) review.comment = req.body.comment;

      product.calculateAverageRating();
      await product.save();

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating review',
      });
    }
  }
);

// @route   DELETE /api/products/:id/reviews/:reviewId
// @desc    Delete product review
// @access  Private
router.delete('/:id/reviews/:reviewId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    product.reviews.pull(req.params.reviewId);
    product.calculateAverageRating();
    await product.save();

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
    });
  }
});

module.exports = router;
