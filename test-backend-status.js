const http = require('http');

console.log('🔍 TESTING BACKEND SERVER STATUS\n');

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

    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

// Test backend server
const testBackendServer = async () => {
  console.log('🔧 Testing backend server on port 5000...');
  
  try {
    // Test health check
    const healthOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    };
    
    const healthResponse = await makeRequest(healthOptions);
    console.log('Health check:', healthResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // Test products API
    const productsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET'
    };
    
    const productsResponse = await makeRequest(productsOptions);
    console.log('Products API:', productsResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    if (productsResponse.status === 200 && productsResponse.data.success) {
      console.log(`Found ${productsResponse.data.data.products.length} products`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('❌ Backend server error:', error.message);
    return false;
  }
};

// Test authentication
const testAuth = async () => {
  console.log('\n🔐 Testing authentication...');
  
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
    console.log('Auth API:', response.status === 200 ? 'SUCCESS' : 'FAILED');
    
    if (response.data.success && response.data.data && response.data.data.token) {
      console.log('✅ Authentication working');
      return response.data.data.token;
    }
    
    return null;
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    return null;
  }
};

// Test cart routes specifically
const testCartRoutes = async (token) => {
  console.log('\n🛒 Testing cart routes...');
  
  const headers = { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json'
  };
  
  try {
    // Test GET cart
    const getOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'GET', headers
    };
    const getResponse = await makeRequest(getOptions);
    console.log('GET /api/cart:', getResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // Test DELETE cart (the problematic route)
    const deleteOptions = {
      hostname: 'localhost', port: 5000, path: '/api/cart',
      method: 'DELETE', headers
    };
    const deleteData = JSON.stringify({ productId: 'test-id' });
    const deleteResponse = await makeRequest(deleteOptions, deleteData);
    console.log('DELETE /api/cart:', deleteResponse.status !== 404 ? 'ROUTE EXISTS' : 'ROUTE NOT FOUND');
    
    if (deleteResponse.status === 404) {
      console.log('❌ DELETE route not found - this is the issue!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Cart routes error:', error.message);
    return false;
  }
};

// Main test
const runTest = async () => {
  try {
    const backendWorking = await testBackendServer();
    
    if (!backendWorking) {
      console.log('\n❌ Backend server is not working properly');
      return;
    }
    
    const token = await testAuth();
    
    if (!token) {
      console.log('\n❌ Authentication is not working');
      return;
    }
    
    const cartRoutesWorking = await testCartRoutes(token);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 BACKEND SERVER STATUS');
    console.log('='.repeat(60));
    console.log(`✅ Backend Server: ${backendWorking ? 'WORKING' : 'NOT WORKING'}`);
    console.log(`✅ Authentication: ${token ? 'WORKING' : 'NOT WORKING'}`);
    console.log(`✅ Cart Routes: ${cartRoutesWorking ? 'WORKING' : 'NOT WORKING'}`);
    
    if (backendWorking && token && cartRoutesWorking) {
      console.log('\n🎉 Backend server is fully functional!');
    } else {
      console.log('\n⚠️ Backend server has issues that need to be resolved.');
    }
    
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTest();
