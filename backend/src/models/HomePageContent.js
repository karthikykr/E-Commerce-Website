const mongoose = require("mongoose");

// Schema for individual content sections
const contentSectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "hero_banner",
      "featured_products",
      "special_offers",
      "categories",
      "about_us",
      "why_choose_us",
      "newsletter",
      "testimonials",
      "custom_html",
    ],
    required: true,
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, "Subtitle cannot exceed 300 characters"],
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Flexible content structure
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  settings: {
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    textColor: {
      type: String,
      default: "#000000",
    },
    padding: {
      top: { type: Number, default: 0 },
      bottom: { type: Number, default: 0 },
      left: { type: Number, default: 0 },
      right: { type: Number, default: 0 },
    },
    margin: {
      top: { type: Number, default: 0 },
      bottom: { type: Number, default: 0 },
    },
    customCSS: {
      type: String,
      trim: true,
    },
  },
});

// Main home page content schema
const homePageContentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sections: [contentSectionSchema],
    globalSettings: {
      theme: {
        type: String,
        enum: ["default", "modern", "classic", "minimal"],
        default: "default",
      },
      primaryColor: {
        type: String,
        default: "#ea580c", // Orange-600
      },
      secondaryColor: {
        type: String,
        default: "#f97316", // Orange-500
      },
      fontFamily: {
        type: String,
        default: "Inter, sans-serif",
      },
      customCSS: {
        type: String,
        trim: true,
      },
    },
    seoSettings: {
      title: {
        type: String,
        trim: true,
        maxlength: [60, "SEO title cannot exceed 60 characters"],
      },
      description: {
        type: String,
        trim: true,
        maxlength: [160, "SEO description cannot exceed 160 characters"],
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
      ogImage: {
        type: String,
        trim: true,
      },
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
homePageContentSchema.index({ name: 1 });
homePageContentSchema.index({ isActive: 1 });
homePageContentSchema.index({ "sections.type": 1 });
homePageContentSchema.index({ "sections.displayOrder": 1 });

// Pre-save middleware to update lastModified
homePageContentSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

// Instance method to get active sections ordered by displayOrder
homePageContentSchema.methods.getActiveSections = function () {
  return this.sections
    .filter((section) => section.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

// Instance method to add section
homePageContentSchema.methods.addSection = function (sectionData) {
  // Set display order to be last
  const maxOrder = Math.max(...this.sections.map((s) => s.displayOrder), -1);
  sectionData.displayOrder = maxOrder + 1;

  this.sections.push(sectionData);
  return this.save();
};

// Instance method to update section
homePageContentSchema.methods.updateSection = function (sectionId, updateData) {
  const section = this.sections.id(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }

  Object.assign(section, updateData);
  return this.save();
};

// Instance method to remove section
homePageContentSchema.methods.removeSection = function (sectionId) {
  const section = this.sections.id(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }

  section.remove();
  return this.save();
};

// Instance method to reorder sections
homePageContentSchema.methods.reorderSections = function (sectionOrders) {
  sectionOrders.forEach(({ sectionId, displayOrder }) => {
    const section = this.sections.id(sectionId);
    if (section) {
      section.displayOrder = displayOrder;
    }
  });

  return this.save();
};

// Static method to get active home page content
homePageContentSchema.statics.getActiveContent = function () {
  return this.findOne({ isActive: true }).populate("modifiedBy", "name email");
};

// Static method to create default content
homePageContentSchema.statics.createDefaultContent = function () {
  const defaultSections = [
    {
      type: "hero_banner",
      title: "Authentic. Pure. Homemade",
      subtitle:
        "Indulge in elegant homemade food products, made with the finest ingredients and traditional recipes.",
      displayOrder: 0,
      isActive: true,
      content: {
        buttonText: "Shop Now",
        buttonLink: "/products",
        backgroundImage: "",
        showFeaturedProducts: true,
      },
    },
    {
      type: "about_us",
      title: "Thank You for Trusting Us",
      subtitle:
        "We dedicate ourselves to purity, authenticity, and traditional methods.",
      displayOrder: 1,
      isActive: true,
      content: {
        description:
          "We dedicate ourselves to purity, authenticity, and traditional methods in creating homemade food products. Our commitment to traditional recipes and homemade goodness ensures every product carries the essence of home-cooked meals.",
        stats: [
          { label: "Premium Products", value: "100+" },
          { label: "Happy Customers", value: "5000+" },
        ],
      },
    },
    {
      type: "special_offers",
      title: "🔥 Special Offers",
      subtitle: "Limited time deals on premium spices",
      displayOrder: 2,
      isActive: true,
      content: {
        showDiscountedProducts: true,
        maxProducts: 4,
      },
    },
    {
      type: "featured_products",
      title: "Demanded Products",
      subtitle:
        "Handpicked favorites that our customers love most - premium quality spices and seasonings",
      displayOrder: 3,
      isActive: true,
      content: {
        maxProducts: 8,
        showFeaturedOnly: true,
      },
    },
    {
      type: "categories",
      title: "Popular Categories",
      subtitle:
        "Explore our carefully curated categories of premium spices and seasonings",
      displayOrder: 4,
      isActive: true,
      content: {
        maxCategories: 4,
        showIcons: true,
      },
    },
    {
      type: "why_choose_us",
      title: "Why Choose Gruhapaaka?",
      subtitle:
        "We're committed to bringing you the finest homemade food products with unmatched quality and traditional taste",
      displayOrder: 5,
      isActive: true,
      content: {
        features: [
          {
            icon: "🏠",
            title: "Homemade Quality",
            description:
              "Made with love in home kitchens using traditional recipes and the finest ingredients.",
          },
          {
            icon: "🚚",
            title: "Fast Delivery",
            description:
              "Free shipping on orders over $50. Get your homemade delicacies delivered fresh to your doorstep.",
          },
          {
            icon: "🔒",
            title: "Quality Guarantee",
            description:
              "100% satisfaction guarantee. If you're not happy, we'll make it right.",
          },
        ],
      },
    },
    {
      type: "newsletter",
      title: "Stay Updated with Gruhapaaka",
      subtitle:
        "Get the latest updates on new homemade products, special offers, and traditional recipes delivered to your inbox.",
      displayOrder: 6,
      isActive: true,
      content: {
        placeholder: "Enter your email",
        buttonText: "Subscribe",
        backgroundColor: "#ea580c",
      },
    },
  ];

  return this.create({
    name: "default",
    isActive: true,
    sections: defaultSections,
  });
};

module.exports = mongoose.model("HomePageContent", homePageContentSchema);
