const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 E-Commerce Backend Setup Script\n');

// Check if .env file exists
const checkEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    return true;
  } else {
    console.log('❌ .env file not found');
    console.log('The .env file should have been created. Please check if it exists.');
    return false;
  }
};

// Run npm install
const installDependencies = () => {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing dependencies...');
    
    const npmInstall = spawn('npm', ['install'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    npmInstall.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependencies installed successfully');
        resolve();
      } else {
        console.log('❌ Failed to install dependencies');
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
    
    npmInstall.on('error', (error) => {
      console.log('❌ Failed to run npm install:', error.message);
      reject(error);
    });
  });
};

// Check MongoDB connection
const checkMongoDB = () => {
  return new Promise((resolve, reject) => {
    console.log('🔍 Checking MongoDB connection...');
    
    const mongoCheck = spawn('node', ['check-mongodb.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    mongoCheck.on('close', (code) => {
      if (code === 0) {
        console.log('✅ MongoDB check completed');
        resolve();
      } else {
        console.log('⚠️  MongoDB check completed with warnings');
        resolve(); // Don't fail the setup, just warn
      }
    });
    
    mongoCheck.on('error', (error) => {
      console.log('❌ Failed to run MongoDB check:', error.message);
      resolve(); // Don't fail the setup
    });
  });
};

// Create uploads directory
const createUploadsDir = () => {
  const uploadsPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Created uploads directory');
  } else {
    console.log('✅ Uploads directory already exists');
  }
};

// Display setup completion message
const displayCompletionMessage = () => {
  console.log('\n🎉 Setup completed successfully!\n');
  console.log('📋 Next steps:');
  console.log('1. Make sure MongoDB is running on your system');
  console.log('2. Update the JWT_SECRET in .env file for production');
  console.log('3. Configure email settings if needed');
  console.log('4. Start the development server: npm run dev');
  console.log('5. Test the API endpoints: npm run test-api\n');
  
  console.log('🔗 Available commands:');
  console.log('  npm run dev          - Start development server');
  console.log('  npm start            - Start production server');
  console.log('  npm run check-mongodb - Check MongoDB connection');
  console.log('  npm run test-connection - Test database connection');
  console.log('  npm run test-api     - Test API endpoints');
  console.log('  npm run seed         - Seed database with sample data');
  console.log('  npm run reset-db     - Reset database\n');
  
  console.log('📚 Documentation:');
  console.log('  - Database setup: DATABASE_SETUP.md');
  console.log('  - API documentation: Check the routes in src/routes/');
  console.log('  - Server health: http://localhost:5000/api/health\n');
};

// Main setup function
const runSetup = async () => {
  try {
    console.log('Starting setup process...\n');
    
    // Check .env file
    if (!checkEnvFile()) {
      console.log('Please create the .env file first.');
      return;
    }
    
    // Install dependencies
    await installDependencies();
    console.log('');
    
    // Create uploads directory
    createUploadsDir();
    console.log('');
    
    // Check MongoDB
    await checkMongoDB();
    console.log('');
    
    // Display completion message
    displayCompletionMessage();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  runSetup();
}

module.exports = { runSetup };
