const http = require('http');

console.log('🗑️ DEBUGGING REMOVE OPERATION\n');

// Helper function to make HTTP requests with detailed logging
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    console.log(`\n📡 Making ${options.method} request:`);
    console.log(`   URL: ${options.hostname}:${options.port}${options.path}`);
    console.log(`   Headers:`, options.headers);
    if (data) {
      console.log(`   Body: ${data}`);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`\n📥 Response received:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers:`, res.headers);
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
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

// Get a real product and add it to cart
const setupCartWithProduct = async (token) => {
  console.log('🛒 Setting up cart with a real product...');
  
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

// Test remove operation with detailed debugging
const debugRemoveOperation = async (token, productId, productName) => {
  console.log(`\n🗑️ Testing remove operation for: ${productName} (ID: ${productId})`);
  
  // Test 1: Try with body in JSON
  console.log('\n🧪 Test 1: DELETE with JSON body');
  const removeOptions1 = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const removeData1 = JSON.stringify({ productId });
  const removeResponse1 = await makeRequest(removeOptions1, removeData1);
  
  console.log('Result 1:', removeResponse1.data.success ? 'SUCCESS' : 'FAILED');
  if (!removeResponse1.data.success) {
    console.log('Error 1:', removeResponse1.data.message);
    if (removeResponse1.data.errors) {
      console.log('Validation errors 1:', removeResponse1.data.errors);
    }
  }
  
  // If first test failed, try alternative approaches
  if (!removeResponse1.data.success) {
    // Test 2: Try with query parameter
    console.log('\n🧪 Test 2: DELETE with query parameter');
    const removeOptions2 = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/cart?productId=${productId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const removeResponse2 = await makeRequest(removeOptions2);
    console.log('Result 2:', removeResponse2.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Try with form data
    console.log('\n🧪 Test 3: DELETE with form data');
    const removeOptions3 = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/cart',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    
    const removeData3 = `productId=${productId}`;
    const removeResponse3 = await makeRequest(removeOptions3, removeData3);
    console.log('Result 3:', removeResponse3.data.success ? 'SUCCESS' : 'FAILED');
  }
  
  // Check final cart state
  console.log('\n📋 Checking final cart state...');
  const getOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  const getResponse = await makeRequest(getOptions);
  if (getResponse.data.success && getResponse.data.data && getResponse.data.data.cart) {
    const cart = getResponse.data.data.cart;
    console.log(`Final cart: ${cart.items.length} items`);
    if (cart.items.length === 0) {
      console.log('✅ Item was successfully removed!');
      return true;
    } else {
      console.log('❌ Item is still in cart');
      return false;
    }
  }
  
  return false;
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
    console.log('✅ Authentication successful');

    const { productId, productName } = await setupCartWithProduct(token);
    const success = await debugRemoveOperation(token, productId, productName);

    console.log('\n' + '='.repeat(80));
    console.log('🗑️ REMOVE OPERATION DEBUG RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Remove Operation: ${success ? 'WORKING' : 'FAILED'}`);
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

runDebug();
