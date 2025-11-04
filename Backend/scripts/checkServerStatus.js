// backend/scripts/checkServerStatus.js
const http = require('http');

console.log('🔍 Checking Server Status');
console.log('=========================\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log('✅ Server is running!');
  console.log('Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Health check response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Server is not running or not accessible:');
  console.log('Error:', error.message);
  console.log('\n💡 Start your server with: npm start');
});

req.on('timeout', () => {
  console.log('❌ Request timeout - server may not be running');
  console.log('💡 Start your server with: npm start');
});

req.end();