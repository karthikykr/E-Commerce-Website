const mongoose = require('mongoose');
const { Product, Category } = require('../models');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Organic Turmeric Powder',
    slug: 'organic-turmeric-powder',
    description:
      'Premium quality organic turmeric powder, perfect for cooking and health benefits. Rich in curcumin and antioxidants.',
    price: 12.99,
    stockQuantity: 50,
    weight: {
      value: 100,
      unit: 'g',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
        alt: 'Organic Turmeric Powder',
      },
    ],
    specifications: [
      { key: 'Weight', value: '100g' },
      { key: 'Origin', value: 'India' },
      { key: 'Organic', value: 'Yes' },
    ],
    isActive: true,
  },
  {
    name: 'Ceylon Cinnamon Sticks',
    slug: 'ceylon-cinnamon-sticks',
    description:
      'Authentic Ceylon cinnamon sticks with sweet and delicate flavor. Perfect for baking and beverages.',
    price: 18.5,
    stockQuantity: 30,
    weight: {
      value: 50,
      unit: 'g',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
        alt: 'Ceylon Cinnamon Sticks',
      },
    ],
    specifications: [
      { key: 'Weight', value: '50g' },
      { key: 'Origin', value: 'Sri Lanka' },
      { key: 'Type', value: 'Ceylon' },
    ],
    isActive: true,
  },
  {
    name: 'Black Peppercorns',
    slug: 'black-peppercorns',
    description:
      'Premium whole black peppercorns with intense flavor and aroma. Essential for any kitchen.',
    price: 15.75,
    stockQuantity: 40,
    weight: {
      value: 100,
      unit: 'g',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
        alt: 'Black Peppercorns',
      },
    ],
    specifications: [
      { key: 'Weight', value: '100g' },
      { key: 'Origin', value: 'India' },
      { key: 'Grade', value: 'Premium' },
    ],
    isActive: true,
  },
  {
    name: 'Himalayan Pink Salt',
    slug: 'himalayan-pink-salt',
    description:
      'Pure Himalayan pink salt crystals, rich in minerals and perfect for cooking and seasoning.',
    price: 9.99,
    stockQuantity: 60,
    weight: {
      value: 500,
      unit: 'g',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
        alt: 'Himalayan Pink Salt',
      },
    ],
    specifications: [
      { key: 'Weight', value: '500g' },
      { key: 'Origin', value: 'Pakistan' },
      { key: 'Type', value: 'Rock Salt' },
    ],
    isActive: true,
  },
  {
    name: 'Cardamom Pods',
    slug: 'cardamom-pods',
    description:
      'Aromatic green cardamom pods, the queen of spices. Perfect for desserts and chai.',
    price: 24.99,
    stockQuantity: 25,
    weight: {
      value: 50,
      unit: 'g',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
        alt: 'Cardamom Pods',
      },
    ],
    specifications: [
      { key: 'Weight', value: '50g' },
      { key: 'Origin', value: 'Guatemala' },
      { key: 'Grade', value: 'Premium' },
    ],
    isActive: true,
  },
];

async function addSampleProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'
    );
    console.log('Connected to MongoDB');

    // Find or create a default category
    let category = await Category.findOne({ name: 'Spices & Herbs' });
    if (!category) {
      category = new Category({
        name: 'Spices & Herbs',
        slug: 'spices-herbs',
        description: 'Premium quality spices and herbs from around the world',
        image: '🌿',
        isActive: true,
      });
      await category.save();
      console.log('Created default category: Spices & Herbs');
    }

    // Add category to each product
    const productsWithCategory = sampleProducts.map((product) => ({
      ...product,
      category: category._id,
    }));

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithCategory);
    console.log(`Added ${insertedProducts.length} sample products:`);

    insertedProducts.forEach((product) => {
      console.log(`- ${product.name} ($${product.price})`);
    });

    console.log('\nSample products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample products:', error);
    process.exit(1);
  }
}

addSampleProducts();
