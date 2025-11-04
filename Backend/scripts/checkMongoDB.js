// backend/scripts/checkMongoDB.js
const mongoose = require('mongoose');

const checkMongoDBConnection = async () => {
  console.log('🔍 MongoDB Connection Diagnostic Tool');
  console.log('=====================================\n');

  // Check environment variable
  console.log('1. Checking MONGODB_URI environment variable...');
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI is not set in environment variables');
    console.log('💡 Make sure you have a .env file with: MONGODB_URI=your_connection_string');
    return;
  }

  // Show safe connection string (without password)
  const safeURI = process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
  console.log('✅ MONGODB_URI is set:', safeURI);

  // Extract details from connection string
  const match = process.env.MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
  if (match) {
    const [, username, , host, database] = match;
    console.log('📊 Connection Details:');
    console.log('   Username:', username);
    console.log('   Host:', host);
    console.log('   Database:', database);
  }

  console.log('\n2. Testing MongoDB Atlas connection...');

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ SUCCESS: MongoDB Atlas Connected!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    console.log('   Ready State:', conn.connection.readyState === 1 ? 'Connected' : 'Disconnected');

    // Test basic operations
    console.log('\n3. Testing database operations...');
    
    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('   Collections found:', collections.length);
    collections.forEach(collection => {
      console.log('     -', collection.name);
    });

    // Check if users collection exists and has data
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log('   Total users in database:', userCount);

    // Check for admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (adminUser) {
      console.log('   ✅ Admin user exists:', adminUser.email);
    } else {
      console.log('   ❌ Admin user not found');
    }

  } catch (error) {
    console.log('❌ FAILED: MongoDB connection error');
    console.log('   Error name:', error.name);
    console.log('   Error message:', error.message);
    console.log('   Error code:', error.code);

    // Specific error handling
    if (error.name === 'MongoServerError') {
      switch (error.code) {
        case 8000:
          console.log('\n🔐 AUTHENTICATION FAILED');
          console.log('   • Check if username "zmo" exists in MongoDB Atlas');
          console.log('   • Verify password "1234" is correct');
          console.log('   • Go to: Atlas → Database Access → Check user "zmo"');
          break;
        case 13:
          console.log('\n🚫 UNAUTHORIZED');
          console.log('   • User "zmo" may not have correct permissions');
          console.log('   • Go to: Atlas → Database Access → Edit "zmo"');
          console.log('   • Set permissions to "Read and write to any database"');
          break;
        case 18:
          console.log('\n🔐 AUTHENTICATION FAILED');
          console.log('   • Wrong username or password');
          break;
      }
    } else if (error.name === 'MongoNetworkError') {
      console.log('\n🌐 NETWORK ERROR');
      console.log('   • Check your internet connection');
      console.log('   • IP address may not be whitelisted in MongoDB Atlas');
      console.log('   • Go to: Atlas → Network Access → Add IP Address');
    }

    console.log('\n🔧 QUICK FIXES:');
    console.log('   1. Go to MongoDB Atlas → Network Access → Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)');
    console.log('   2. Go to MongoDB Atlas → Database Access → Verify user "zmo" exists with correct password');
    console.log('   3. Go to MongoDB Atlas → Database → Check if cluster "zmowebsite" is active and not paused');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📪 Connection closed');
    }
  }
};

// Run the diagnostic
checkMongoDBConnection();