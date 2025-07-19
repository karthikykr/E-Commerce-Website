const http = require('http');

console.log('🛍️ TESTING PRODUCTS API\n');

// Helper function to make HTTP requests
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

// Test products API
const testProducts = async () => {
  console.log('📦 Testing Products API...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET'
  };

  try {
    const response = await makeRequest(options);
    console.log('Response status:', response.status);
    
    if (response.data.success && response.data.data && response.data.data.products) {
      const products = response.data.data.products;
      console.log(`✅ Found ${products.length} products`);
      
      if (products.length > 0) {
        console.log('\n📋 First few products:');
        products.slice(0, 3).forEach((product, index) => {
          console.log(`${index + 1}. ID: ${product._id || product.id}`);
          console.log(`   Name: ${product.name}`);
          console.log(`   Price: ₹${product.price}`);
          console.log(`   Stock: ${product.stockQuantity}`);
          console.log('');
        });
      }
      
      return products;
    } else {
      console.log('❌ No products found or API error');
      console.log('Response:', response.data);
      return [];
    }
  } catch (error) {
    console.log('❌ Products API error:', error.message);
    return [];
  }
};

// Test with a real product ID
const testCartWithRealProduct = async (productId, token) => {
  console.log(`🛒 Testing cart with real product ID: ${productId}`);
  
  const headers = { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json'
  };
  
  const addOptions = {
    hostname: 'localhost', port: 5000, path: '/api/cart',
    method: 'POST', headers
  };
  const addData = JSON.stringify({ productId, quantity: 1 });
  
  try {
    const response = await makeRequest(addOptions, addData);
    console.log('Add to cart status:', response.status);
    console.log('Add to cart response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Successfully added product to cart');
      return true;
    } else {
      console.log('❌ Failed to add product to cart');
      return false;
    }
  } catch (error) {
    console.log('❌ Cart test error:', error.message);
    return false;
  }
};

// Authenticate
const authenticate = async () => {
  const loginData = JSON.stringify({
    email: 'democustomer1752824171872@gruhapaaka.com',
    password: 'democustomer123'
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

  try {
    const response = await makeRequest(options, loginData);
    if (response.data.success && response.data.data && response.data.data.token) {
      return response.data.data.token;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Main test
const runTest = async () => {
  try {
    const products = await testProducts();
    
    if (products.length > 0) {
      console.log('🔐 Authenticating...');
      const token = await authenticate();
      
      if (token) {
        console.log('✅ Authentication successful\n');
        
        // Test with the first product's real ID
        const firstProduct = products[0];
        const productId = firstProduct._id || firstProduct.id;
        
        await testCartWithRealProduct(productId, token);
      } else {
        console.log('❌ Authentication failed');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🛍️ PRODUCTS API TEST COMPLETE');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTest();
