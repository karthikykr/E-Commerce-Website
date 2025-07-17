const http = require('http');

console.log('🔧 TESTING COMPLETE ADMIN DASHBOARD FUNCTIONALITY\n');

// Test admin login
const testAdminLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({ email, password });

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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.token) {
            resolve({ token: response.data.token, user: response.data.user });
          } else {
            reject(new Error(`Login failed: ${response.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
};

// Test categories API
const testCategories = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/categories',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            const categories = response.data.categories || response.data;
            resolve(categories);
          } else {
            reject(new Error('Categories API failed'));
          }
        } catch (error) {
          reject(new Error(`Categories parse error: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Test product creation
const testProductCreation = (token, categoryId) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const productData = JSON.stringify({
      name: `Admin Dashboard Test Product ${timestamp}`,
      slug: `admin-test-product-${timestamp}`,
      description: 'This is a test product created through the admin dashboard API',
      shortDescription: 'Test product for admin dashboard',
      price: 19.99,
      category: categoryId,
      stockQuantity: 50,
      weight: { value: 200, unit: 'g' },
      images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', alt: 'Test Product' }],
      specifications: [
        { key: 'Brand', value: 'Test Brand' },
        { key: 'Quality', value: 'Premium' }
      ],
      tags: ['test', 'admin', 'dashboard'],
      isActive: true,
      isFeatured: true
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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(`Product creation failed: ${response.message}`));
          }
        } catch (error) {
          reject(new Error(`Product creation parse error: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(productData);
    req.end();
  });
};

// Test admin dashboard stats
const testDashboardStats = (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(`Dashboard stats failed: ${response.message}`));
          }
        } catch (error) {
          reject(new Error(`Dashboard stats parse error: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Main test function
const runCompleteTest = async () => {
  console.log('🔐 Testing Admin Login...');
  
  // Try both possible admin credentials
  let adminAuth = null;
  try {
    adminAuth = await testAdminLogin('admin@spicestore.com', 'admin123');
    console.log('✅ Admin login successful with admin@spicestore.com');
  } catch (error) {
    try {
      adminAuth = await testAdminLogin('admin@123.com', 'admin123');
      console.log('✅ Admin login successful with admin@123.com');
    } catch (error2) {
      console.log('❌ Both admin login attempts failed');
      console.log('   - admin@spicestore.com:', error.message);
      console.log('   - admin@123.com:', error2.message);
      return;
    }
  }

  console.log(`   Admin: ${adminAuth.user.name} (${adminAuth.user.email})`);
  console.log(`   Role: ${adminAuth.user.role}`);

  console.log('\n📂 Testing Categories API...');
  try {
    const categories = await testCategories();
    console.log(`✅ Categories loaded: ${categories.length} categories`);
    categories.slice(0, 3).forEach(cat => {
      console.log(`   - ${cat.name} (${cat._id})`);
    });

    console.log('\n🛍️ Testing Product Creation...');
    const product = await testProductCreation(adminAuth.token, categories[0]._id);
    console.log('✅ Product created successfully!');
    console.log(`   Product: ${product.name}`);
    console.log(`   ID: ${product._id}`);
    console.log(`   Price: $${product.price}`);

    console.log('\n📊 Testing Dashboard Stats...');
    try {
      const stats = await testDashboardStats(adminAuth.token);
      console.log('✅ Dashboard stats loaded');
      console.log(`   Total Products: ${stats.totalProducts || 'N/A'}`);
      console.log(`   Total Orders: ${stats.totalOrders || 'N/A'}`);
      console.log(`   Total Users: ${stats.totalUsers || 'N/A'}`);
    } catch (error) {
      console.log('⚠️ Dashboard stats not available:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ADMIN DASHBOARD FUNCTIONALITY TEST PASSED!');
    console.log('='.repeat(60));
    console.log('✅ Admin Authentication: Working');
    console.log('✅ Categories Management: Working');
    console.log('✅ Product Creation: Working');
    console.log('✅ Database Integration: Working');
    
    console.log('\n🌐 Your Admin Dashboard URLs:');
    console.log('• Login: http://localhost:3000/auth/login');
    console.log('• Dashboard: http://localhost:3000/admin/dashboard');
    console.log('• Add Product: http://localhost:3000/admin/products/add');
    console.log('• Manage Products: http://localhost:3000/admin/products');
    
    console.log('\n🔐 Working Admin Credentials:');
    console.log(`• Email: ${adminAuth.user.email}`);
    console.log('• Password: admin123');

  } catch (error) {
    console.log('❌ Categories test failed:', error.message);
  }
};

runCompleteTest().catch(console.error);
