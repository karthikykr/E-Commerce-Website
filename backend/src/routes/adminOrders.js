const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth, logAdminAction } = require('../middleware/adminAuth');
const { Order, User, Product } = require('../models');

const router = express.Router();

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and pagination
// @access  Private (Admin)
router.get('/', adminAuth, logAdminAction('VIEW_ORDERS'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.orderStatus = status;
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get order details by ID
// @access  Private (Admin)
router.get('/:id', adminAuth, logAdminAction('VIEW_ORDER_DETAILS'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.product', 'name price images category')
      .populate('items.product.category', 'name');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details'
    });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/:id/status', [
  adminAuth,
  body('orderStatus').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
], logAdminAction('UPDATE_ORDER_STATUS'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { orderStatus, trackingNumber, notes } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    
    // Add tracking number if provided and status is shipped
    if (orderStatus === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    // Add status update to history
    order.statusHistory.push({
      status: orderStatus,
      updatedBy: req.user._id,
      updatedAt: new Date(),
      notes: notes || `Status updated from ${oldStatus} to ${orderStatus}`
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { 
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          oldStatus,
          newStatus: orderStatus,
          trackingNumber: order.trackingNumber
        }
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// @route   GET /api/admin/orders/stats/summary
// @desc    Get order statistics summary
// @access  Private (Admin)
router.get('/stats/summary', adminAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get order counts by status
    const statusCounts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    
    // Get revenue data
    const revenueData = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: ['delivered', 'shipped', 'processing'] }
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        } 
      }
    ]);
    
    // Get top products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.product', 
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        } 
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);
    
    res.json({
      success: true,
      data: {
        period,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        revenue: revenueData[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
        topProducts
      }
    });
  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
});

// @route   POST /api/admin/orders/:id/refund
// @desc    Process order refund
// @access  Private (Admin)
router.post('/:id/refund', [
  adminAuth,
  body('amount').isNumeric().withMessage('Refund amount must be a number'),
  body('reason').notEmpty().withMessage('Refund reason is required')
], logAdminAction('PROCESS_REFUND'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { amount, reason, refundMethod = 'original' } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered or cancelled to process refund'
      });
    }
    
    if (amount > order.total) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order total'
      });
    }
    
    // Add refund to order
    order.refunds.push({
      amount,
      reason,
      refundMethod,
      processedBy: req.user._id,
      processedAt: new Date(),
      status: 'processed'
    });
    
    // Update order status if full refund
    if (amount === order.total) {
      order.orderStatus = 'refunded';
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { 
        refund: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount,
          reason,
          processedAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund'
    });
  }
});

module.exports = router;
