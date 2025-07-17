const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting E-Commerce Backend Server...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('Please make sure the .env file exists in the backend directory.');
  process.exit(1);
}

console.log('✅ Environment file found');

// Start the server
const serverProcess = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
