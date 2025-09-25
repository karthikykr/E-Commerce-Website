const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    imageURL: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['jpeg', 'png', 'pdf', 'unknown'],
      required: true,
    },
    publicId: {
      type: String,
    },
    assetType: {
      type: String,
      enum: ['product_image'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asset', assetSchema);
