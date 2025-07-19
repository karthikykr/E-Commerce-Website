const http = require('http');

console.log('🔍 DEBUGGING BACKEND REMOVE OPERATION\n');
console.log('Testing the exact remove operation step by step...\n');

// Helper function to make HTTP requests with detailed logging
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    console.log(`\n📡 Making ${options.method} request:`);
    console.log(`   URL: ${options.hostname}:${options.port}${options.path}`);
    console.log(`   Headers:`, JSON.stringify(options.headers, null, 2));
    if (data) {
      console.log(`   Body: ${data}`);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`\n📥 Response received:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers:`, JSON.stringify(res.headers, null, 2));
        console.log(`   Body: ${responseData}`);
        
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request error: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

// Authenticate and get token
const authenticate = async () => {
  console.log('🔐 Step 1: Authentication...');
  
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
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, loginData);
    if (response.data.success && response.data.data && response.data.data.token) {
      console.log('✅ Authentication successful');
      return response.data.data.token;
    } else {
      console.log('❌ Authentication failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return null;
  }
};

// Setup test cart with a real product
const setupTestCart = async (token) => {
  console.log('\n🛒 Step 2: Setting up test cart...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Get a real product
  const productsOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET'
  };
  
  const productsResponse = await makeRequest(productsOptions);
  if (!productsResponse.data.success || !productsResponse.data.data.products.length) {
    throw new Error('No products available');
  }
  
  const product = productsResponse.data.data.products[0];
  const productId = product._id || product.id;
  
  console.log(`\n📦 Using product: ${product.name}`);
  console.log(`   Product ID: ${productId}`);
  
  // Clear cart first
  const clearOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart/clear',
    method: 'DELETE',
    headers
  };
  
  await makeRequest(clearOptions);
  console.log('✅ Cart cleared');
  
  // Add product to cart
  const addOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'POST',
    headers
  };
  
  const addData = JSON.stringify({ productId, quantity: 2 });
  const addResponse = await makeRequest(addOptions, addData);
  
  if (!addResponse.data.success) {
    throw new Error('Failed to add product to cart');
  }
  
  console.log('✅ Product added to cart successfully');
  
  // Verify cart has the item
  const getOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers
  };
  
  const getResponse = await makeRequest(getOptions);
  if (getResponse.data.success && getResponse.data.data.cart) {
    const cart = getResponse.data.data.cart;
    console.log(`✅ Cart verified: ${cart.items.length} items, total: ₹${cart.totalAmount}`);
    
    if (cart.items.length > 0) {
      const item = cart.items[0];
      console.log(`   Item: ${item.product.name} (Qty: ${item.quantity})`);
    }
  }
  
  return { productId, productName: product.name };
};

// Test remove operation with multiple methods
const testRemoveOperation = async (token, productId, productName) => {
  console.log(`\n🗑️ Step 3: Testing remove operation for: ${productName}`);
  console.log(`   Product ID: ${productId}`);
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Method 1: DELETE with query parameter (current frontend method)
  console.log('\n🧪 Method 1: DELETE with query parameter');
  const removeOptions1 = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/cart?productId=${productId}`,
    method: 'DELETE',
    headers
  };
  
  const removeResponse1 = await makeRequest(removeOptions1);
  console.log(`Result 1: ${removeResponse1.data.success ? 'SUCCESS' : 'FAILED'}`);
  
  if (!removeResponse1.data.success) {
    console.log(`Error 1: ${removeResponse1.data.message || 'Unknown error'}`);
    
    // If method 1 failed, try method 2
    console.log('\n🧪 Method 2: DELETE with request body');
    const removeOptions2 = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/cart',
      method: 'DELETE',
      headers
    };
    
    const removeData2 = JSON.stringify({ productId });
    const removeResponse2 = await makeRequest(removeOptions2, removeData2);
    console.log(`Result 2: ${removeResponse2.data.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (!removeResponse2.data.success) {
      console.log(`Error 2: ${removeResponse2.data.message || 'Unknown error'}`);
      return false;
    }
  }
  
  // Verify item was removed
  console.log('\n🔍 Verifying item was removed...');
  const getOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers
  };
  
  const getResponse = await makeRequest(getOptions);
  if (getResponse.data.success && getResponse.data.data.cart) {
    const cart = getResponse.data.data.cart;
    console.log(`Final cart: ${cart.items.length} items, total: ₹${cart.totalAmount}`);
    
    if (cart.items.length === 0) {
      console.log('✅ Item successfully removed from cart!');
      return true;
    } else {
      console.log('❌ Item still in cart');
      cart.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.product.name} (Qty: ${item.quantity})`);
      });
      return false;
    }
  }
  
  return false;
};

// Main debug function
const runDebug = async () => {
  try {
    const token = await authenticate();
    if (!token) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    const { productId, productName } = await setupTestCart(token);
    const success = await testRemoveOperation(token, productId, productName);

    console.log('\n' + '='.repeat(80));
    console.log('🔍 BACKEND REMOVE OPERATION DEBUG RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Remove Operation: ${success ? 'WORKING' : 'FAILED'}`);
    
    if (success) {
      console.log('\n🎉 Backend remove operation is working correctly!');
      console.log('The issue might be in the frontend implementation or request format.');
    } else {
      console.log('\n❌ Backend remove operation is failing.');
      console.log('Need to investigate the backend route or database operations.');
    }
    
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

runDebug();
