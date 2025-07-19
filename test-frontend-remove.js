const http = require('http');

console.log('🌐 TESTING FRONTEND REMOVE OPERATION\n');
console.log('Testing the exact same operation through the frontend (port 3000)...\n');

// Helper function to make HTTP requests
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    console.log(`📡 Making ${options.method} request to ${options.hostname}:${options.port}${options.path}`);
    if (data) {
      console.log(`📦 Request body: ${data}`);
    }
    
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

// Authenticate through frontend
const authenticateFrontend = async () => {
  console.log('🔐 Step 1: Frontend Authentication...');
  
  const loginData = JSON.stringify({
    email: 'democustomer1752824171872@gruhapaaka.com',
    password: 'democustomer123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, loginData);
    if (response.data.success && response.data.data && response.data.data.token) {
      console.log('✅ Frontend authentication successful');
      return response.data.data.token;
    } else {
      console.log('❌ Frontend authentication failed');
      return null;
    }
  } catch (error) {
    console.log('❌ Frontend authentication error:', error.message);
    return null;
  }
};

// Setup cart through frontend
const setupFrontendCart = async (token) => {
  console.log('\n🛒 Step 2: Setting up cart through frontend...');
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Cookie': `auth-token=${token}`
  };
  
  // Get products through frontend
  const productsOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET',
    headers
  };
  
  const productsResponse = await makeRequest(productsOptions);
  if (!productsResponse.data.success || !productsResponse.data.data.products.length) {
    throw new Error('No products available through frontend');
  }
  
  const product = productsResponse.data.data.products[0];
  const productId = product._id || product.id;
  
  console.log(`📦 Using product: ${product.name} (ID: ${productId})`);
  
  // Clear cart through frontend
  const clearOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cart/clear',
    method: 'DELETE',
    headers
  };
  
  await makeRequest(clearOptions);
  console.log('✅ Cart cleared through frontend');
  
  // Add product through frontend
  const addOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cart',
    method: 'POST',
    headers
  };
  
  const addData = JSON.stringify({ productId, quantity: 1 });
  const addResponse = await makeRequest(addOptions, addData);
  
  if (!addResponse.data.success) {
    throw new Error('Failed to add product through frontend');
  }
  
  console.log('✅ Product added through frontend');
  return { productId, productName: product.name };
};

// Test remove through frontend
const testFrontendRemove = async (token, productId, productName) => {
  console.log(`\n🗑️ Step 3: Testing remove through frontend for: ${productName}`);
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Cookie': `auth-token=${token}`
  };
  
  // Test remove through frontend API
  const removeOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/cart?productId=${productId}`,
    method: 'DELETE',
    headers
  };
  
  const removeResponse = await makeRequest(removeOptions);
  console.log(`Remove result: ${removeResponse.data.success ? 'SUCCESS' : 'FAILED'}`);
  
  if (!removeResponse.data.success) {
    console.log(`Remove error: ${removeResponse.data.message || 'Unknown error'}`);
    return false;
  }
  
  // Verify through frontend
  const getOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cart',
    method: 'GET',
    headers
  };
  
  const getResponse = await makeRequest(getOptions);
  if (getResponse.data.success && getResponse.data.data && getResponse.data.data.cart) {
    const cart = getResponse.data.data.cart;
    console.log(`Final cart: ${cart.items.length} items, total: ₹${cart.totalAmount}`);
    
    if (cart.items.length === 0) {
      console.log('✅ Item successfully removed through frontend!');
      return true;
    } else {
      console.log('❌ Item still in cart');
      return false;
    }
  }
  
  return false;
};

// Main test function
const runTest = async () => {
  try {
    const token = await authenticateFrontend();
    if (!token) {
      console.log('❌ Cannot proceed without frontend authentication');
      return;
    }

    const { productId, productName } = await setupFrontendCart(token);
    const success = await testFrontendRemove(token, productId, productName);

    console.log('\n' + '='.repeat(80));
    console.log('🌐 FRONTEND REMOVE OPERATION TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Frontend Remove Operation: ${success ? 'WORKING' : 'FAILED'}`);
    
    if (success) {
      console.log('\n🎉 Frontend remove operation is working correctly!');
      console.log('Both backend and frontend remove operations are functional.');
      console.log('The issue might be in the browser UI or React state management.');
    } else {
      console.log('\n❌ Frontend remove operation is failing.');
      console.log('There might be an issue with the frontend API routes.');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify React state is updating correctly');
    console.log('3. Check if toast notifications are showing');
    console.log('4. Ensure cart context is refreshing after remove');
    
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

runTest();
