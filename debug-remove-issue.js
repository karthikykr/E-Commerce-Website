const http = require('http');

console.log('🔍 DEBUGGING REMOVE BUTTON ISSUE\n');
console.log('Testing the exact remove operation that the frontend is trying to perform...\n');

// Helper function to make HTTP requests with detailed logging
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    console.log(`📡 Making ${options.method} request to ${options.hostname}:${options.port}${options.path}`);
    if (data) {
      console.log(`📦 Request body: ${data}`);
    }
    console.log(`🔧 Headers:`, options.headers);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`📥 Response status: ${res.statusCode}`);
        console.log(`📥 Response body: ${responseData}`);
        
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
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

// Get a real product and add it to cart
const setupTestCart = async (token) => {
  console.log('🛒 Setting up test cart...');
  
  // Get products first
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
  
  console.log(`\n📦 Using product: ${product.name} (ID: ${productId})`);
  
  // Clear cart first
  const clearOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart/clear',
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  await makeRequest(clearOptions);
  console.log('✅ Cart cleared');
  
  // Add product to cart
  const addOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const addData = JSON.stringify({ productId, quantity: 1 });
  const addResponse = await makeRequest(addOptions, addData);
  
  if (!addResponse.data.success) {
    throw new Error('Failed to add product to cart');
  }
  
  console.log('✅ Product added to cart successfully');
  return { productId, productName: product.name };
};

// Test the exact remove operation that frontend performs
const testRemoveOperation = async (token, productId, productName) => {
  console.log(`\n🗑️ Testing remove operation for: ${productName} (ID: ${productId})`);
  
  // This is exactly what the frontend CartContext does
  const removeOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const removeData = JSON.stringify({ productId });
  
  console.log('\n🔧 Testing the exact frontend request...');
  const removeResponse = await makeRequest(removeOptions, removeData);
  
  console.log('\n📊 Remove operation result:');
  console.log(`Status: ${removeResponse.status}`);
  console.log(`Success: ${removeResponse.data.success || 'undefined'}`);
  console.log(`Message: ${removeResponse.data.message || 'undefined'}`);
  
  if (removeResponse.status === 404) {
    console.log('❌ ROUTE NOT FOUND - This is the issue!');
    console.log('The backend route DELETE /api/cart is not being found');
    return false;
  } else if (removeResponse.data.success) {
    console.log('✅ Remove operation successful');
    return true;
  } else {
    console.log('⚠️ Remove operation failed but route exists');
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
      'Content-Type': 'application/json'
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

// Main debug function
const runDebug = async () => {
  try {
    console.log('🔐 Authenticating...');
    const token = await authenticate();
    if (!token) {
      console.log('❌ Authentication failed');
      return;
    }
    console.log('✅ Authentication successful\n');

    const { productId, productName } = await setupTestCart(token);
    const success = await testRemoveOperation(token, productId, productName);

    console.log('\n' + '='.repeat(80));
    console.log('🔍 REMOVE BUTTON DEBUG RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Remove Operation: ${success ? 'WORKING' : 'FAILED'}`);
    
    if (!success) {
      console.log('\n🔧 POSSIBLE SOLUTIONS:');
      console.log('1. Check if backend server is running on port 5000');
      console.log('2. Verify the DELETE /api/cart route exists in backend');
      console.log('3. Check if there are any middleware issues');
      console.log('4. Restart the backend server to pick up route changes');
    } else {
      console.log('\n✅ Remove operation is working correctly!');
      console.log('The issue might be in the frontend implementation.');
    }
    
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

runDebug();
