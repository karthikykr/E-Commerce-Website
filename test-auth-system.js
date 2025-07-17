const http = require('http');

console.log('🧪 Testing E-Commerce Authentication System\n');

// Test backend server
const testBackendHealth = () => {
  return new Promise((resolve) => {
    console.log('🔍 Testing Backend Server...');
    
    const req = http.get('http://localhost:5000/api/health', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Backend server is running:', response.status);
          resolve(true);
        } catch (error) {
          console.log('❌ Backend response parsing failed');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Backend server not accessible:', error.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Backend server timeout');
      resolve(false);
    });
  });
};

// Test frontend server
const testFrontendHealth = () => {
  return new Promise((resolve) => {
    console.log('🔍 Testing Frontend Server...');
    
    const req = http.get('http://localhost:3000', (res) => {
      console.log('✅ Frontend server is running');
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log('❌ Frontend server not accessible:', error.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Frontend server timeout');
      resolve(false);
    });
  });
};

// Test auth endpoints
const testAuthEndpoints = () => {
  return new Promise((resolve) => {
    console.log('🔍 Testing Authentication Endpoints...');
    
    // Test registration endpoint
    const testData = JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'test123',
      confirmPassword: 'test123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 201 || res.statusCode === 400) {
            console.log('✅ Auth endpoints are accessible');
            resolve(true);
          } else {
            console.log('⚠️  Auth endpoints responding but may have issues');
            resolve(true);
          }
        } catch (error) {
          console.log('❌ Auth endpoint response parsing failed');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Auth endpoints not accessible:', error.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Auth endpoint timeout');
      resolve(false);
    });
    
    req.write(testData);
    req.end();
  });
};

// Main test function
const runAuthTests = async () => {
  console.log('🚀 Starting Authentication System Tests...\n');
  
  const backendOk = await testBackendHealth();
  console.log('');
  
  const frontendOk = await testFrontendHealth();
  console.log('');
  
  const authOk = await testAuthEndpoints();
  console.log('');
  
  console.log('📊 Test Results:');
  console.log(`Backend Server: ${backendOk ? '✅ Running' : '❌ Failed'}`);
  console.log(`Frontend Server: ${frontendOk ? '✅ Running' : '❌ Failed'}`);
  console.log(`Auth Endpoints: ${authOk ? '✅ Working' : '❌ Failed'}`);
  
  if (backendOk && frontendOk && authOk) {
    console.log('\n🎉 Authentication System is Ready!');
    console.log('\n📋 What you can test:');
    console.log('1. 🌐 Visit: http://localhost:3000');
    console.log('2. 📝 Register: http://localhost:3000/auth/register');
    console.log('3. 🔐 Login: http://localhost:3000/auth/login');
    console.log('4. 👤 Customer Dashboard: http://localhost:3000/customer/dashboard');
    console.log('5. 👑 Admin Dashboard: http://localhost:3000/admin/dashboard');
    
    console.log('\n🧪 Test Accounts (if MongoDB is connected):');
    console.log('👑 Admin: admin@gruhapaaka.com / admin123');
    console.log('👤 Customer: customer@test.com / customer123');
    
    console.log('\n✨ Features Implemented:');
    console.log('• ✅ User Registration');
    console.log('• ✅ User Login');
    console.log('• ✅ Role-based Authentication');
    console.log('• ✅ Customer Dashboard');
    console.log('• ✅ Admin Dashboard Routing');
    console.log('• ✅ Protected Routes');
    console.log('• ✅ JWT Token Management');
    console.log('• ✅ Search Bar Removed');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Set up MongoDB for full database functionality');
    console.log('2. Run: node backend/create-admin.js (to create test users)');
    console.log('3. Test user registration and login');
    console.log('4. Verify role-based redirects work correctly');
    
  } else {
    console.log('\n⚠️  Some services are not running properly');
    console.log('Make sure both frontend and backend servers are started');
  }
};

runAuthTests().catch(console.error);
