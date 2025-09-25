const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { adminAuth, logAdminAction } = require('../middleware/adminAuth');
const {
  productImageUpload,
  optimizeImage,
  createThumbnails,
  handleUploadError,
  deleteUploadedFiles,
  getFileUrl,
} = require('../middleware/imageUpload');
const { Product, Category } = require('../models');

const router = express.Router();

// @route   GET /api/admin/products
// @desc    Get all products with admin details
// @access  Private (Admin)
router.get(
  '/',
  adminAuth,
  logAdminAction('VIEW_PRODUCTS'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        category = '',
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (category) {
        query.category = category;
      }

      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const products = await Product.find(query)
        .populate('category', 'name')
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / parseInt(limit));

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
      });
    }
  }
);

// @route   GET /api/admin/products/:id
// @desc    Get product details by ID
// @access  Private (Admin)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
    });
  }
});

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Private (Admin)
router.post(
  '/',
  adminAuth,
  productImageUpload.array('images', 10), // Allow up to 10 images
  optimizeImage,
  createThumbnails,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').isMongoId().withMessage('Valid category ID is required'),
    body('stockQuantity')
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be a non-negative integer'),
    body('weight.value')
      .isNumeric()
      .withMessage('Weight value must be a number'),
    body('weight.unit').notEmpty().withMessage('Weight unit is required'),
  ],
  logAdminAction('CREATE_PRODUCT'),
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
        shortDescription,
        price,
        originalPrice,
        category,
        images,
        stockQuantity,
        weight,
        origin,
        tags,
        nutritionalInfo,
        storageInstructions,
        isActive = true,
        isFeatured = false,
      } = req.body;

      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        // Clean up uploaded files if product creation fails
        if (req.files && req.files.length > 0) {
          deleteUploadedFiles(req.files);
        }
        return res.status(400).json({
          success: false,
          message: 'Product with this name already exists',
        });
      }

      // Process uploaded images
      let processedImages = [];

      // Handle uploaded files
      if (req.files && req.files.length > 0) {
        processedImages = req.files.map((file, index) => ({
          url: getFileUrl(file),
          alt: `${name} - Image ${index + 1}`,
          isPrimary: index === 0, // First image is primary
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          thumbnail: file.thumbnail
            ? {
                url: file.thumbnail.url,
                filename: file.thumbnail.filename,
              }
            : undefined,
        }));
      }

      // Handle images from request body (URLs)
      if (images && Array.isArray(images)) {
        const urlImages = images
          .filter((img) => img.url)
          .map((img, index) => ({
            url: img.url,
            alt:
              img.alt ||
              `${name} - Image ${processedImages.length + index + 1}`,
            isPrimary: processedImages.length === 0 && index === 0, // Primary if no uploaded files
          }));
        processedImages = [...processedImages, ...urlImages];
      }

      // Ensure at least one image is marked as primary
      if (
        processedImages.length > 0 &&
        !processedImages.some((img) => img.isPrimary)
      ) {
        processedImages[0].isPrimary = true;
      }

      const product = new Product({
        name,
        slug,
        description,
        shortDescription,
        price,
        originalPrice,
        category,
        images: processedImages,
        stockQuantity,
        weight,
        origin,
        tags: tags || [],
        nutritionalInfo,
        storageInstructions,
        isActive,
        isFeatured,
        rating: 0,
        reviewCount: 0,
      });

      await product.save();
      await product.populate('category', 'name');

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product },
      });
    } catch (error) {
      console.error('Create product error:', error);

      // Clean up uploaded files if product creation fails
      if (req.files && req.files.length > 0) {
        deleteUploadedFiles(req.files);
      }

      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private (Admin)
router.put(
  '/:id',
  [
    adminAuth,
    body('name')
      .optional()
      .notEmpty()
      .withMessage('Product name cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('stockQuantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be a non-negative integer'),
  ],
  logAdminAction('UPDATE_PRODUCT'),
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

      // Update fields
      const updateFields = req.body;

      // If name is being updated, update slug too
      if (updateFields.name && updateFields.name !== product.name) {
        const newSlug = updateFields.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const existingProduct = await Product.findOne({
          slug: newSlug,
          _id: { $ne: product._id },
        });

        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: 'Product with this name already exists',
          });
        }

        updateFields.slug = newSlug;
      }

      Object.assign(product, updateFields);
      await product.save();
      await product.populate('category', 'name');

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
      });
    }
  }
);

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete(
  '/:id',
  adminAuth,
  logAdminAction('DELETE_PRODUCT'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      await Product.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
      });
    }
  }
);

