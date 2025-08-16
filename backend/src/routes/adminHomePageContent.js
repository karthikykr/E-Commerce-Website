const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth, logAdminAction } = require('../middleware/adminAuth');
const { 
  bannerImageUpload, 
  optimizeImage, 
  createThumbnails, 
  handleUploadError,
  deleteUploadedFiles,
  getFileUrl 
} = require('../middleware/imageUpload');
const { HomePageContent } = require('../models');

const router = express.Router();

// @route   GET /api/admin/homepage-content
// @desc    Get current home page content
// @access  Private (Admin)
router.get('/', adminAuth, logAdminAction('VIEW_HOMEPAGE_CONTENT'), async (req, res) => {
  try {
    let content = await HomePageContent.getActiveContent();
    
    // Create default content if none exists
    if (!content) {
      content = await HomePageContent.createDefaultContent();
    }
    
    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('Get homepage content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage content'
    });
  }
});

// @route   PUT /api/admin/homepage-content
// @desc    Update home page content
// @access  Private (Admin)
router.put('/', [
  adminAuth,
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('globalSettings.theme').optional().isIn(['default', 'modern', 'classic', 'minimal']).withMessage('Invalid theme'),
  body('globalSettings.primaryColor').optional().isHexColor().withMessage('Primary color must be a valid hex color'),
  body('globalSettings.secondaryColor').optional().isHexColor().withMessage('Secondary color must be a valid hex color')
], logAdminAction('UPDATE_HOMEPAGE_CONTENT'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let content = await HomePageContent.getActiveContent();
    
    if (!content) {
      content = await HomePageContent.createDefaultContent();
    }

    // Update content
    const updateData = req.body;
    updateData.modifiedBy = req.user._id;
    
    Object.assign(content, updateData);
    await content.save();

    res.json({
      success: true,
      message: 'Homepage content updated successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Update homepage content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating homepage content'
    });
  }
});

// @route   POST /api/admin/homepage-content/sections
// @desc    Add new section to home page
// @access  Private (Admin)
router.post('/sections', [
  adminAuth,
  body('type').isIn([
    'hero_banner', 'featured_products', 'special_offers', 'categories', 
    'about_us', 'why_choose_us', 'newsletter', 'testimonials', 'custom_html'
  ]).withMessage('Invalid section type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], logAdminAction('ADD_HOMEPAGE_SECTION'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let content = await HomePageContent.getActiveContent();
    
    if (!content) {
      content = await HomePageContent.createDefaultContent();
    }

    const sectionData = req.body;
    await content.addSection(sectionData);

    res.status(201).json({
      success: true,
      message: 'Section added successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Add homepage section error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding section'
    });
  }
});

// @route   PUT /api/admin/homepage-content/sections/:sectionId
// @desc    Update home page section
// @access  Private (Admin)
router.put('/sections/:sectionId', [
  adminAuth,
  body('title').optional().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], logAdminAction('UPDATE_HOMEPAGE_SECTION'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const content = await HomePageContent.getActiveContent();
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Homepage content not found'
      });
    }

    const updateData = req.body;
    updateData.modifiedBy = req.user._id;
    
    await content.updateSection(req.params.sectionId, updateData);

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Update homepage section error:', error);
    
    if (error.message === 'Section not found') {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating section'
    });
  }
});

// @route   DELETE /api/admin/homepage-content/sections/:sectionId
// @desc    Remove section from home page
// @access  Private (Admin)
router.delete('/sections/:sectionId', 
  adminAuth,
  logAdminAction('DELETE_HOMEPAGE_SECTION'),
  async (req, res) => {
    try {
      const content = await HomePageContent.getActiveContent();
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Homepage content not found'
        });
      }

      await content.removeSection(req.params.sectionId);

      res.json({
        success: true,
        message: 'Section removed successfully',
        data: { content }
      });
    } catch (error) {
      console.error('Remove homepage section error:', error);
      
      if (error.message === 'Section not found') {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error removing section'
      });
    }
  }
);

// @route   PUT /api/admin/homepage-content/sections/reorder
// @desc    Reorder home page sections
// @access  Private (Admin)
router.put('/sections/reorder', [
  adminAuth,
  body('sectionOrders').isArray().withMessage('Section orders must be an array'),
  body('sectionOrders.*.sectionId').notEmpty().withMessage('Section ID is required'),
  body('sectionOrders.*.displayOrder').isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
], logAdminAction('REORDER_HOMEPAGE_SECTIONS'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const content = await HomePageContent.getActiveContent();
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Homepage content not found'
      });
    }

    const { sectionOrders } = req.body;
    await content.reorderSections(sectionOrders);

    res.json({
      success: true,
      message: 'Sections reordered successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Reorder homepage sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering sections'
    });
  }
});

// @route   POST /api/admin/homepage-content/upload-banner
// @desc    Upload banner image for home page
// @access  Private (Admin)
router.post('/upload-banner', 
  adminAuth,
  bannerImageUpload.single('banner'),
  optimizeImage,
  createThumbnails,
  logAdminAction('UPLOAD_BANNER'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No banner image uploaded'
        });
      }

      const bannerUrl = getFileUrl(req.file);
      const thumbnailUrl = req.file.thumbnail ? req.file.thumbnail.url : null;

      res.json({
        success: true,
        message: 'Banner uploaded successfully',
        data: {
          url: bannerUrl,
          thumbnail: thumbnailUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Upload banner error:', error);
      
      if (req.file) {
        deleteUploadedFiles([req.file]);
      }
      
      res.status(500).json({
        success: false,
        message: 'Error uploading banner'
      });
    }
  }
);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
