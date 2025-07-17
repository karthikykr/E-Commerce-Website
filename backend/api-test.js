const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  }
};

const testProduct = {
  name: 'Test Product',
  description: 'This is a test product for API testing',
  shortDescription: 'Test product',
  price: 29.99,
  originalPrice: 39.99,
  stockQuantity: 100,
  weight: {
    value: 500,
    unit: 'g'
  },
  tags: ['test', 'sample'],
  images: [{
    url: 'https://via.placeholder.com/300',
    alt: 'Test product image',
    isPrimary: true
  }]
};

let authToken = '';
let userId = '';
let productId = '';
let categoryId = '';

// Helper function to make authenticated requests
const authRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testHealthCheck = async () => {
  try {
    console.log('🔍 Testing health check...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  try {
    console.log('🔍 Testing user registration...');
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registration successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data || error.message);
    return false;
  }
};

const testUserLogin = async () => {
  try {
    console.log('🔍 Testing user login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = response.data.token;
    userId = response.data.user._id;
    console.log('✅ User login successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateCategory = async () => {
  try {
    console.log('🔍 Testing category creation...');
    const categoryData = {
      name: 'Test Category',
      description: 'This is a test category',
      slug: 'test-category'
    };
    
    const response = await authRequest('post', '/categories', categoryData);
    categoryId = response.data.data._id;
    console.log('✅ Category creation successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Category creation failed:', error.response?.data || error.message);
    return false;
  }
};

const testCreateProduct = async () => {
  try {
    console.log('🔍 Testing product creation...');
    const productData = {
      ...testProduct,
      category: categoryId
    };
    
    const response = await authRequest('post', '/products', productData);
    productId = response.data.data._id;
    console.log('✅ Product creation successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Product creation failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetProducts = async () => {
  try {
    console.log('🔍 Testing get products...');
    const response = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Get products successful:', `Found ${response.data.data.length} products`);
    return true;
  } catch (error) {
    console.error('❌ Get products failed:', error.response?.data || error.message);
    return false;
  }
};

const testAddToCart = async () => {
  try {
    console.log('🔍 Testing add to cart...');
    const response = await authRequest('post', '/cart/add', {
      productId: productId,
      quantity: 2
    });
    console.log('✅ Add to cart successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Add to cart failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetCart = async () => {
  try {
    console.log('🔍 Testing get cart...');
    const response = await authRequest('get', '/cart');
    console.log('✅ Get cart successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Get cart failed:', error.response?.data || error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Create Category', fn: testCreateCategory },
    { name: 'Create Product', fn: testCreateProduct },
    { name: 'Get Products', fn: testGetProducts },
    { name: 'Add to Cart', fn: testAddToCart },
    { name: 'Get Cart', fn: testGetCart }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
