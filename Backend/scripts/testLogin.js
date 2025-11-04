// backend/scripts/testLogin.js
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔐 Testing login API...');
    console.log('Email: admin@example.com');
    console.log('Password: password\n');
    
    const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
      email: 'admin@example.com',
      password: 'password'
    });
    
    console.log('✅ Login API response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success) {
      console.log('\n🎉 LOGIN SUCCESSFUL!');
      console.log('Token received:', response.data.data.token ? '✅ YES' : '❌ NO');
      console.log('User data:', response.data.data.user ? '✅ YES' : '❌ NO');
      console.log('User email:', response.data.data.user?.email);
      console.log('User role:', response.data.data.user?.role);
      
      console.log('\n📝 You can now login to the admin panel with:');
      console.log('   Email: admin@example.com');
      console.log('   Password: password');
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ Login API failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data?.message);
      console.log('Full error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received. Is the backend server running?');
      console.log('Start your backend with: npm start');
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();