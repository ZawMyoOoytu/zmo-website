const mongoose = require('mongoose');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal-website');
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database: personal-website');
    console.log('📍 Host: 127.0.0.1:27017');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure MongoDB is installed');
    console.log('2. Start MongoDB with: mongod --dbpath="C:\\data\\db"');
    console.log('3. Check if MongoDB service is running');
    process.exit(1);
  }
};

initializeDatabase();