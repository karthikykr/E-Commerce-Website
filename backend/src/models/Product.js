const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Review comment cannot exceed 500 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
        filename: {
          type: String,
          trim: true,
        },
        originalName: {
          type: String,
          trim: true,
        },
        mimeType: {
          type: String,
          trim: true,
        },
        size: {
          type: Number,
          min: 0,
        },
        thumbnail: {
          url: String,
          filename: String,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        publicId: {
          type: String, // For cloud storage like Cloudinary
        },
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    weight: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
        enum: ["g", "kg", "oz", "lb"],
        default: "g",
      },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ["cm", "in"],
        default: "cm",
      },
    },
    origin: {
      type: String,
      trim: true,
      maxlength: [100, "Origin cannot exceed 100 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      fat: Number,
      fiber: Number,
      sodium: Number,
    },
    allergens: [
      {
        type: String,
        trim: true,
      },
    ],
    storageInstructions: {
      type: String,
      trim: true,
      maxlength: [300, "Storage instructions cannot exceed 300 characters"],
    },
    shelfLife: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [60, "SEO title cannot exceed 60 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Create slug from name before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Update stock status based on quantity
productSchema.pre("save", function (next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Calculate average rating when reviews change
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
    return;
  }

  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );
  this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.reviewCount = this.reviews.length;
};

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  }
  return 0;
});

// Virtual for low stock status
productSchema.virtual("isLowStock").get(function () {
  return this.stockQuantity <= this.lowStockThreshold && this.stockQuantity > 0;
});

// Ensure virtual fields are serialized
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Instance method to get primary image
productSchema.methods.getPrimaryImage = function () {
  const primaryImage = this.images.find((img) => img.isPrimary);
  return primaryImage || this.images[0] || null;
};

// Instance method to add image
productSchema.methods.addImage = function (imageData) {
  // If this is the first image, make it primary
  if (this.images.length === 0) {
    imageData.isPrimary = true;
  }
  this.images.push(imageData);
  return this.save();
};

// Instance method to remove image
productSchema.methods.removeImage = function (imageId) {
  const imageIndex = this.images.findIndex(
    (img) => img._id.toString() === imageId,
  );
  if (imageIndex === -1) {
    throw new Error("Image not found");
  }

  const removedImage = this.images[imageIndex];
  this.images.splice(imageIndex, 1);

  // If removed image was primary and there are other images, make the first one primary
  if (removedImage.isPrimary && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }

  return this.save();
};

// Instance method to set primary image
productSchema.methods.setPrimaryImage = function (imageId) {
  // Remove primary flag from all images
  this.images.forEach((img) => {
    img.isPrimary = false;
  });

  // Set the specified image as primary
  const targetImage = this.images.find((img) => img._id.toString() === imageId);
  if (!targetImage) {
    throw new Error("Image not found");
  }

  targetImage.isPrimary = true;
  return this.save();
};

// Instance method to get all image URLs
productSchema.methods.getImageUrls = function () {
  return this.images.map((img) => ({
    id: img._id,
    url: img.url,
    thumbnail: img.thumbnail?.url,
    alt: img.alt,
    isPrimary: img.isPrimary,
  }));
};

// Static method to find products with missing images
productSchema.statics.findProductsWithoutImages = function () {
  return this.find({
    $or: [{ images: { $size: 0 } }, { images: { $exists: false } }],
  });
};

// Indexes for better performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
// slug already has unique index

module.exports = mongoose.model("Product", productSchema);
