const express = require("express");
const { HomePageContent, Product, Category } = require("../models");

const router = express.Router();

// @route   GET /api/homepage-content
// @desc    Get home page content for public display
// @access  Public
router.get("/", async (req, res) => {
  try {
    let content = await HomePageContent.getActiveContent();

    // Create default content if none exists
    if (!content) {
      content = await HomePageContent.createDefaultContent();
    }

    // Get active sections
    const activeSections = content.getActiveSections();

    // Prepare response data
    const responseData = {
      globalSettings: content.globalSettings,
      seoSettings: content.seoSettings,
      sections: [],
    };

    // Process each section and fetch related data
    for (const section of activeSections) {
      const sectionData = {
        id: section._id,
        type: section.type,
        title: section.title,
        subtitle: section.subtitle,
        content: section.content,
        settings: section.settings,
      };

      // Fetch dynamic content based on section type
      switch (section.type) {
        case "featured_products":
          if (section.content.showFeaturedOnly) {
            const featuredProducts = await Product.find({
              isFeatured: true,
              isActive: true,
              inStock: true,
            })
              .populate("category", "name slug")
              .limit(section.content.maxProducts || 8)
              .sort({ createdAt: -1 });

            sectionData.products = featuredProducts;
          }
          break;

        case "special_offers":
          if (section.content.showDiscountedProducts) {
            const discountedProducts = await Product.find({
              isActive: true,
              inStock: true,
              originalPrice: { $exists: true, $gt: 0 },
              $expr: { $lt: ["$price", "$originalPrice"] },
            })
              .populate("category", "name slug")
              .limit(section.content.maxProducts || 4)
              .sort({ createdAt: -1 });

            sectionData.products = discountedProducts;
          }
          break;

        case "categories":
          const categories = await Category.find({ isActive: true })
            .limit(section.content.maxCategories || 4)
            .sort({ displayOrder: 1, name: 1 });

          sectionData.categories = categories;
          break;

        default:
          // For other section types, just use the stored content
          break;
      }

      responseData.sections.push(sectionData);
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get homepage content error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching homepage content",
    });
  }
});

// @route   GET /api/homepage-content/section/:type
// @desc    Get specific section data
// @access  Public
router.get("/section/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const content = await HomePageContent.getActiveContent();
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Homepage content not found",
      });
    }

    const section = content.sections.find((s) => s.type === type && s.isActive);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const sectionData = {
      id: section._id,
      type: section.type,
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      settings: section.settings,
    };

    // Fetch dynamic content based on section type
    switch (type) {
      case "featured_products":
        if (section.content.showFeaturedOnly) {
          const featuredProducts = await Product.find({
            isFeatured: true,
            isActive: true,
            inStock: true,
          })
            .populate("category", "name slug")
            .limit(section.content.maxProducts || 8)
            .sort({ createdAt: -1 });

          sectionData.products = featuredProducts;
        }
        break;

      case "special_offers":
        if (section.content.showDiscountedProducts) {
          const discountedProducts = await Product.find({
            isActive: true,
            inStock: true,
            originalPrice: { $exists: true, $gt: 0 },
            $expr: { $lt: ["$price", "$originalPrice"] },
          })
            .populate("category", "name slug")
            .limit(section.content.maxProducts || 4)
            .sort({ createdAt: -1 });

          sectionData.products = discountedProducts;
        }
        break;

      case "categories":
        const categories = await Category.find({ isActive: true })
          .limit(section.content.maxCategories || 4)
          .sort({ displayOrder: 1, name: 1 });

        sectionData.categories = categories;
        break;
    }

    res.json({
      success: true,
      data: sectionData,
    });
  } catch (error) {
    console.error("Get section data error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching section data",
    });
  }
});

// @route   GET /api/homepage-content/preview
// @desc    Get home page content preview (for admin)
// @access  Public (but intended for admin preview)
router.get("/preview", async (req, res) => {
  try {
    const { contentId } = req.query;

    let content;
    if (contentId) {
      content = await HomePageContent.findById(contentId);
    } else {
      content = await HomePageContent.getActiveContent();
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Get all sections (including inactive ones for preview)
    const allSections = content.sections.sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    const responseData = {
      globalSettings: content.globalSettings,
      seoSettings: content.seoSettings,
      sections: [],
    };

    // Process each section
    for (const section of allSections) {
      const sectionData = {
        id: section._id,
        type: section.type,
        title: section.title,
        subtitle: section.subtitle,
        content: section.content,
        settings: section.settings,
        isActive: section.isActive,
        displayOrder: section.displayOrder,
      };

      // Add sample data for preview
      switch (section.type) {
        case "featured_products":
          const sampleProducts = await Product.find({ isActive: true })
            .populate("category", "name slug")
            .limit(4)
            .sort({ createdAt: -1 });
          sectionData.products = sampleProducts;
          break;

        case "categories":
          const sampleCategories = await Category.find({ isActive: true })
            .limit(3)
            .sort({ name: 1 });
          sectionData.categories = sampleCategories;
          break;
      }

      responseData.sections.push(sectionData);
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get preview content error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching preview content",
    });
  }
});

module.exports = router;
