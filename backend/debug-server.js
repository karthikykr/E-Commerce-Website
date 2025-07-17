console.log('🔍 Debug: Starting server...');

try {
  console.log('🔍 Debug: Loading modules...');
  const express = require('express');
  console.log('✅ Express loaded');
  
  const cors = require('cors');
  console.log('✅ CORS loaded');
  
  const dotenv = require('dotenv');
  console.log('✅ Dotenv loaded');
  
  // Load environment variables
  console.log('🔍 Debug: Loading environment variables...');
  dotenv.config();
  console.log('✅ Environment variables loaded');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('PORT:', process.env.PORT || '5000 (default)');
  
  console.log('🔍 Debug: Creating Express app...');
  const app = express();
  console.log('✅ Express app created');
  
  // Basic middleware
  console.log('🔍 Debug: Setting up middleware...');
  app.use(cors());
  app.use(express.json());
  console.log('✅ Middleware configured');
  
  // Test route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'E-Commerce Backend Server is running!',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Server is healthy',
      timestamp: new Date().toISOString()
    });
  });
  
  const PORT = process.env.PORT || 5000;
  
  console.log('🔍 Debug: Starting server on port', PORT);
  app.listen(PORT, () => {
    console.log(`✅ Server successfully started on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  });
  
} catch (error) {
  console.error('❌ Error starting server:', error);
  console.error('Stack trace:', error.stack);
}
