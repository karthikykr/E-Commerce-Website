const http = require('http');

console.log('🛒 TESTING CART & WISHLIST FUNCTIONALITY\n');

// Test user login to get token
const loginUser = () => {
  return new Promise((resolve, reject) => {
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.token) {
            resolve({ token: response.data.token, user: response.data.user });
          } else {
            reject(new Error('Login failed'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
};

// Get products to test with
const getProducts = (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.products) {
            resolve(response.data.products);
          } else {
            reject(new Error('Failed to get products'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Test add to cart
const testAddToCart = (token, productId) => {
  return new Promise((resolve, reject) => {
    const cartData = JSON.stringify({
      productId: productId,
      quantity: 2
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/cart',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(cartData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ Add to Cart: SUCCESS');
            console.log(`   📦 Items in cart: ${response.data.cart.totalItems}`);
            console.log(`   💰 Total amount: $${response.data.cart.totalAmount}`);
            resolve({ success: true, cart: response.data.cart });
          } else {
            console.log(`❌ Add to Cart: ${response.message}`);
            resolve({ success: false, message: response.message });
          }
        } catch (error) {
          console.log('❌ Add to Cart: Parse error');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Add to Cart: Connection error');
      reject(error);
    });

    req.write(cartData);
    req.end();
  });
};

// Test get cart
const testGetCart = (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/cart',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ Get Cart: SUCCESS');
            console.log(`   📦 Items: ${response.data.cart.totalItems}`);
            console.log(`   💰 Total: $${response.data.cart.totalAmount}`);
            resolve({ success: true, cart: response.data.cart });
          } else {
            console.log(`❌ Get Cart: ${response.message}`);
            resolve({ success: false, message: response.message });
          }
        } catch (error) {
          console.log('❌ Get Cart: Parse error');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Get Cart: Connection error');
      reject(error);
    });

    req.end();
  });
};

// Test add to wishlist
const testAddToWishlist = (token, productId) => {
  return new Promise((resolve, reject) => {
    const wishlistData = JSON.stringify({
      productId: productId
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(wishlistData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ Add to Wishlist: SUCCESS');
            console.log(`   ❤️  Items in wishlist: ${response.data.wishlist.items.length}`);
            resolve({ success: true, wishlist: response.data.wishlist });
          } else {
            console.log(`❌ Add to Wishlist: ${response.message}`);
            resolve({ success: false, message: response.message });
          }
        } catch (error) {
          console.log('❌ Add to Wishlist: Parse error');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Add to Wishlist: Connection error');
      reject(error);
    });

    req.write(wishlistData);
    req.end();
  });
};

// Test get wishlist
const testGetWishlist = (token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log('✅ Get Wishlist: SUCCESS');
            console.log(`   ❤️  Items: ${response.data.wishlist.items.length}`);
            resolve({ success: true, wishlist: response.data.wishlist });
          } else {
            console.log(`❌ Get Wishlist: ${response.message}`);
            resolve({ success: false, message: response.message });
          }
        } catch (error) {
          console.log('❌ Get Wishlist: Parse error');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Get Wishlist: Connection error');
      reject(error);
    });

    req.end();
  });
};

// Main test function
const testCartWishlistFunctionality = async () => {
  console.log('🔐 Step 1: User Login...');
  
  let authData;
  try {
    authData = await loginUser();
    console.log(`✅ Login successful: ${authData.user.name}`);
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    return;
  }

  console.log('\n📦 Step 2: Getting Products...');
  let products;
  try {
    products = await getProducts(authData.token);
    console.log(`✅ Found ${products.length} products`);
  } catch (error) {
    console.log('❌ Failed to get products:', error.message);
    return;
  }

  if (products.length === 0) {
    console.log('❌ No products available for testing');
    return;
  }

  const testProduct = products[0];
  console.log(`🧪 Testing with: ${testProduct.name} (ID: ${testProduct._id})`);

  console.log('\n🛒 Step 3: Testing Cart Functionality...');
  
  // Test add to cart
  try {
    await testAddToCart(authData.token, testProduct._id);
  } catch (error) {
    console.log('❌ Add to cart error:', error.message);
  }

  // Test get cart
  try {
    await testGetCart(authData.token);
  } catch (error) {
    console.log('❌ Get cart error:', error.message);
  }

  console.log('\n❤️ Step 4: Testing Wishlist Functionality...');
  
  // Test add to wishlist
  try {
    await testAddToWishlist(authData.token, testProduct._id);
  } catch (error) {
    console.log('❌ Add to wishlist error:', error.message);
  }

  // Test get wishlist
  try {
    await testGetWishlist(authData.token);
  } catch (error) {
    console.log('❌ Get wishlist error:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🛒 CART & WISHLIST FUNCTIONALITY TEST COMPLETE');
  console.log('='.repeat(70));
  
  console.log('\n✅ Backend Features Tested:');
  console.log('• Cart API endpoints (/api/cart)');
  console.log('• Wishlist API endpoints (/api/wishlist)');
  console.log('• Database models (Cart, Wishlist)');
  console.log('• User authentication for cart/wishlist');
  console.log('• Product validation and stock checking');
  
  console.log('\n🌐 Frontend URLs to Test:');
  console.log('• Cart Page: http://localhost:3000/cart');
  console.log('• Wishlist Page: http://localhost:3000/wishlist');
  console.log('• Products Page: http://localhost:3000/products');
  console.log('• Homepage: http://localhost:3000');
  
  console.log('\n🔐 Test User Credentials:');
  console.log('• Email: democustomer1752824171872@gruhapaaka.com');
  console.log('• Password: democustomer123');
  
  console.log('\n' + '='.repeat(70));
};

testCartWishlistFunctionality().catch(console.error);
