const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🚀 Starting simple test server...');
console.log('Environment variables loaded');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce Backend Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: {
      server: 'E-Commerce Backend',
      version: '1.0.0',
      endpoints: [
        'GET / - Server info',
        'GET /api/health - Health check',
        'GET /api/test - Test endpoint'
      ]
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
