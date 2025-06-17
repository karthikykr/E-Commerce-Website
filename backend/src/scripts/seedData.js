const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Product, Category } = require('../models');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const categories = [
  {
    name: 'Whole Spices',
    slug: 'whole-spices',
    description: 'Fresh whole spices for maximum flavor and aroma',
    image: '/images/categories/whole-spices.jpg',
    sortOrder: 1
  },
  {
    name: 'Ground Spices',
    slug: 'ground-spices',
    description: 'Finely ground spices ready for cooking',
    image: '/images/categories/ground-spices.jpg',
    sortOrder: 2
  },
  {
    name: 'Spice Blends',
    slug: 'spice-blends',
    description: 'Expertly crafted blends for authentic flavors',
    image: '/images/categories/spice-blends.jpg',
    sortOrder: 3
  },
  {
    name: 'Herbs',
    slug: 'herbs',
    description: 'Fresh and dried herbs for cooking and seasoning',
    image: '/images/categories/herbs.jpg',
    sortOrder: 4
  },
  {
    name: 'Seeds',
    slug: 'seeds',
    description: 'Aromatic seeds for cooking and garnishing',
    image: '/images/categories/seeds.jpg',
    sortOrder: 5
  }
];

const users = [
  {
    name: 'Admin User',
    adminId: 'admin001',
    password: 'admin123',
    role: 'admin',
    authMethod: 'admin',
    phone: '+1234567890',
    address: {
      street: '123 Admin Street',
      city: 'Admin City',
      state: 'AC',
      zipCode: '12345',
      country: 'USA'
    },
    emailVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    authMethod: 'email',
    phone: '+1987654321',
    address: {
      street: '456 User Avenue',
      city: 'User City',
      state: 'UC',
      zipCode: '67890',
      country: 'USA'
    },
    emailVerified: true
  },
  {
    name: 'Priya Sharma',
    mobile: '9876543210',
    password: 'mobile123',
    role: 'user',
    authMethod: 'mobile',
    phone: '+919876543210',
    address: {
      street: '789 Mobile Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    emailVerified: false
  }
];

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log('Existing data cleared');

    // Create users
    const createdUsers = await User.create(users);
    console.log('Users created:', createdUsers.length);

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log('Categories created:', createdCategories.length);

    // Create products
    const products = [
      {
        name: 'Organic Turmeric Powder',
        slug: 'organic-turmeric-powder',
        description: 'Premium organic turmeric powder with high curcumin content. Perfect for curries, golden milk, and health supplements.',
        shortDescription: 'Premium organic turmeric powder with high curcumin content.',
        price: 12.99,
        originalPrice: 15.99,
        category: createdCategories[1]._id, // Ground Spices
        images: [
          { url: '/images/products/turmeric.jpg', alt: 'Organic Turmeric Powder', isPrimary: true }
        ],
        stockQuantity: 50,
        weight: { value: 100, unit: 'g' },
        origin: 'India',
        tags: ['organic', 'anti-inflammatory', 'golden milk'],
        isFeatured: true,
        nutritionalInfo: {
          calories: 354,
          protein: 7.8,
          carbohydrates: 64.9,
          fat: 9.9,
          fiber: 21.1
        },
        storageInstructions: 'Store in a cool, dry place away from direct sunlight',
        shelfLife: '2 years'
      },
      {
        name: 'Ceylon Cinnamon Sticks',
        slug: 'ceylon-cinnamon-sticks',
        description: 'Authentic Ceylon cinnamon sticks from Sri Lanka. Sweet and delicate flavor perfect for baking and beverages.',
        shortDescription: 'Authentic Ceylon cinnamon sticks from Sri Lanka.',
        price: 18.99,
        originalPrice: 22.99,
        category: createdCategories[0]._id, // Whole Spices
        images: [
          { url: '/images/products/cinnamon.jpg', alt: 'Ceylon Cinnamon Sticks', isPrimary: true }
        ],
        stockQuantity: 30,
        weight: { value: 50, unit: 'g' },
        origin: 'Sri Lanka',
        tags: ['ceylon', 'sweet', 'baking'],
        isFeatured: true,
        storageInstructions: 'Store in an airtight container',
        shelfLife: '3 years'
      },
      {
        name: 'Garam Masala Blend',
        slug: 'garam-masala-blend',
        description: 'Traditional Indian spice blend with cardamom, cinnamon, cloves, and more. Perfect for curries and rice dishes.',
        shortDescription: 'Traditional Indian spice blend for authentic flavors.',
        price: 14.99,
        category: createdCategories[2]._id, // Spice Blends
        images: [
          { url: '/images/products/garam-masala.jpg', alt: 'Garam Masala Blend', isPrimary: true }
        ],
        stockQuantity: 40,
        weight: { value: 75, unit: 'g' },
        origin: 'India',
        tags: ['blend', 'indian', 'curry'],
        isFeatured: true,
        storageInstructions: 'Store in a cool, dry place',
        shelfLife: '18 months'
      },
      {
        name: 'Black Peppercorns',
        slug: 'black-peppercorns',
        description: 'Premium whole black peppercorns from Kerala, India. Bold and pungent flavor for seasoning and cooking.',
        shortDescription: 'Premium whole black peppercorns from Kerala.',
        price: 16.99,
        category: createdCategories[0]._id, // Whole Spices
        images: [
          { url: '/images/products/black-pepper.jpg', alt: 'Black Peppercorns', isPrimary: true }
        ],
        stockQuantity: 60,
        weight: { value: 100, unit: 'g' },
        origin: 'India',
        tags: ['pepper', 'whole', 'kerala'],
        storageInstructions: 'Store in an airtight container',
        shelfLife: '4 years'
      },
      {
        name: 'Dried Oregano',
        slug: 'dried-oregano',
        description: 'Mediterranean dried oregano with intense flavor. Perfect for pizza, pasta, and Mediterranean dishes.',
        shortDescription: 'Mediterranean dried oregano with intense flavor.',
        price: 8.99,
        category: createdCategories[3]._id, // Herbs
        images: [
          { url: '/images/products/oregano.jpg', alt: 'Dried Oregano', isPrimary: true }
        ],
        stockQuantity: 35,
        weight: { value: 25, unit: 'g' },
        origin: 'Greece',
        tags: ['mediterranean', 'pizza', 'pasta'],
        storageInstructions: 'Store in a cool, dry place',
        shelfLife: '2 years'
      },
      {
        name: 'Cumin Seeds',
        slug: 'cumin-seeds',
        description: 'Aromatic cumin seeds with earthy flavor. Essential for Indian, Mexican, and Middle Eastern cuisines.',
        shortDescription: 'Aromatic cumin seeds with earthy flavor.',
        price: 11.99,
        category: createdCategories[4]._id, // Seeds
        images: [
          { url: '/images/products/cumin-seeds.jpg', alt: 'Cumin Seeds', isPrimary: true }
        ],
        stockQuantity: 45,
        weight: { value: 100, unit: 'g' },
        origin: 'India',
        tags: ['seeds', 'earthy', 'indian'],
        storageInstructions: 'Store in an airtight container',
        shelfLife: '3 years'
      }
    ];

    const createdProducts = await Product.create(products);
    console.log('Products created:', createdProducts.length);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

if (require.main === module) {
  runSeed();
}

module.exports = { seedData, connectDB };
