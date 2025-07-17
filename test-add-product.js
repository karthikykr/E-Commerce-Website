const http = require('http');

console.log('🧪 TESTING ADD PRODUCT FUNCTIONALITY\n');

// First, let's login as admin to get a token
const loginAdmin = () => {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: 'admin@spicestore.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Login response:', response);
          if (response.success && response.data && response.data.token) {
            console.log('✅ Admin login successful');
            resolve(response.data.token);
          } else if (response.token) {
            console.log('✅ Admin login successful');
            resolve(response.token);
          } else {
            console.log('❌ Admin login failed:', response.message || 'Unknown error');
            reject(new Error('Login failed'));
          }
        } catch (error) {
          console.log('❌ Error parsing login response:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Login request error:', error.message);
      reject(error);
    });

    req.write(loginData);
    req.end();
  });
};

// Test getting categories
const getCategories = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/categories',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Categories response:', response);
          if (response.success && response.data && response.data.categories && response.data.categories.length > 0) {
            console.log(`✅ Categories loaded: ${response.data.categories.length} categories found`);
            resolve(response.data.categories[0]._id); // Return first category ID
          } else {
            console.log('❌ No categories found');
            reject(new Error('No categories'));
          }
        } catch (error) {
          console.log('❌ Error parsing categories response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Categories request error:', error.message);
      reject(error);
    });

    req.end();
  });
};

// Test creating a product
const createProduct = (token, categoryId) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const productData = JSON.stringify({
      name: `Test Organic Turmeric ${timestamp}`,
      slug: `test-organic-turmeric-${timestamp}`,
      description: 'Premium organic turmeric powder with anti-inflammatory properties',
      shortDescription: 'Premium organic turmeric powder',
      price: 12.99,
      category: categoryId,
      stockQuantity: 100,
      weight: {
        value: 250,
        unit: 'g'
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500',
          alt: 'Organic Turmeric Powder'
        }
      ],
      specifications: [
        { key: 'Origin', value: 'India' },
        { key: 'Organic', value: 'Yes' }
      ],
      tags: ['organic', 'turmeric', 'spice', 'anti-inflammatory'],
      isActive: true,
      isFeatured: false
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(productData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ Product created successfully!');
            console.log(`   Product ID: ${response.data._id}`);
            console.log(`   Product Name: ${response.data.name}`);
            console.log(`   Price: $${response.data.price}`);
            resolve(response.data);
          } else {
            console.log('❌ Product creation failed:', response.message);
            if (response.errors) {
              response.errors.forEach(error => {
                console.log(`   - ${error.msg}`);
              });
            }
            reject(new Error('Product creation failed'));
          }
        } catch (error) {
          console.log('❌ Error parsing product creation response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Product creation request error:', error.message);
      reject(error);
    });

    req.write(productData);
    req.end();
  });
};

// Run the test
const runTest = async () => {
  try {
    console.log('🔐 Step 1: Logging in as admin...');
    const token = await loginAdmin();
    
    console.log('\n📂 Step 2: Getting categories...');
    const categoryId = await getCategories();
    
    console.log('\n🛍️ Step 3: Creating test product...');
    const product = await createProduct(token, categoryId);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ADD PRODUCT FUNCTIONALITY TEST PASSED!');
    console.log('='.repeat(50));
    console.log('✅ Admin authentication: Working');
    console.log('✅ Categories API: Working');
    console.log('✅ Product creation: Working');
    console.log('✅ Database connection: Working');
    
    console.log('\n🌐 Your admin dashboard is ready!');
    console.log('• Login: http://localhost:3000/auth/login');
    console.log('• Admin Dashboard: http://localhost:3000/admin/dashboard');
    console.log('• Add Product: http://localhost:3000/admin/products/add');
    
    console.log('\n🔐 Admin Credentials:');
    console.log('• Email: admin@spicestore.com');
    console.log('• Password: admin123');
    
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ ADD PRODUCT FUNCTIONALITY TEST FAILED!');
    console.log('='.repeat(50));
    console.log('Error:', error.message);
    console.log('\nPlease check:');
    console.log('1. Backend server is running on port 5000');
    console.log('2. Database connection is working');
    console.log('3. Categories are seeded in database');
  }
};

runTest();
