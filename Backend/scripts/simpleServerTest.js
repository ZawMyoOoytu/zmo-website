// backend/scripts/simpleServerTest.js
const http = require('http');
require('dotenv').config();

console.log('🔍 Simple Server Test');
console.log('====================\n');

const postData = JSON.stringify({
  email: 'admin@example.com',
  password: 'password'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Request body:', postData);
console.log('');

const req = http.request(options, (res) => {
  console.log('Response received:');
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n🎉 LOGIN SUCCESSFUL!');
      } else {
        console.log('\n❌ LOGIN FAILED');
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:');
  console.log('Error:', error.message);
  console.log('\n💡 Make sure your backend server is running:');
  console.log('   npm start');
});

req.write(postData);
req.end();