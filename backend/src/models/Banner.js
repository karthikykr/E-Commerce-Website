const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    filename: {
      type: String,
      trim: true
    },
    originalName: {
      type: String,
      trim: true
    },
    mimeType: {
      type: String,
      trim: true
    },
    size: {
      type: Number,
      min: 0
    },
    thumbnail: {
      url: String,
      filename: String
    }
  },
  link: {
    url: {
      type: String,
      trim: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: [50, 'Link text cannot exceed 50 characters']
    },
    openInNewTab: {
      type: Boolean,
      default: false
    }
  },
  position: {
    type: String,
    enum: ['hero', 'top', 'middle', 'bottom', 'sidebar'],
    default: 'hero'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  settings: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    textColor: {
      type: String,
      default: '#000000'
    },
    overlayOpacity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.3
    },
    textAlignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'center'
    },
    animation: {
      type: String,
      enum: ['none', 'fade', 'slide', 'zoom'],
      default: 'none'
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 5000 // milliseconds
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date
    },
    lastClicked: {
      type: Date
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
bannerSchema.index({ position: 1, isActive: 1, displayOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });
bannerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for checking if banner is currently active
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const isWithinDateRange = (!this.startDate || this.startDate <= now) && 
                           (!this.endDate || this.endDate >= now);
  return this.isActive && isWithinDateRange;
});

// Instance method to increment view count
bannerSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Instance method to increment click count
bannerSchema.methods.incrementClicks = function() {
  this.analytics.clicks += 1;
  this.analytics.lastClicked = new Date();
  return this.save();
};

// Static method to get active banners by position
bannerSchema.statics.getActiveByPosition = function(position) {
  const now = new Date();
  return this.find({
    position,
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } }
    ],
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ]
  })
  .sort({ displayOrder: 1, createdAt: -1 })
  .populate('createdBy', 'name email')
  .populate('updatedBy', 'name email');
};

// Static method to get all active banners
bannerSchema.statics.getAllActive = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } }
    ],
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ]
  })
  .sort({ position: 1, displayOrder: 1, createdAt: -1 })
  .populate('createdBy', 'name email')
  .populate('updatedBy', 'name email');
};

// Pre-save middleware to update updatedBy
bannerSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.createdBy; // Will be overridden by the route handler
  }
  next();
});

module.exports = mongoose.model('Banner', bannerSchema);
