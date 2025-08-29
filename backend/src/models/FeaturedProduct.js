const mongoose = require("mongoose");

const featuredProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      alt: {
        type: String,
        default: function () {
          return this.name;
        },
      },
      publicId: {
        type: String, // For Cloudinary or other cloud storage
      },
    },
    emoji: {
      type: String,
      default: "🌶️",
      maxlength: [10, "Emoji cannot exceed 10 characters"],
    },
    backgroundColor: {
      type: String,
      default: "from-red-100 via-red-200 to-red-300",
      trim: true,
    },
    position: {
      type: String,
      enum: [
        "hero-main-1",
        "hero-main-2",
        "hero-bottom-1",
        "hero-bottom-2",
        "hero-bottom-3",
      ],
      required: [true, "Position is required"],
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    animation: {
      type: String,
      enum: ["bounce", "pulse", "spin", "ping", "none"],
      default: "bounce",
    },
    rotation: {
      type: String,
      enum: [
        "rotate-1",
        "rotate-2",
        "rotate-3",
        "-rotate-1",
        "-rotate-2",
        "-rotate-3",
        "rotate-0",
      ],
      default: "rotate-1",
    },
    hoverRotation: {
      type: String,
      enum: [
        "rotate-0",
        "rotate-1",
        "rotate-2",
        "rotate-3",
        "-rotate-1",
        "-rotate-2",
        "-rotate-3",
      ],
      default: "rotate-0",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
featuredProductSchema.index({ position: 1 });
featuredProductSchema.index({ isActive: 1 });
featuredProductSchema.index({ displayOrder: 1 });
featuredProductSchema.index({ createdAt: -1 });

// Virtual for discount percentage
featuredProductSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  }
  return 0;
});

// Virtual for formatted price
featuredProductSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price}`;
});

// Virtual for formatted original price
featuredProductSchema.virtual("formattedOriginalPrice").get(function () {
  return this.originalPrice ? `₹${this.originalPrice}` : null;
});

// Ensure virtual fields are serialized
featuredProductSchema.set("toJSON", { virtuals: true });
featuredProductSchema.set("toObject", { virtuals: true });

// Pre-save middleware to set display order based on position
featuredProductSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("position")) {
    const positionOrder = {
      "hero-main-1": 1,
      "hero-main-2": 2,
      "hero-bottom-1": 3,
      "hero-bottom-2": 4,
      "hero-bottom-3": 5,
    };
    this.displayOrder = positionOrder[this.position] || 0;
  }
  next();
});

// Static method to get products by position
featuredProductSchema.statics.getByPosition = function (position) {
  return this.findOne({ position, isActive: true });
};

// Static method to get all active products ordered by display order
featuredProductSchema.statics.getActiveProducts = function () {
  return this.find({ isActive: true }).sort({ displayOrder: 1 });
};

// Static method to get products for homepage
featuredProductSchema.statics.getHomepageProducts = function () {
  return this.find({ isActive: true })
    .sort({ displayOrder: 1 })
    .select(
      "name price originalPrice image emoji backgroundColor position animation rotation hoverRotation",
    );
};

// Instance method to toggle active status
featuredProductSchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.save();
};

// Instance method to update position
featuredProductSchema.methods.updatePosition = function (newPosition) {
  this.position = newPosition;
  return this.save();
};

module.exports = mongoose.model("FeaturedProduct", featuredProductSchema);
