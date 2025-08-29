const express = require("express");
const path = require("path");
const { body, validationResult } = require("express-validator");
const { adminAuth, logAdminAction } = require("../middleware/adminAuth");
const {
  bannerImageUpload,
  optimizeImage,
  createThumbnails,
  handleUploadError,
  deleteUploadedFiles,
  getFileUrl,
} = require("../middleware/imageUpload");
const { Banner } = require("../models");

const router = express.Router();

// @route   GET /api/admin/banners
// @desc    Get all banners with pagination
// @access  Private (Admin)
router.get("/", adminAuth, logAdminAction("VIEW_BANNERS"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const position = req.query.position;
    const isActive = req.query.isActive;

    const query = {};
    if (position) query.position = position;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const banners = await Banner.find(query)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ position: 1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Banner.countDocuments(query);

    res.json({
      success: true,
      data: {
        banners,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching banners",
    });
  }
});

// @route   GET /api/admin/banners/:id
// @desc    Get single banner
// @access  Private (Admin)
router.get(
  "/:id",
  adminAuth,
  logAdminAction("VIEW_BANNER"),
  async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      res.json({
        success: true,
        data: { banner },
      });
    } catch (error) {
      console.error("Get banner error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching banner",
      });
    }
  },
);

// @route   POST /api/admin/banners
// @desc    Create new banner
// @access  Private (Admin)
router.post(
  "/",
  adminAuth,
  bannerImageUpload.single("image"),
  optimizeImage,
  createThumbnails,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("position")
      .isIn(["hero", "top", "middle", "bottom", "sidebar"])
      .withMessage("Invalid position"),
    body("displayOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order must be a non-negative integer"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
  ],
  logAdminAction("CREATE_BANNER"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          deleteUploadedFiles([req.file]);
        }
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Banner image is required",
        });
      }

      const {
        title,
        subtitle,
        description,
        position,
        displayOrder,
        isActive,
        startDate,
        endDate,
        linkUrl,
        linkText,
        linkOpenInNewTab,
        backgroundColor,
        textColor,
        overlayOpacity,
        textAlignment,
        animation,
        autoPlay,
        duration,
      } = req.body;

      // Process uploaded image
      const imageData = {
        url: getFileUrl(req.file),
        alt: title,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        thumbnail: req.file.thumbnail
          ? {
              url: req.file.thumbnail.url,
              filename: req.file.thumbnail.filename,
            }
          : undefined,
      };

      const banner = new Banner({
        title,
        subtitle,
        description,
        image: imageData,
        link: {
          url: linkUrl,
          text: linkText,
          openInNewTab: linkOpenInNewTab === "true",
        },
        position,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: isActive !== "false",
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        settings: {
          backgroundColor: backgroundColor || "#ffffff",
          textColor: textColor || "#000000",
          overlayOpacity: overlayOpacity ? parseFloat(overlayOpacity) : 0.3,
          textAlignment: textAlignment || "center",
          animation: animation || "none",
          autoPlay: autoPlay === "true",
          duration: duration ? parseInt(duration) : 5000,
        },
        createdBy: req.user._id,
      });

      await banner.save();

      const populatedBanner = await Banner.findById(banner._id).populate(
        "createdBy",
        "name email",
      );

      res.status(201).json({
        success: true,
        message: "Banner created successfully",
        data: { banner: populatedBanner },
      });
    } catch (error) {
      console.error("Create banner error:", error);

      if (req.file) {
        deleteUploadedFiles([req.file]);
      }

      res.status(500).json({
        success: false,
        message: "Error creating banner",
      });
    }
  },
);

