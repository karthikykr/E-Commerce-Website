const slugify = require('slugify');
const { withTransaction } = require('../helpers/transaction');
const Product = require('../models/products');
const ProductInfo = require('../models/productDetails');

const {
  createAssetsHandler,
  getAssetsByEntity,
  deleteAsset,
} = require('./assetscontroller');

// Add product
exports.addProduct = async (req, res) => {
  try {
    // First, parse the wrapped 'data' from frontend (as discussed previously)
    let bodyData = req.body;
    if (req.body.data) {
      try {
        bodyData = JSON.parse(req.body.data);
      } catch {
        const error = new Error('Invalid data format');
        error.statusCode = 400;
        throw error;
      }
    }

    // Destructure other fields from bodyData
    const {
      description,
      price,
      discount,
      weight,
      numberOfUnits,
      category,
      stock,
      status,
      productInfo,
    } = bodyData;

    // Extract and validate name separately (your suggested approach)
    const productName = bodyData.name ? bodyData.name.trim() : null; // Store in a new variable, trim whitespace

    if (typeof productName !== 'string' || !productName) {
      const error = new Error(
        'Product name is required and must be a valid string'
      );
      error.statusCode = 400;
      throw error;
    }

    // Now generate slug using the validated productName variable
    const slug = slugify(productName, {
      lower: true,
      strict: true,
      trim: true,
    });

    const userId = req.user.id;

    await withTransaction(async (session) => {
      // 1. Check if product already exists (use productName here)
      const existingProduct = await Product.findOne(
        { name: { $regex: new RegExp('^' + productName + '$', 'i') } },
        null,
        { session }
      );

      if (existingProduct) {
        const error = new Error(
          `Product with name "${productName}" already exists`
        );
        error.statusCode = 400;
        throw error;
      }

      // 2. Save product (use productName and slug)
      const newProduct = new Product({
        name: productName, // Use the validated variable
        slug,
        description,
        price,
        discount,
        weight,
        numberOfUnits,
        category,
        stock,
        status,
        userId,
      });

      const savedProduct = await newProduct.save({ session });

      // 3. Handle product images (unchanged)
      if (req.files?.productImage?.length > 0) {
        await createAssetsHandler({
          files: req.files.productImage,
          entityId: savedProduct._id,
          assetType: 'product_image',
          session,
        });
      }

      // 4. Save product details (unchanged)
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

// Update Controller
exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

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

  await withTransaction(async (session) => {
    // Check if product exists
    const existingProduct = await Product.findById(productId).session(session);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check duplicate name if name is being updated
    if (name && name.toLowerCase() !== existingProduct.name.toLowerCase()) {
      const duplicate = await Product.findOne({
        name: { $regex: new RegExp('^' + name + '$', 'i') },
        _id: { $ne: productId },
      }).session(session);

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Product with name "${name}" already exists`,
        });
      }
    }

    let slug;
    if (name) {
      slug = slugify(name, { lower: true, strict: true, trim: true });
    }

    // Update main product
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
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
          userId,
        },
      },
      { session }
    );

    // Append new product images
    if (req.files?.productImage?.length > 0) {
      await createAssetsHandler({
        files: req.files.productImage,
        entityId: productId,
        assetType: 'product_image',
        session,
      });
    }

    // Update or create productInfo
    if (productInfo && typeof productInfo === 'object') {
      const existingInfo = await ProductInfo.findOne({ productId }).session(
        session
      );

      if (existingInfo) {
        await ProductInfo.updateOne(
          { productId },
          { $set: productInfo },
          { session }
        );
      } else {
        await ProductInfo.create([{ productId, ...productInfo }], { session });
      }
    }

    res
      .status(200)
      .json({ success: true, message: 'Product updated successfully' });
  });
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch product
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 2. Fetch product info
    const productInfo = await ProductInfo.findOne({ productId: id }).lean();

    // 3. Fetch product images (assets)
    const productImages = await getAssetsByEntity(id, 'product_image');

    return res.status(200).json({
      success: true,
      product,
      productInfo: productInfo || {},
      images: productImages || [],
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

// Get products by filter (products + images only)
exports.getProductsByFilter = async (req, res) => {
  try {
    const {
      category,
      status,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // 1. Build filter dynamically
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = Number(minRating);
      if (maxRating) filter.rating.$lte = Number(maxRating);
    }

    // Multi-word search (OR across all words and fields)
    if (search) {
      const words = search.split(/\s+/).filter(Boolean);
      filter.$or = [];

      words.forEach((word) => {
        filter.$or.push(
          { name: { $regex: word, $options: 'i' } },
          { description: { $regex: word, $options: 'i' } }
        );
      });
    }

    // Pagination calculation
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const skip = (pageNumber - 1) * pageSize;

    // 2. Get total count for pagination metadata
    const totalProducts = await Product.countDocuments(filter);

    // 3. Get paginated products (lean for performance)
    const products = await Product.find(filter)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // 4. Attach images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await getAssetsByEntity(product._id, 'product_image');
        return {
          ...product,
          images: images || [],
        };
      })
    );

    return res.status(200).json({
      success: true,
      pagination: {
        total: totalProducts,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalProducts / pageSize),
      },
      product: productsWithImages,
    });
  } catch (error) {
    console.error('Error fetching products by filter:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching products',
    });
  }
};

// how to use filter
// http://localhost:5000/api/product (get all products)
// http://localhost:5000/api/product?page=1&limit=2 (pagination)
// http://localhost:5000/api/product?category=:id (get by category)
// http://localhost:5000/api/product?status=active ( get by status)
// http://localhost:5000/api/product?minPrice=100&maxPrice=5000 (min and max price)
// http://localhost:5000/api/product?minRating=4&maxRating=5 (min and max rating)
// http://localhost:5000/api/product?search=phone nokia folding (search by name and decription matching word)

// Delete Product By Id
exports.deleteProductById = async (req, res) => {
  const { id } = req.params;

  try {
    await withTransaction(async (session) => {
      // 1. Delete the product and get the deleted document
      const product = await Product.findByIdAndDelete(id).session(session);
      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      // 2. Delete associated ProductInfo
      await ProductInfo.deleteOne({ productId: product._id }).session(session);

      // 3. Get all product images
      const images = await getAssetsByEntity(product._id);

      // 4. Delete all images using deleteAsset helper
      if (images && images.length > 0) {
        for (const img of images) {
          await deleteAsset(img._id, session);
        }
      }
    });

    return res
      .status(200)
      .json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Something went wrong while deleting product',
    });
  }
};
