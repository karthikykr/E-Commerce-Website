const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require('./src/models');

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB (if available)
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');

      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: 'admin@gruhapaaka.com' });
      if (existingAdmin) {
        console.log('⚠️  Admin user already exists');
        console.log('Email: admin@gruhapaaka.com');
        console.log('Password: admin123');
        await mongoose.connection.close();
        return;
      }

      // Create admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@gruhapaaka.com',
        password: 'admin123',
        authMethod: 'email',
        role: 'admin',
        phone: '+1234567890',
        isActive: true,
        emailVerified: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@gruhapaaka.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role: admin');
      
      await mongoose.connection.close();
    } else {
      console.log('⚠️  No MongoDB URI found. Admin user creation requires database connection.');
      console.log('💡 Set up MongoDB first, then run this script.');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

// Also create a test customer user
const createTestCustomer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      
      // Check if customer already exists
      const existingCustomer = await User.findOne({ email: 'customer@test.com' });
      if (existingCustomer) {
        console.log('⚠️  Test customer already exists');
        console.log('Email: customer@test.com');
        console.log('Password: customer123');
        await mongoose.connection.close();
        return;
      }

      // Create test customer
      const customerUser = new User({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'customer123',
        authMethod: 'email',
        role: 'user',
        phone: '+9876543210',
        isActive: true,
        emailVerified: true,
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'India'
        }
      });

      await customerUser.save();
      console.log('✅ Test customer created successfully!');
      console.log('📧 Email: customer@test.com');
      console.log('🔑 Password: customer123');
      console.log('👤 Role: user');
      
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error('❌ Error creating test customer:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

const createTestUsers = async () => {
  console.log('🚀 Creating test users for E-Commerce application...\n');
  
  await createAdminUser();
  console.log('');
  await createTestCustomer();
  
  console.log('\n🎉 Test user creation completed!');
  console.log('\n📋 Test Accounts:');
  console.log('👑 Admin: admin@gruhapaaka.com / admin123');
  console.log('👤 Customer: customer@test.com / customer123');
  console.log('\n💡 Use these accounts to test role-based authentication!');
};

// Run the script
if (require.main === module) {
  createTestUsers();
}

module.exports = { createAdminUser, createTestCustomer };
