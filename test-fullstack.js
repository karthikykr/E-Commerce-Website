// Simple test without external dependencies
const http = require('http');

console.log('🧪 Testing Full Stack E-Commerce Application\n');

const testBackend = async () => {
  return new Promise((resolve) => {
    console.log('🔍 Testing Backend Server...');

    const req = http.get('http://localhost:5000/api/health', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Backend health check:', response.status);
          resolve(true);
        } catch (error) {
          console.log('❌ Backend response parsing failed');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Backend test failed:', error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Backend test timeout');
      resolve(false);
    });
  });
};

const testFrontend = async () => {
  return new Promise((resolve) => {
    console.log('🔍 Testing Frontend Server...');

    const req = http.get('http://localhost:3000', (res) => {
      console.log('✅ Frontend server is responding');
      resolve(true);
    });

    req.on('error', (error) => {
      console.log('❌ Frontend test failed:', error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Frontend test timeout');
      resolve(false);
    });
  });
};

const runTests = async () => {
  console.log('🚀 Starting Full Stack Tests...\n');
  
  const backendOk = await testBackend();
  console.log('');
  
  const frontendOk = await testFrontend();
  console.log('');
  
  console.log('📊 Test Results:');
  console.log(`Backend: ${backendOk ? '✅ Running' : '❌ Failed'}`);
  console.log(`Frontend: ${frontendOk ? '✅ Running' : '❌ Failed'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 Full Stack Application is Running Successfully!');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend API: http://localhost:5000');
    console.log('🔍 Health Check: http://localhost:5000/api/health');
  } else {
    console.log('\n⚠️  Some services are not running properly');
  }
};

runTests().catch(console.error);
