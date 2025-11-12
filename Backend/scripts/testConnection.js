// backend/scripts/testConnection.js
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  console.log('🔍 Comprehensive MongoDB Connection Test');
  console.log('=======================================\n');

  // 1. Check environment variables
  console.log('1. Environment Variables Check:');
  console.log('   MONGODB_URI exists:', !!process.env.MONGODB_URI);
  
  if (process.env.MONGODB_URI) {
    const safeURI = process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
    console.log('   Connection string:', safeURI);
    
    // Extract details
    const match = process.env.MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
    if (match) {
      const [, username, , host, database] = match;
      console.log('   Username:', username);
      console.log('   Host:', host);
      console.log('   Database:', database);
    }
  } else {
    console.log('   ❌ MONGODB_URI is missing!');
    console.log('   💡 Create a .env file with: MONGODB_URI=your_connection_string');
    return;
  }

  console.log('\n2. Testing MongoDB Connection...');
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('   ✅ SUCCESS: MongoDB Connected!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    console.log('   Ready State:', conn.connection.readyState === 1 ? 'Connected' : 'Disconnected');

    // Test database operations
    console.log('\n3. Testing Database Operations...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('   Collections found:', collections.length);
    
    // Check if we can create a test document
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await Test.create({ name: 'test-connection' });
    console.log('   ✅ Can write to database');
    
    await Test.deleteOne({ name: 'test-connection' });
    console.log('   ✅ Can delete from database');

    console.log('\n🎉 All tests passed! Your MongoDB connection is working correctly.');

  } catch (error) {
    console.log('   ❌ FAILED: MongoDB connection error');
    console.log('   Error name:', error.name);
    console.log('   Error message:', error.message);
    console.log('   Error code:', error.code);

    console.log('\n🔧 REQUIRED FIXES:');
    console.log('   1. 🌐 Go to MongoDB Atlas → Network Access → Add IP Address → "0.0.0.0/0"');
    console.log('   2. 👤 Go to MongoDB Atlas → Database Access → Verify user "zmo" exists');
    console.log('   3. 🗄️  Go to MongoDB Atlas → Database → Check cluster "zmowebsite" is active');
    console.log('   4. 🔑 Make sure password in MONGODB_URI matches the user password in Atlas');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

testConnection();