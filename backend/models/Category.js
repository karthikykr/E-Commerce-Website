const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      name: {
        type: String,
      },
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
