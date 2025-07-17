const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 E-Commerce Backend Server is running!',
    timestamp: new Date().toISOString(),
    server: 'Express.js',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API Information',
    data: {
      name: 'E-Commerce Backend API',
      version: '1.0.0',
      description: 'Complete e-commerce backend with MongoDB',
      endpoints: {
        health: '/api/health',
        info: '/api/info',
        auth: '/api/auth/*',
        products: '/api/products/*',
        cart: '/api/cart/*',
        orders: '/api/orders/*'
      },
      features: [
        'User Authentication',
        'Product Management',
        'Shopping Cart',
        'Order Processing',
        'Admin Panel',
        'Reviews & Ratings'
      ]
    }
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('🚀 E-Commerce Backend Server Started!');
  console.log('================================');
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API Info: http://localhost:${PORT}/api/info`);
  console.log('================================');
  console.log('Server is ready to accept connections!');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
