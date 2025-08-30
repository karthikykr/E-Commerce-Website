const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FeaturedProduct } = require('../models');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/featured-products');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'featured-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @route   GET /api/featured-products
// @desc    Get all featured products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active = 'true' } = req.query;

    let query = {};
    if (active === 'true') {
      query.isActive = true;
    }

    const featuredProducts = await FeaturedProduct.find(query)
      .sort({ displayOrder: 1 })
      .select(
        'name price originalPrice image emoji backgroundColor position animation rotation hoverRotation discountPercentage'
      );

    res.json({
      success: true,
      data: {
        featuredProducts,
        count: featuredProducts.length,
      },
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
    });
  }
});

// @route   GET /api/featured-products/homepage
// @desc    Get featured products formatted for homepage
// @access  Public
router.get('/homepage', async (req, res) => {
  try {
    const featuredProducts = await FeaturedProduct.getHomepageProducts();

    // Group by position for easier frontend consumption
    const groupedProducts = {
      heroMain: [],
      heroBottom: [],
    };

    featuredProducts.forEach((product) => {
      if (product.position.startsWith('hero-main')) {
        groupedProducts.heroMain.push(product);
      } else if (product.position.startsWith('hero-bottom')) {
        groupedProducts.heroBottom.push(product);
      }
    });

    res.json({
      success: true,
      data: {
        featuredProducts: groupedProducts,
        total: featuredProducts.length,
      },
    });
  } catch (error) {
    console.error('Get homepage featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage featured products',
    });
  }
});

// @route   GET /api/featured-products/admin
// @desc    Get all featured products for admin (with full details)
// @access  Private (Admin)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      position = '',
      active = '',
    } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Position filter
    if (position) {
      query.position = position;
    }

    // Active filter
    if (active !== '') {
      query.isActive = active === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const featuredProducts = await FeaturedProduct.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FeaturedProduct.countDocuments(query);

    res.json({
      success: true,
      data: {
        featuredProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: page < Math.ceil(total / parseInt(limit)),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get admin featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products for admin',
    });
  }
});

// @route   GET /api/featured-products/:id
// @desc    Get featured product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const featuredProduct = await FeaturedProduct.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!featuredProduct) {
      return res.status(404).json({
        success: false,
        message: 'Featured product not found',
      });
    }

    res.json({
      success: true,
      data: { featuredProduct },
    });
  } catch (error) {
    console.error('Get featured product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured product',
    });
  }
});

// @route   POST /api/featured-products
// @desc    Create new featured product
// @access  Private (Admin)
router.post(
  '/',
  [
    adminAuth,
    upload.single('image'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('position')
      .isIn([
        'hero-main-1',
        'hero-main-2',
        'hero-bottom-1',
        'hero-bottom-2',
        'hero-bottom-3',
      ])
      .withMessage('Invalid position'),
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

      const {
        name,
        description,
        price,
        originalPrice,
        emoji,
        backgroundColor,
        position,
        category,
        tags,
        animation,
        rotation,
        hoverRotation,
      } = req.body;

      // Check if position is already taken
      const existingProduct = await FeaturedProduct.findOne({ position });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: `Position ${position} is already occupied by another product`,
        });
      }

      // Handle image upload
      let imageData = {};
      if (req.file) {
        imageData = {
          url: `/uploads/featured-products/${req.file.filename}`,
          alt: name,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: 'Product image is required',
        });
      }

      const featuredProduct = new FeaturedProduct({
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image: imageData,
        emoji: emoji || '🌶️',
        backgroundColor:
          backgroundColor || 'from-red-100 via-red-200 to-red-300',
        position,
        category,
        tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
        animation: animation || 'bounce',
        rotation: rotation || 'rotate-1',
        hoverRotation: hoverRotation || 'rotate-0',
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });

      await featuredProduct.save();

      res.status(201).json({
        success: true,
        message: 'Featured product created successfully',
        data: { featuredProduct },
      });
    } catch (error) {
      console.error('Create featured product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating featured product',
      });
    }
  }
);

