const { exec } = require('child_process');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 Checking MongoDB Setup...\n');

// Check if MongoDB service is running
const checkMongoService = () => {
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq mongod.exe"', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ MongoDB service check failed (this is normal if using MongoDB Atlas)');
        resolve(false);
        return;
      }
      
      if (stdout.includes('mongod.exe')) {
        console.log('✅ MongoDB service is running locally');
        resolve(true);
      } else {
        console.log('⚠️  MongoDB service not found locally (might be using Atlas or not installed)');
        resolve(false);
      }
    });
  });
};

// Check MongoDB connection
const checkMongoConnection = async () => {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log(`📍 Connection URI: ${process.env.MONGODB_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log(`📊 Connected to: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔌 Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    
    await mongoose.connection.close();
    return true;
    
  } catch (error) {
    console.log('❌ MongoDB connection failed!');
    console.log(`💥 Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Check if MongoDB service is started');
      console.log('3. Verify the connection URI in .env file');
      console.log('4. Try connecting to MongoDB Compass first');
    }
    
    return false;
  }
};

// Check environment variables
const checkEnvironment = () => {
  console.log('🔧 Checking environment variables...');
  
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
};

// Main check function
const runChecks = async () => {
  console.log('🚀 MongoDB Setup Checker\n');
  
  // Check environment variables
  const envOk = checkEnvironment();
  console.log('');
  
  // Check MongoDB service (Windows only)
  if (process.platform === 'win32') {
    await checkMongoService();
    console.log('');
  }
  
  // Check MongoDB connection
  const connectionOk = await checkMongoConnection();
  console.log('');
  
  // Summary
  console.log('📋 Summary:');
  console.log(`Environment Variables: ${envOk ? '✅ OK' : '❌ Issues found'}`);
  console.log(`MongoDB Connection: ${connectionOk ? '✅ OK' : '❌ Failed'}`);
  
  if (envOk && connectionOk) {
    console.log('\n🎉 All checks passed! Your MongoDB setup is ready.');
    console.log('You can now start the server with: npm run dev');
  } else {
    console.log('\n⚠️  Some issues found. Please fix them before starting the server.');
  }
};

// Run checks if this file is executed directly
if (require.main === module) {
  runChecks().catch(console.error);
}

module.exports = { runChecks };
