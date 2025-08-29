const express = require("express");
const { body, validationResult } = require("express-validator");
const { Notification } = require("../models");
const auth = require("../middleware/auth");
const { adminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({
      user: req.user._id,
    });
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalNotifications,
          hasNext: page < Math.ceil(totalNotifications / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get("/unread-count", auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching unread count",
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking notification as read",
    });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put("/mark-all-read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking all notifications as read",
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
    });
  }
});

// @route   POST /api/notifications/admin/send
// @desc    Send notification to users (Admin only)
// @access  Private (Admin)
router.post(
  "/admin/send",
  [
    adminAuth,
    body("title").notEmpty().withMessage("Title is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("type")
      .isIn(["info", "success", "warning", "error", "promotion"])
      .withMessage("Invalid notification type"),
    body("recipients").isArray().withMessage("Recipients must be an array"),
    body("recipients.*")
      .isMongoId()
      .withMessage("Invalid user ID in recipients"),
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

      const { title, message, type, recipients, actionUrl, metadata } =
        req.body;

      // Create notifications for all recipients
      const notifications = recipients.map((userId) => ({
        user: userId,
        title,
        message,
        type,
        actionUrl,
        metadata,
        sentBy: req.user._id,
      }));

      await Notification.insertMany(notifications);

      res.status(201).json({
        success: true,
        message: `Notification sent to ${recipients.length} users`,
        data: { sentCount: recipients.length },
      });
    } catch (error) {
      console.error("Send notification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while sending notification",
      });
    }
  },
);

// @route   POST /api/notifications/admin/broadcast
// @desc    Broadcast notification to all users (Admin only)
// @access  Private (Admin)
router.post(
  "/admin/broadcast",
  [
    adminAuth,
    body("title").notEmpty().withMessage("Title is required"),
    body("message").notEmpty().withMessage("Message is required"),
    body("type")
      .isIn(["info", "success", "warning", "error", "promotion"])
      .withMessage("Invalid notification type"),
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

      const { title, message, type, actionUrl, metadata, userRole } = req.body;

      // Get all users (optionally filter by role)
      const { User } = require("../models");
      let userQuery = { isActive: true };
      if (userRole) {
        userQuery.role = userRole;
      }

      const users = await User.find(userQuery).select("_id");
      const userIds = users.map((user) => user._id);

      // Create notifications for all users
      const notifications = userIds.map((userId) => ({
        user: userId,
        title,
        message,
        type,
        actionUrl,
        metadata,
        sentBy: req.user._id,
      }));

      await Notification.insertMany(notifications);

      res.status(201).json({
        success: true,
        message: `Notification broadcasted to ${userIds.length} users`,
        data: { sentCount: userIds.length },
      });
    } catch (error) {
      console.error("Broadcast notification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while broadcasting notification",
      });
    }
  },
);

// @route   GET /api/notifications/admin
// @desc    Get all notifications (Admin only)
// @access  Private (Admin)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .populate("user", "name email")
      .populate("sentBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments();

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalNotifications,
          hasNext: page < Math.ceil(totalNotifications / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
});

module.exports = router;
