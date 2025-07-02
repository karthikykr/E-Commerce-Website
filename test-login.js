// Simple test script to verify login functionality
const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');

  // Test Admin Login
  console.log('1. Testing Admin Login...');
  try {
    const adminResponse = await axios.post('http://localhost:5001/api/auth/login', {
      identifier: 'admin001',
      password: 'admin123',
      authMethod: 'admin'
    });

    if (adminResponse.data.success) {
      console.log('✅ Admin login successful!');
      console.log(`   User: ${adminResponse.data.data.user.name}`);
      console.log(`   Role: ${adminResponse.data.data.user.role}`);
      console.log(`   Should redirect to: /admin/dashboard\n`);
    } else {
      console.log('❌ Admin login failed:', adminResponse.data.message);
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
  }

  // Test Customer Login
  console.log('2. Testing Customer Login...');
  try {
    const customerResponse = await axios.post('http://localhost:5001/api/auth/login', {
      identifier: 'john@example.com',
      password: 'password123',
      authMethod: 'email'
    });

    if (customerResponse.data.success) {
      console.log('✅ Customer login successful!');
      console.log(`   User: ${customerResponse.data.data.user.name}`);
      console.log(`   Role: ${customerResponse.data.data.user.role}`);
      console.log(`   Should redirect to: /\n`);
    } else {
      console.log('❌ Customer login failed:', customerResponse.data.message);
    }
  } catch (error) {
    console.log('❌ Customer login error:', error.message);
  }

  // Test Invalid Login
  console.log('3. Testing Invalid Login...');
  try {
    const invalidResponse = await axios.post('http://localhost:5001/api/auth/login', {
      identifier: 'invalid@example.com',
      password: 'wrongpassword',
      authMethod: 'email'
    });

    if (!invalidResponse.data.success) {
      console.log('✅ Invalid login correctly rejected!');
      console.log(`   Message: ${invalidResponse.data.message}\n`);
    } else {
      console.log('❌ Invalid login should have been rejected!');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Invalid login correctly rejected with 401!');
      console.log(`   Message: ${error.response.data.message}\n`);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  console.log('🎉 Login tests completed!');
}

// Run the test
testLogin().catch(console.error);
