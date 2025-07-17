const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Product, Category, Order } = require('./src/models');

// Load environment variables
dotenv.config();

console.log('🗄️ E-Commerce Database Setup\n');

// Check MongoDB connection
const checkMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ No MongoDB URI found in .env file');
      console.log('💡 Add MONGODB_URI to your .env file to enable database features');
      console.log('📝 Example: MONGODB_URI=mongodb://localhost:27017/ecommerce_db');
      return false;
    }

    console.log('🔍 Checking MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Check if MongoDB service is started');
    console.log('3. Verify the connection URI in .env file');
    console.log('4. Try connecting with MongoDB Compass first');
    return false;
  }
};

// Create sample categories
const createCategories = async () => {
  console.log('📂 Creating product categories...');
  
  const categories = [
    {
      name: 'Spices & Seasonings',
      slug: 'spices-seasonings',
      description: 'Premium quality spices and seasonings from around the world',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      isActive: true,
      featured: true
    },
    {
      name: 'Herbs & Aromatics',
      slug: 'herbs-aromatics',
      description: 'Fresh and dried herbs for cooking and wellness',
      image: 'https://images.unsplash.com/photo-1515586838455-8b8b3e2b8e8e?w=400',
      isActive: true,
      featured: true
    },
    {
      name: 'Masala Blends',
      slug: 'masala-blends',
      description: 'Traditional and modern spice blends',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      isActive: true,
      featured: true
    },
    {
      name: 'Organic Collection',
      slug: 'organic-collection',
      description: 'Certified organic spices and herbs',
      image: 'https://images.unsplash.com/photo-1515586838455-8b8b3e2b8e8e?w=400',
      isActive: true,
      featured: false
    }
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    try {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        createdCategories.push(category);
        console.log(`✅ Created category: ${category.name}`);
      } else {
        createdCategories.push(existingCategory);
        console.log(`⚠️  Category already exists: ${existingCategory.name}`);
      }
    } catch (error) {
      console.log(`❌ Error creating category ${categoryData.name}:`, error.message);
    }
  }
  
  return createdCategories;
};

// Create sample products
const createProducts = async (categories) => {
  console.log('🛍️ Creating sample products...');
  
  const products = [
    {
      name: 'Premium Turmeric Powder',
      slug: 'premium-turmeric-powder',
      description: 'High-quality turmeric powder with rich color and aroma. Perfect for cooking and health benefits.',
      shortDescription: 'Premium quality turmeric powder',
      price: 299,
      originalPrice: 399,
      category: categories[0]._id, // Spices & Seasonings
      images: [{
        url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
        alt: 'Premium Turmeric Powder',
        isPrimary: true
      }],
      stockQuantity: 100,
      weight: { value: 250, unit: 'g' },
      tags: ['turmeric', 'spice', 'healthy', 'organic'],
      nutritionalInfo: {
        calories: 312,
        protein: 9.7,
        carbohydrates: 67.1,
        fat: 3.2,
        fiber: 22.7
      },
      isActive: true,
      isFeatured: true
    },
    {
      name: 'Garam Masala Blend',
      slug: 'garam-masala-blend',
      description: 'Traditional Indian spice blend with perfect balance of warmth and flavor.',
      shortDescription: 'Authentic garam masala blend',
      price: 199,
      originalPrice: 249,
      category: categories[2]._id, // Masala Blends
      images: [{
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
        alt: 'Garam Masala Blend',
        isPrimary: true
      }],
      stockQuantity: 75,
      weight: { value: 100, unit: 'g' },
      tags: ['garam-masala', 'blend', 'indian', 'traditional'],
      isActive: true,
      isFeatured: true
    },
    {
      name: 'Organic Cardamom Pods',
      slug: 'organic-cardamom-pods',
      description: 'Premium organic green cardamom pods with intense aroma and flavor.',
      shortDescription: 'Organic green cardamom pods',
      price: 899,
      originalPrice: 999,
      category: categories[3]._id, // Organic Collection
      images: [{
        url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
        alt: 'Organic Cardamom Pods',
        isPrimary: true
      }],
      stockQuantity: 50,
      weight: { value: 50, unit: 'g' },
      tags: ['cardamom', 'organic', 'premium', 'aromatic'],
      isActive: true,
      isFeatured: false
    },
    {
      name: 'Fresh Basil Leaves',
      slug: 'fresh-basil-leaves',
      description: 'Fresh organic basil leaves perfect for cooking and garnishing.',
      shortDescription: 'Fresh organic basil leaves',
      price: 149,
      category: categories[1]._id, // Herbs & Aromatics
      images: [{
        url: 'https://images.unsplash.com/photo-1515586838455-8b8b3e2b8e8e?w=400',
        alt: 'Fresh Basil Leaves',
        isPrimary: true
      }],
      stockQuantity: 30,
      weight: { value: 25, unit: 'g' },
      tags: ['basil', 'fresh', 'herbs', 'organic'],
      isActive: true,
      isFeatured: false
    },
    {
      name: 'Red Chili Powder',
      slug: 'red-chili-powder',
      description: 'Spicy red chili powder made from premium quality chilies.',
      shortDescription: 'Premium red chili powder',
      price: 179,
      originalPrice: 199,
      category: categories[0]._id, // Spices & Seasonings
      images: [{
        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
        alt: 'Red Chili Powder',
        isPrimary: true
      }],
      stockQuantity: 80,
      weight: { value: 200, unit: 'g' },
      tags: ['chili', 'spicy', 'red', 'powder'],
      isActive: true,
      isFeatured: true
    }
  ];

  const createdProducts = [];
  for (const productData of products) {
    try {
      const existingProduct = await Product.findOne({ slug: productData.slug });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        createdProducts.push(product);
        console.log(`✅ Created product: ${product.name}`);
      } else {
        createdProducts.push(existingProduct);
        console.log(`⚠️  Product already exists: ${existingProduct.name}`);
      }
    } catch (error) {
      console.log(`❌ Error creating product ${productData.name}:`, error.message);
    }
  }
  
  return createdProducts;
};

