const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // 0 means no limit
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    maxUsage: {
      type: Number,
      required: true,
      min: 1,
    },
    maxUsagePerUser: {
      type: Number,
      default: 1,
      min: 0, // 0 means no limit per user
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderAmount: {
          type: Number,
          required: true,
        },
        discountAmount: {
          type: Number,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ], // If empty, applies to all categories
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ], // If empty, applies to all products
    userTypes: [
      {
        type: String,
        enum: ['new', 'existing', 'premium'],
      },
    ], // If empty, applies to all users
    metadata: {
      campaignName: String,
      source: String,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance (code already has unique index)
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ createdBy: 1 });

// Virtual for checking if coupon is currently valid
couponSchema.virtual('isCurrentlyValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    this.usageCount < this.maxUsage
  );
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUse = function (userId) {
  if (!this.isCurrentlyValid) return false;

  if (this.maxUsagePerUser === 0) return true; // No per-user limit

  const userUsageCount = this.usedBy.filter(
    (usage) => usage.user.toString() === userId.toString()
  ).length;

  return userUsageCount < this.maxUsagePerUser;
};

// Method to calculate discount for given amount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (orderAmount < this.minOrderAmount) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount > 0) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else {
    discount = this.discountValue;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Pre-save middleware to validate dates
couponSchema.pre('save', function (next) {
  if (this.validFrom >= this.validUntil) {
    next(new Error('Valid from date must be before valid until date'));
  }

  if (this.discountType === 'percentage' && this.discountValue > 100) {
    next(new Error('Percentage discount cannot exceed 100%'));
  }

  next();
});

// Static method to find valid coupons for user
couponSchema.statics.findValidForUser = function (userId, orderAmount = 0) {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    usageCount: { $lt: '$maxUsage' },
    minOrderAmount: { $lte: orderAmount },
  }).then((coupons) => {
    return coupons.filter((coupon) => coupon.canUserUse(userId));
  });
};

module.exports = mongoose.model('Coupon', couponSchema);
