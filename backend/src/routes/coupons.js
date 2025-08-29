const express = require("express");
const { body, validationResult } = require("express-validator");
const { Coupon, Order } = require("../models");
const auth = require("../middleware/auth");
const { adminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// @route   GET /api/coupons
// @desc    Get all active coupons (Public for display)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      usageCount: { $lt: "$maxUsage" },
    }).select("-usedBy");

    res.json({
      success: true,
      data: { coupons },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching coupons",
    });
  }
});

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Private
router.post(
  "/validate",
  [
    auth,
    body("code").notEmpty().withMessage("Coupon code is required"),
    body("orderTotal")
      .isFloat({ min: 0 })
      .withMessage("Order total must be a positive number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { code, orderTotal } = req.body;

      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired coupon code",
        });
      }

      // Check usage limits
      if (coupon.usageCount >= coupon.maxUsage) {
        return res.status(400).json({
          success: false,
          message: "Coupon usage limit exceeded",
        });
      }

      // Check per-user usage limit
      if (coupon.maxUsagePerUser > 0) {
        const userUsageCount = coupon.usedBy.filter(
          (usage) => usage.user.toString() === req.user._id.toString(),
        ).length;

        if (userUsageCount >= coupon.maxUsagePerUser) {
          return res.status(400).json({
            success: false,
            message:
              "You have already used this coupon the maximum number of times",
          });
        }
      }

      // Check minimum order amount
      if (orderTotal < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (orderTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      res.json({
        success: true,
        data: {
          coupon: {
            _id: coupon._id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: Math.round(discountAmount * 100) / 100,
          },
        },
      });
    } catch (error) {
      console.error("Validate coupon error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while validating coupon",
      });
    }
  },
);

// @route   POST /api/coupons/apply
// @desc    Apply a coupon to an order
// @access  Private
router.post(
  "/apply",
  [
    auth,
    body("code").notEmpty().withMessage("Coupon code is required"),
    body("orderId").isMongoId().withMessage("Valid order ID is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { code, orderId } = req.body;

      // Find the order
      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
        orderStatus: "pending",
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or cannot be modified",
        });
      }

      // Validate coupon
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired coupon code",
        });
      }

      // Apply coupon logic (similar to validate)
      // ... (validation logic from above)

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (order.subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      // Update order
      order.coupon = {
        code: coupon.code,
        discountAmount: Math.round(discountAmount * 100) / 100,
      };
      order.total =
        order.subtotal + order.shippingCost + order.tax - discountAmount;
      await order.save();

      // Update coupon usage
      coupon.usageCount += 1;
      coupon.usedBy.push({
        user: req.user._id,
        usedAt: new Date(),
        orderAmount: order.subtotal,
        discountAmount: discountAmount,
      });
      await coupon.save();

      res.json({
        success: true,
        message: "Coupon applied successfully",
        data: { order },
      });
    } catch (error) {
      console.error("Apply coupon error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while applying coupon",
      });
    }
  },
);

// @route   GET /api/coupons/admin
// @desc    Get all coupons (Admin only)
// @access  Private (Admin)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCoupons = await Coupon.countDocuments();

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCoupons / limit),
          totalCoupons,
          hasNext: page < Math.ceil(totalCoupons / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get admin coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching coupons",
    });
  }
});

// @route   POST /api/coupons/admin
// @desc    Create a new coupon (Admin only)
// @access  Private (Admin)
router.post(
  "/admin",
  [
    adminAuth,
    body("code").notEmpty().withMessage("Coupon code is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("discountType")
      .isIn(["percentage", "fixed"])
      .withMessage("Discount type must be percentage or fixed"),
    body("discountValue")
      .isFloat({ min: 0 })
      .withMessage("Discount value must be positive"),
    body("validFrom").isISO8601().withMessage("Valid from date is required"),
    body("validUntil").isISO8601().withMessage("Valid until date is required"),
    body("maxUsage")
      .isInt({ min: 1 })
      .withMessage("Max usage must be at least 1"),
    body("minOrderAmount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Min order amount must be non-negative"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({
        code: req.body.code.toUpperCase(),
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      const couponData = {
        ...req.body,
        code: req.body.code.toUpperCase(),
        createdBy: req.user._id,
      };

      const coupon = new Coupon(couponData);
      await coupon.save();

      res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        data: { coupon },
      });
    } catch (error) {
      console.error("Create coupon error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating coupon",
      });
    }
  },
);

module.exports = router;