// @route   PUT /api/admin/banners/:id
// @desc    Update banner
// @access  Private (Admin)
router.put(
  "/:id",
  adminAuth,
  bannerImageUpload.single("image"),
  optimizeImage,
  createThumbnails,
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("position")
      .optional()
      .isIn(["hero", "top", "middle", "bottom", "sidebar"])
      .withMessage("Invalid position"),
    body("displayOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order must be a non-negative integer"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
  ],
  logAdminAction("UPDATE_BANNER"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          deleteUploadedFiles([req.file]);
        }
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        if (req.file) {
          deleteUploadedFiles([req.file]);
        }
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      const {
        title,
        subtitle,
        description,
        position,
        displayOrder,
        isActive,
        startDate,
        endDate,
        linkUrl,
        linkText,
        linkOpenInNewTab,
        backgroundColor,
        textColor,
        overlayOpacity,
        textAlignment,
        animation,
        autoPlay,
        duration,
      } = req.body;

      // Update basic fields
      if (title !== undefined) banner.title = title;
      if (subtitle !== undefined) banner.subtitle = subtitle;
      if (description !== undefined) banner.description = description;
      if (position !== undefined) banner.position = position;
      if (displayOrder !== undefined)
        banner.displayOrder = parseInt(displayOrder);
      if (isActive !== undefined) banner.isActive = isActive !== "false";
      if (startDate !== undefined)
        banner.startDate = startDate ? new Date(startDate) : undefined;
      if (endDate !== undefined)
        banner.endDate = endDate ? new Date(endDate) : undefined;

      // Update link
      if (linkUrl !== undefined) banner.link.url = linkUrl;
      if (linkText !== undefined) banner.link.text = linkText;
      if (linkOpenInNewTab !== undefined)
        banner.link.openInNewTab = linkOpenInNewTab === "true";

      // Update settings
      if (backgroundColor !== undefined)
        banner.settings.backgroundColor = backgroundColor;
      if (textColor !== undefined) banner.settings.textColor = textColor;
      if (overlayOpacity !== undefined)
        banner.settings.overlayOpacity = parseFloat(overlayOpacity);
      if (textAlignment !== undefined)
        banner.settings.textAlignment = textAlignment;
      if (animation !== undefined) banner.settings.animation = animation;
      if (autoPlay !== undefined)
        banner.settings.autoPlay = autoPlay === "true";
      if (duration !== undefined) banner.settings.duration = parseInt(duration);

      // Update image if new one uploaded
      if (req.file) {
        // Delete old image file if it exists
        if (banner.image.filename) {
          deleteUploadedFiles([
            {
              path: path.join(
                __dirname,
                "../../uploads/banners",
                banner.image.filename,
              ),
              thumbnail: banner.image.thumbnail,
            },
          ]);
        }

        banner.image = {
          url: getFileUrl(req.file),
          alt: title || banner.title,
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          thumbnail: req.file.thumbnail
            ? {
                url: req.file.thumbnail.url,
                filename: req.file.thumbnail.filename,
              }
            : undefined,
        };
      }

      banner.updatedBy = req.user._id;
      await banner.save();

      const populatedBanner = await Banner.findById(banner._id)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");

      res.json({
        success: true,
        message: "Banner updated successfully",
        data: { banner: populatedBanner },
      });
    } catch (error) {
      console.error("Update banner error:", error);

      if (req.file) {
        deleteUploadedFiles([req.file]);
      }

      res.status(500).json({
        success: false,
        message: "Error updating banner",
      });
    }
  },
);

// @route   DELETE /api/admin/banners/:id
// @desc    Delete banner
// @access  Private (Admin)
router.delete(
  "/:id",
  adminAuth,
  logAdminAction("DELETE_BANNER"),
  async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      // Delete image file if it exists
      if (banner.image.filename) {
        deleteUploadedFiles([
          {
            path: path.join(
              __dirname,
              "../../uploads/banners",
              banner.image.filename,
            ),
            thumbnail: banner.image.thumbnail,
          },
        ]);
      }

      await Banner.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Banner deleted successfully",
      });
    } catch (error) {
      console.error("Delete banner error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting banner",
      });
    }
  },
);

// @route   PUT /api/admin/banners/:id/toggle
// @desc    Toggle banner active status
// @access  Private (Admin)
router.put(
  "/:id/toggle",
  adminAuth,
  logAdminAction("TOGGLE_BANNER"),
  async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      banner.isActive = !banner.isActive;
      banner.updatedBy = req.user._id;
      await banner.save();

      const populatedBanner = await Banner.findById(banner._id)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");

      res.json({
        success: true,
        message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
        data: { banner: populatedBanner },
      });
    } catch (error) {
      console.error("Toggle banner error:", error);
      res.status(500).json({
        success: false,
        message: "Error toggling banner status",
      });
    }
  },
);

// @route   PUT /api/admin/banners/reorder
// @desc    Reorder banners
// @access  Private (Admin)
router.put(
  "/reorder",
  [
    adminAuth,
    body("banners").isArray().withMessage("Banners must be an array"),
    body("banners.*.id").notEmpty().withMessage("Banner ID is required"),
    body("banners.*.displayOrder")
      .isInt({ min: 0 })
      .withMessage("Display order must be a non-negative integer"),
  ],
  logAdminAction("REORDER_BANNERS"),
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

      const { banners } = req.body;

      // Update display order for each banner
      const updatePromises = banners.map(({ id, displayOrder }) =>
        Banner.findByIdAndUpdate(id, {
          displayOrder,
          updatedBy: req.user._id,
        }),
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Banners reordered successfully",
      });
    } catch (error) {
      console.error("Reorder banners error:", error);
      res.status(500).json({
        success: false,
        message: "Error reordering banners",
      });
    }
  },
);

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
