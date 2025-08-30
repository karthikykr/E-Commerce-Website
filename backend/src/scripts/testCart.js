const axios = require('axios');

async function testCartAPI() {
  try {
    console.log('Testing Cart API...');

    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(
      'http://localhost:5001/api/auth/login',
      {
        identifier: 'john@example.com',
        password: 'password123',
        authMethod: 'email',
      }
    );

    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Get products to test with
    console.log('2. Getting products...');
    const productsResponse = await axios.get(
      'http://localhost:5001/api/products'
    );

    if (
      !productsResponse.data.success ||
      !productsResponse.data.data.products.length
    ) {
      console.error('No products found');
      return;
    }

    const product = productsResponse.data.data.products[0];
    console.log('✅ Found product:', product.name);

    // Test adding to cart
    console.log('3. Adding product to cart...');
    const addToCartResponse = await axios.post(
      'http://localhost:5001/api/cart',
      {
        productId: product._id,
        quantity: 2,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (addToCartResponse.data.success) {
      console.log('✅ Product added to cart successfully');
      console.log('Cart response:', addToCartResponse.data);
    } else {
      console.error(
        '❌ Failed to add product to cart:',
        addToCartResponse.data
      );
    }

    // Test getting cart
    console.log('4. Getting cart...');
    const cartResponse = await axios.get('http://localhost:5001/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (cartResponse.data.success) {
      console.log('✅ Cart retrieved successfully');
      console.log('Cart items:', cartResponse.data.data.items.length);
    } else {
      console.error('❌ Failed to get cart:', cartResponse.data);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCartAPI();