// @route   PUT /api/featured-products/:id
// @desc    Update featured product
// @access  Private (Admin)
router.put('/:id', [adminAuth, upload.single('image')], async (req, res) => {
  try {
    const featuredProduct = await FeaturedProduct.findById(req.params.id);

    if (!featuredProduct) {
      return res.status(404).json({
        success: false,
        message: 'Featured product not found',
      });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      emoji,
      backgroundColor,
      position,
      category,
      tags,
      animation,
      rotation,
      hoverRotation,
      isActive,
    } = req.body;

    // Check if position is being changed and if new position is available
    if (position && position !== featuredProduct.position) {
      const existingProduct = await FeaturedProduct.findOne({
        position,
        _id: { $ne: req.params.id },
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: `Position ${position} is already occupied by another product`,
        });
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image file if it exists
      if (
        featuredProduct.image.url &&
        featuredProduct.image.url.startsWith('/uploads/')
      ) {
        const oldImagePath = path.join(
          __dirname,
          '../../',
          featuredProduct.image.url
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      featuredProduct.image = {
        url: `/uploads/featured-products/${req.file.filename}`,
        alt: name || featuredProduct.name,
      };
    }

    // Update fields
    if (name) featuredProduct.name = name;
    if (description !== undefined) featuredProduct.description = description;
    if (price) featuredProduct.price = parseFloat(price);
    if (originalPrice !== undefined)
      featuredProduct.originalPrice = originalPrice
        ? parseFloat(originalPrice)
        : undefined;
    if (emoji) featuredProduct.emoji = emoji;
    if (backgroundColor) featuredProduct.backgroundColor = backgroundColor;
    if (position) featuredProduct.position = position;
    if (category !== undefined) featuredProduct.category = category;
    if (tags) featuredProduct.tags = tags.split(',').map((tag) => tag.trim());
    if (animation) featuredProduct.animation = animation;
    if (rotation) featuredProduct.rotation = rotation;
    if (hoverRotation) featuredProduct.hoverRotation = hoverRotation;
    if (isActive !== undefined) featuredProduct.isActive = isActive === 'true';

    featuredProduct.updatedBy = req.user._id;

    await featuredProduct.save();

    res.json({
      success: true,
      message: 'Featured product updated successfully',
      data: { featuredProduct },
    });
  } catch (error) {
    console.error('Update featured product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating featured product',
    });
  }
});

// @route   DELETE /api/featured-products/:id
// @desc    Delete featured product
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const featuredProduct = await FeaturedProduct.findById(req.params.id);

    if (!featuredProduct) {
      return res.status(404).json({
        success: false,
        message: 'Featured product not found',
      });
    }

    // Delete image file if it exists
    if (
      featuredProduct.image.url &&
      featuredProduct.image.url.startsWith('/uploads/')
    ) {
      const imagePath = path.join(
        __dirname,
        '../../',
        featuredProduct.image.url
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await FeaturedProduct.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Featured product deleted successfully',
    });
  } catch (error) {
    console.error('Delete featured product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting featured product',
    });
  }
});

// @route   PATCH /api/featured-products/:id/toggle-active
// @desc    Toggle featured product active status
// @access  Private (Admin)
router.patch('/:id/toggle-active', adminAuth, async (req, res) => {
  try {
    const featuredProduct = await FeaturedProduct.findById(req.params.id);

    if (!featuredProduct) {
      return res.status(404).json({
        success: false,
        message: 'Featured product not found',
      });
    }

    await featuredProduct.toggleActive();

    res.json({
      success: true,
      message: `Featured product ${featuredProduct.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { featuredProduct },
    });
  } catch (error) {
    console.error('Toggle featured product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling featured product status',
    });
  }
});

module.exports = router;
