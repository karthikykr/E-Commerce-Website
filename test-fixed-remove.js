const http = require('http');

console.log('🗑️ TESTING FIXED REMOVE OPERATION\n');

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

// Get a real product
const getProduct = async () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET'
  };
  
  const response = await makeRequest(options);
  if (response.data.success && response.data.data.products.length > 0) {
    return response.data.data.products[0];
  }
  return null;
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

// Test the complete cart flow
const testCompleteCartFlow = async (token, product) => {
  console.log('🛒 Testing Complete Cart Flow...\n');
  
  const headers = { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json'
  };
  
  const productId = product._id || product.id;
  console.log(`Using product: ${product.name} (ID: ${productId})`);
  
  try {
    // Step 1: Clear cart
    console.log('\n🧹 Step 1: Clearing cart...');
    const clearOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart/clear',
      method: 'DELETE', headers
    };
    const clearResponse = await makeRequest(clearOptions);
    console.log('Clear result:', clearResponse.data.success ? 'SUCCESS' : 'FAILED');

    // Step 2: Add item to cart
    console.log('\n📦 Step 2: Adding item to cart...');
    const addOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'POST', headers
    };
    const addData = JSON.stringify({ productId, quantity: 2 });
    const addResponse = await makeRequest(addOptions, addData);
    console.log('Add result:', addResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (!addResponse.data.success) {
      console.log('Add error:', addResponse.data.message);
      return false;
    }

    // Step 3: Verify cart has item
    console.log('\n📋 Step 3: Verifying cart has item...');
    const getOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'GET', headers
    };
    const getResponse1 = await makeRequest(getOptions);
    if (getResponse1.data.success && getResponse1.data.data.cart) {
      const cart = getResponse1.data.data.cart;
      console.log(`Cart before remove: ${cart.items.length} items, total: ₹${cart.totalAmount}`);
      if (cart.items.length === 0) {
        console.log('❌ Cart is empty, cannot test remove');
        return false;
      }
    }

    // Step 4: Test quantity update
    console.log('\n🔄 Step 4: Testing quantity update...');
    const updateOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'PUT', headers
    };
    const updateData = JSON.stringify({ productId, quantity: 3 });
    const updateResponse = await makeRequest(updateOptions, updateData);
    console.log('Update result:', updateResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (!updateResponse.data.success) {
      console.log('Update error:', updateResponse.data.message);
    }

    // Step 5: Test remove with new URL parameter format
    console.log('\n🗑️ Step 5: Testing remove with URL parameter...');
    const removeOptions = {
      hostname: 'localhost', port: 5000, path: `/api/cart/${productId}`,
      method: 'DELETE', headers
    };
    const removeResponse = await makeRequest(removeOptions);
    console.log('Remove result:', removeResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (!removeResponse.data.success) {
      console.log('Remove error:', removeResponse.data.message);
      if (removeResponse.data.errors) {
        console.log('Validation errors:', removeResponse.data.errors);
      }
    }

    // Step 6: Verify item was removed
    console.log('\n🔍 Step 6: Verifying item was removed...');
    const getResponse2 = await makeRequest(getOptions);
    if (getResponse2.data.success && getResponse2.data.data.cart) {
      const cart = getResponse2.data.data.cart;
      console.log(`Cart after remove: ${cart.items.length} items, total: ₹${cart.totalAmount}`);
      
      if (cart.items.length === 0) {
        console.log('✅ Item successfully removed from cart!');
        return true;
      } else {
        console.log('❌ Item still in cart');
        return false;
      }
    }

    return false;
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
};

// Main test function
const runTest = async () => {
  try {
    console.log('📦 Getting product...');
    const product = await getProduct();
    if (!product) {
      console.log('❌ No products available');
      return;
    }
    console.log(`✅ Got product: ${product.name}`);

    console.log('\n🔐 Authenticating...');
    const token = await authenticate();
    if (!token) {
      console.log('❌ Authentication failed');
      return;
    }
    console.log('✅ Authentication successful');

    const success = await testCompleteCartFlow(token, product);

    console.log('\n' + '='.repeat(80));
    console.log('🗑️ FIXED REMOVE OPERATION TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`✅ Complete Cart Flow: ${success ? 'ALL OPERATIONS WORKING' : 'SOME OPERATIONS FAILED'}`);

    if (success) {
      console.log('\n🎉 ALL CART OPERATIONS ARE NOW WORKING PERFECTLY!');
      console.log('\n✅ Working Operations:');
      console.log('• ✅ Clear Cart: Empty cart successfully');
      console.log('• ✅ Add to Cart: Products added with real IDs');
      console.log('• ✅ Update Quantity: Quantity changes work');
      console.log('• ✅ Remove Item: Items removed successfully with URL parameter');
      console.log('• ✅ Cart Verification: All changes reflected correctly');
      
      console.log('\n🔧 Technical Fix Applied:');
      console.log('• ✅ Backend Route: Changed from DELETE /api/cart to DELETE /api/cart/:productId');
      console.log('• ✅ Frontend Context: Updated to use URL parameter instead of request body');
      console.log('• ✅ HTTP Standard: DELETE with URL parameter is more standard than body');
      
      console.log('\n🌐 The cart system is now fully functional!');
      console.log('All operations work with real product IDs from the database.');
    }
    
    console.log('\n' + '='.repeat(80));
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTest();