// Create test users
const createTestUsers = async () => {
  console.log('👥 Creating test users...');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@gruhapaaka.com',
      password: 'admin123',
      authMethod: 'email',
      role: 'admin',
      phone: '+1234567890',
      isActive: true,
      emailVerified: true
    },
    {
      name: 'John Customer',
      email: 'customer@test.com',
      password: 'customer123',
      authMethod: 'email',
      role: 'user',
      phone: '+9876543210',
      isActive: true,
      emailVerified: true,
      address: {
        street: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'jane123',
      authMethod: 'email',
      role: 'user',
      phone: '+1122334455',
      isActive: true,
      emailVerified: true,
      address: {
        street: '456 Demo Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.name} (${user.role})`);
      } else {
        createdUsers.push(existingUser);
        console.log(`⚠️  User already exists: ${existingUser.name}`);
      }
    } catch (error) {
      console.log(`❌ Error creating user ${userData.name}:`, error.message);
    }
  }
  
  return createdUsers;
};

// Main setup function
const setupDatabase = async () => {
  try {
    const isConnected = await checkMongoDB();
    
    if (!isConnected) {
      console.log('\n💡 To enable full database functionality:');
      console.log('1. Install MongoDB Community Server');
      console.log('2. Start MongoDB service');
      console.log('3. Add MONGODB_URI to .env file');
      console.log('4. Run this script again');
      return;
    }

    console.log('\n🚀 Setting up database with sample data...\n');

    // Create categories
    const categories = await createCategories();
    console.log('');

    // Create products
    const products = await createProducts(categories);
    console.log('');

    // Create test users
    const users = await createTestUsers();
    console.log('');

    console.log('🎉 Database setup completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`✅ Categories: ${categories.length}`);
    console.log(`✅ Products: ${products.length}`);
    console.log(`✅ Users: ${users.length}`);
    
    console.log('\n🧪 Test Accounts:');
    console.log('👑 Admin: admin@gruhapaaka.com / admin123');
    console.log('👤 Customer: customer@test.com / customer123');
    console.log('👤 Customer: jane@example.com / jane123');
    
    console.log('\n🌐 Ready to test:');
    console.log('• User registration and login');
    console.log('• Product browsing and filtering');
    console.log('• Shopping cart functionality');
    console.log('• Order processing');
    console.log('• Admin dashboard');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, createCategories, createProducts, createTestUsers };
