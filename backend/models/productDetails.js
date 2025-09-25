const mongoose = require('mongoose');

const productInfoSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      // required: true,
      unique: true,
    },
    weight: {
      type: String,
      // required: true,
    },
    size: {
      type: String,
    },
    shelfLife: {
      type: String,
    },
    ingredients: {
      type: [String],
    },
    nutritionalInfo: {
      calories: { type: Number }, // in kcal
      protein: { type: Number }, // in g
      fat: { type: Number }, // in g
      carbohydrates: { type: Number }, // in g
      fiber: { type: Number }, // in g
      sugar: { type: Number }, // in g
      sodium: { type: Number }, // in mg
    },
    storageInstructions: {
      type: String,
    },
    usageInstructions: {
      type: String, // e.g. "Best consumed within 7 days after opening"
    },
    certifications: {
      type: [String], // e.g. ["USDA Organic", "FSSAI Approved"]
    },
    countryOfOrigin: {
      type: String, // e.g. "India"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductInfo', productInfoSchema);