// @route   PUT /api/admin/products/:id/stock
// @desc    Update product stock
// @access  Private (Admin)
router.put(
  '/:id/stock',
  [
    adminAuth,
    body('stockQuantity')
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be a non-negative integer'),
  ],
  logAdminAction('UPDATE_PRODUCT_STOCK'),
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

      const { stockQuantity } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const oldStock = product.stockQuantity;
      product.stockQuantity = stockQuantity;
      await product.save();

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          product: {
            id: product._id,
            name: product.name,
            oldStock,
            newStock: stockQuantity,
          },
        },
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating stock',
      });
    }
  }
);

// @route   PATCH /api/admin/products/:id/feature
// @desc    Toggle product featured status
// @access  Private (Admin)
router.patch(
  '/:id/feature',
  adminAuth,
  logAdminAction('TOGGLE_PRODUCT_FEATURED'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Toggle the isFeatured status
      product.isFeatured = !product.isFeatured;
      await product.save();
      await product.populate('category', 'name');

      res.json({
        success: true,
        message: `Product ${product.isFeatured ? 'added to' : 'removed from'} homepage successfully`,
        data: {
          product: {
            id: product._id,
            name: product.name,
            isFeatured: product.isFeatured,
          },
        },
      });
    } catch (error) {
      console.error('Toggle featured product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling product featured status',
      });
    }
  }
);

// @route   POST /api/admin/products/:id/images
// @desc    Add images to existing product
// @access  Private (Admin)
router.post(
  '/:id/images',
  adminAuth,
  productImageUpload.array('images', 10),
  optimizeImage,
  createThumbnails,
  logAdminAction('ADD_PRODUCT_IMAGES'),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded',
        });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        deleteUploadedFiles(req.files);
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Process uploaded images
      const newImages = req.files.map((file, index) => ({
        url: getFileUrl(file),
        alt: `${product.name} - Image ${product.images.length + index + 1}`,
        isPrimary: product.images.length === 0 && index === 0, // First image is primary if no existing images
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        thumbnail: file.thumbnail
          ? {
              url: file.thumbnail.url,
              filename: file.thumbnail.filename,
            }
          : undefined,
      }));

      // Add new images to product
      product.images.push(...newImages);
      await product.save();

      res.json({
        success: true,
        message: 'Images added successfully',
        data: {
          product: await product.populate('category', 'name'),
          addedImages: newImages,
        },
      });
    } catch (error) {
      console.error('Add product images error:', error);

      if (req.files && req.files.length > 0) {
        deleteUploadedFiles(req.files);
      }

      res.status(500).json({
        success: false,
        message: 'Error adding images to product',
      });
    }
  }
);

// @route   DELETE /api/admin/products/:id/images/:imageId
// @desc    Remove image from product
// @access  Private (Admin)
router.delete(
  '/:id/images/:imageId',
  adminAuth,
  logAdminAction('REMOVE_PRODUCT_IMAGE'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const imageIndex = product.images.findIndex(
        (img) => img._id.toString() === req.params.imageId
      );
      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }

      const removedImage = product.images[imageIndex];

      // Remove image from filesystem if it's a local file
      if (removedImage.filename) {
        deleteUploadedFiles([
          {
            path: path.join(
              __dirname,
              '../../uploads/products',
              removedImage.filename
            ),
            thumbnail: removedImage.thumbnail,
          },
        ]);
      }

      // Remove image from product
      await product.removeImage(req.params.imageId);

      res.json({
        success: true,
        message: 'Image removed successfully',
        data: { product: await product.populate('category', 'name') },
      });
    } catch (error) {
      console.error('Remove product image error:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing image from product',
      });
    }
  }
);

// @route   PUT /api/admin/products/:id/images/:imageId/primary
// @desc    Set image as primary
// @access  Private (Admin)
router.put(
  '/:id/images/:imageId/primary',
  adminAuth,
  logAdminAction('SET_PRIMARY_IMAGE'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      await product.setPrimaryImage(req.params.imageId);

      res.json({
        success: true,
        message: 'Primary image updated successfully',
        data: { product: await product.populate('category', 'name') },
      });
    } catch (error) {
      console.error('Set primary image error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error setting primary image',
      });
    }
  }
);

// Error handling middleware for image uploads
router.use(handleUploadError);

module.exports = router;
