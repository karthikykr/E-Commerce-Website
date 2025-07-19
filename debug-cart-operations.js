const http = require('http');

console.log('🔍 DEBUGGING CART OPERATIONS\n');

// Helper function to make HTTP requests with detailed logging
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    console.log(`Making ${options.method} request to ${options.hostname}:${options.port}${options.path}`);
    if (data) {
      console.log('Request body:', data);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        console.log('Response body:', responseData);
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.log('Request error:', error.message);
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

// Test authentication
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
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  try {
    const response = await makeRequest(options, loginData);
    if (response.data.success && response.data.data && response.data.data.token) {
      console.log('✅ Login successful\n');
      return response.data.data.token;
    } else {
      console.log('❌ Login failed\n');
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message, '\n');
    return null;
  }
};

// Debug cart operations
const debugCartOperations = async (token) => {
  console.log('🛒 Step 2: Debugging Cart Operations...\n');
  
  const headers = { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json'
  };
  
  try {
    // Test 1: Add item to cart
    console.log('📦 Test 1: Adding item to cart...');
    const addOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'POST', headers
    };
    const addData = JSON.stringify({ productId: '1', quantity: 2 });
    const addResponse = await makeRequest(addOptions, addData);
    console.log('Add result:', addResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (!addResponse.data.success) {
      console.log('Add error:', addResponse.data.message);
      if (addResponse.data.errors) {
        console.log('Validation errors:', addResponse.data.errors);
      }
    }
    console.log('');

    // Test 2: Get cart
    console.log('📋 Test 2: Getting cart...');
    const getOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'GET', headers
    };
    const getResponse = await makeRequest(getOptions);
    console.log('Get result:', getResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (getResponse.data.success && getResponse.data.data && getResponse.data.data.cart) {
      const cart = getResponse.data.data.cart;
      console.log(`Cart items: ${cart.items ? cart.items.length : 0}`);
      console.log(`Total items: ${cart.totalItems}`);
      console.log(`Total amount: ${cart.totalAmount}`);
    }
    console.log('');

    // Test 3: Update quantity
    console.log('🔄 Test 3: Updating quantity...');
    const updateOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'PUT', headers
    };
    const updateData = JSON.stringify({ productId: '1', quantity: 3 });
    const updateResponse = await makeRequest(updateOptions, updateData);
    console.log('Update result:', updateResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (!updateResponse.data.success) {
      console.log('Update error:', updateResponse.data.message);
      if (updateResponse.data.errors) {
        console.log('Validation errors:', updateResponse.data.errors);
      }
    }
    console.log('');

    // Test 4: Remove item
    console.log('🗑️ Test 4: Removing item...');
    const removeOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'DELETE', headers
    };
    const removeData = JSON.stringify({ productId: '1' });
    const removeResponse = await makeRequest(removeOptions, removeData);
    console.log('Remove result:', removeResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (!removeResponse.data.success) {
      console.log('Remove error:', removeResponse.data.message);
      if (removeResponse.data.errors) {
        console.log('Validation errors:', removeResponse.data.errors);
      }
    }
    console.log('');

    return true;
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
    return false;
  }
};

// Main debug function
const runDebug = async () => {
  try {
    const token = await authenticate();
    if (!token) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    await debugCartOperations(token);

    console.log('='.repeat(60));
    console.log('🔍 DEBUG COMPLETE');
    console.log('Check the detailed logs above to identify issues');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Debug failed:', error);
  }
};

runDebug();
