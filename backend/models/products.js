const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: { type: Number, min: 0 },

    weight: {
      value: {
        type: Number,
        // required: true,
      }, // e.g. 500
      unit: {
        type: String,
        // required: true,
        trim: true,
      }, // e.g. "g", "kg", "ml", "L"
    },

    numberOfUnits: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      // required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // variants: [
    //   {
    //     name: { type: String, required: true },
    //     value: { type: String, required: true },
    //     additionalPrice: { type: Number, default: 0 },
    //     stock: { type: Number, default: 0 },
    //     weight: { type: Number }, // Variant-specific weight
    //     unitOfSelling: { type: String }, // Variant-specific unit
    //     numberOfUnits: { type: Number }, // Variant-specific count
    //   },
    // ],
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
