// backend/config/database.js
const mongoose = require('mongoose');
require('dotenv').config(); // ADD THIS LINE

const connectDB = async () => {
    try {
        console.log('🔗 Attempting to connect to MongoDB Atlas...');
        
        // Debug: Check if environment variables are loaded
        console.log('🔍 Environment check:');
        console.log('   MONGODB_URI exists:', !!process.env.MONGODB_URI);
        console.log('   Current directory:', process.cwd());
        
        if (!process.env.MONGODB_URI) {
            console.log('❌ Available environment variables:');
            Object.keys(process.env).forEach(key => {
                if (key.includes('MONGO') || key.includes('DB') || key.includes('NODE')) {
                    console.log(`   ${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
                }
            });
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Log the connection string (without password for security)
        const safeURI = process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
        console.log('📡 Connection string:', safeURI);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority'
        });

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`📈 Port: ${conn.connection.port}`);
        
        return conn;
        
    } catch (error) {
        console.error('❌ MongoDB Atlas connection failed!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);

        // Specific error handling
        if (error.name === 'MongoServerError') {
            switch (error.code) {
                case 8000:
                    console.log('\n🔐 Authentication failed!');
                    console.log('• Check if username "zmo" and password are correct');
                    console.log('• Verify the database user exists in MongoDB Atlas');
                    break;
                case 13:
                    console.log('\n🚫 Unauthorized!');
                    console.log('• Check if user "zmo" has correct permissions');
                    console.log('• Verify IP is whitelisted in MongoDB Atlas');
                    break;
                case 18:
                    console.log('\n🔍 Authentication failed!');
                    console.log('• Wrong username or password');
                    break;
            }
        } else if (error.name === 'MongoNetworkError') {
            console.log('\n🌐 Network error!');
            console.log('• Check your internet connection');
            console.log('• Verify IP whitelisting in MongoDB Atlas');
            console.log('• Try using mobile hotspot if corporate network blocks MongoDB');
        }

        console.log('\n🔧 Quick fixes to try:');
        console.log('1. Make sure you have a .env file in your backend directory');
        console.log('2. Check that MONGODB_URI is set in the .env file');
        console.log('3. Go to MongoDB Atlas → Network Access → Add IP Address → "Allow Access from Anywhere"');
        console.log('4. Verify database user "zmo" exists in Atlas → Database Access');
        console.log('5. Check if cluster "zmowebsite" is active and not paused');

        process.exit(1);
    }
};

module.exports = connectDB;