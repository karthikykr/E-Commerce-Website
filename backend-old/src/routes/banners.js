const express = require('express');
const { Banner } = require('../models');

const router = express.Router();

// @route   GET /api/banners
// @desc    Get all active banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const position = req.query.position;

    let banners;
    if (position) {
      banners = await Banner.getActiveByPosition(position);
    } else {
      banners = await Banner.getAllActive();
    }

    // Increment view count for each banner
    const viewPromises = banners.map((banner) => banner.incrementViews());
    await Promise.all(viewPromises);

    res.json({
      success: true,
      data: { banners },
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
    });
  }
});

// @route   GET /api/banners/:position
// @desc    Get active banners by position
// @access  Public
router.get('/:position', async (req, res) => {
  try {
    const { position } = req.params;

    const validPositions = ['hero', 'top', 'middle', 'bottom', 'sidebar'];
    if (!validPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid banner position',
      });
    }

    const banners = await Banner.getActiveByPosition(position);

    // Increment view count for each banner
    const viewPromises = banners.map((banner) => banner.incrementViews());
    await Promise.all(viewPromises);

    res.json({
      success: true,
      data: { banners },
    });
  } catch (error) {
    console.error('Get banners by position error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
    });
  }
});

// @route   POST /api/banners/:id/click
// @desc    Track banner click
// @access  Public
router.post('/:id/click', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    await banner.incrementClicks();

    res.json({
      success: true,
      message: 'Click tracked successfully',
    });
  } catch (error) {
    console.error('Track banner click error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click',
    });
  }
});

module.exports = router;
