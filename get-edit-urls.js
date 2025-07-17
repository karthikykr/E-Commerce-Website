const http = require('http');

console.log('🔗 GETTING EDIT PRODUCT URLS FOR TESTING\n');

// Get admin token
const getAdminToken = () => {
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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.token) {
            resolve(response.data.token);
          } else {
            reject(new Error('Login failed'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
};

// Get products
const getProducts = (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
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
          if (response.success && response.data && response.data.products) {
            resolve(response.data.products);
          } else {
            reject(new Error('Failed to get products'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Main function
const getEditUrls = async () => {
  try {
    console.log('🔐 Getting admin token...');
    const token = await getAdminToken();
    console.log('✅ Admin login successful');

    console.log('\n📦 Getting products...');
    const products = await getProducts(token);
    console.log(`✅ Found ${products.length} products`);

    console.log('\n🔗 EDIT PRODUCT URLS FOR TESTING:');
    console.log('='.repeat(80));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Edit URL: http://localhost:3000/admin/products/edit/${product._id}`);
      console.log(`   Price: $${product.price} | Stock: ${product.stockQuantity} | Category: ${product.category?.name || 'No Category'}`);
      console.log(`   Active: ${product.isActive} | Featured: ${product.isFeatured}`);
      console.log('');
    });

    console.log('🌐 ADMIN DASHBOARD URLS:');
    console.log('='.repeat(80));
    console.log('• Homepage: http://localhost:3000');
    console.log('• Admin Login: http://localhost:3000/auth/login');
    console.log('• Admin Dashboard: http://localhost:3000/admin/dashboard');
    console.log('• Admin Products: http://localhost:3000/admin/products');
    console.log('• Add Product: http://localhost:3000/admin/products/add');

    console.log('\n🔐 ADMIN CREDENTIALS:');
    console.log('• Email: admin@spicestore.com');
    console.log('• Password: admin123');

    console.log('\n✨ EDIT FUNCTIONALITY FEATURES:');
    console.log('• ✅ Complete Edit Form with All Fields');
    console.log('• ✅ Pre-populated with Existing Product Data');
    console.log('• ✅ Category Selection Dropdown');
    console.log('• ✅ Image Management (Add/Remove Multiple Images)');
    console.log('• ✅ Specifications Editor (Dynamic Key-Value Pairs)');
    console.log('• ✅ Tags System (Comma-separated Tags)');
    console.log('• ✅ Weight Management (Value + Unit Selection)');
    console.log('• ✅ Status Toggles (Active/Featured Checkboxes)');
    console.log('• ✅ Real-time Database Updates');
    console.log('• ✅ Form Validation & Error Handling');
    console.log('• ✅ Success Messages & Auto-redirect');

    console.log('\n🎯 TO TEST EDIT FUNCTIONALITY:');
    console.log('1. Login as admin using the credentials above');
    console.log('2. Go to Admin Products page');
    console.log('3. Click "Edit" button on any product');
    console.log('4. Or directly visit any edit URL listed above');
    console.log('5. Update any product information');
    console.log('6. Click "Update Product" to save changes');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

getEditUrls();
