const slugify = require('slugify');
const { withTransaction } = require('../helpers/transaction');
const { deleteImage } = require('../config/cloudinaryConfig');
const Product = require('../models/products');
const ProductInfo = require('../models/productDetails');

const {
  createAssetsHandler,
  getAssetsByEntity,
} = require('./assetscontroller');

// Add product
exports.addProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    discount,
    weight,
    numberOfUnits,
    category,
    stock,
    status,
    productInfo,
  } = req.body;

  const userId = req.user.id;

  try {
    await withTransaction(async (session) => {
      // 1. Check if product already exists
      const existingProduct = await Product.findOne(
        { name: { $regex: new RegExp('^' + name + '$', 'i') } },
        null,
        { session }
      );

      if (existingProduct) {
        // throw an error to rollback transaction
        const error = new Error(`Product with name "${name}" already exists`);
        error.statusCode = 400;
        throw error;
      }

      // 2. Generate slug
      const slug = slugify(name, { lower: true, strict: true, trim: true });

      // 3. Save product
      const newProduct = new Product({
        name,
        slug,
        description,
        price,
        discount,
        weight,
        numberOfUnits,
        category,
        stock,
        status,
        userId: userId,
      });

      const savedProduct = await newProduct.save({ session });

      // 4. Handle product images
      if (req.files?.productImage?.length > 0) {
        await createAssetsHandler({
          files: req.files.productImage,
          entityId: savedProduct._id,
          assetType: 'product_image',
          session,
        });
      }

      // 5. Save product details
      if (productInfo && typeof productInfo === 'object') {
        await new ProductInfo({
          productId: savedProduct._id,
          weight: productInfo.weight,
          size: productInfo.size,
          shelfLife: productInfo.shelfLife,
          ingredients: productInfo.ingredients,
          nutritionalInfo: productInfo.nutritionalInfo,
          storageInstructions: productInfo.storageInstructions,
          usageInstructions: productInfo.usageInstructions,
          certifications: productInfo.certifications,
          countryOfOrigin: productInfo.countryOfOrigin,
        }).save({ session });
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
    });
  } catch (error) {
    console.error('Error adding product:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};
