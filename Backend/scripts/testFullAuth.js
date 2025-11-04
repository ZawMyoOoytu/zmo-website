// backend/scripts/testFullAuth.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const testFullAuth = async () => {
  try {
    console.log('🔐 Testing Complete Auth Flow');
    console.log('=============================\n');

    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'admin@example.com';
    const password = 'password';

    console.log('1. Finding user...');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return { success: false, message: 'Invalid email or password' };
    }
    console.log('✅ User found');

    console.log('2. Checking if user is active...');
    if (!user.isActive) {
      console.log('❌ User not active');
      return { success: false, message: 'Account is deactivated' };
    }
    console.log('✅ User is active');

    console.log('3. Checking if user is admin...');
    if (user.role !== 'admin') {
      console.log('❌ User not admin');
      return { success: false, message: 'Access denied. Admin privileges required.' };
    }
    console.log('✅ User is admin');

    console.log('4. Verifying password...');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return { success: false, message: 'Invalid email or password' };
    }
    console.log('✅ Password verified');

    console.log('5. Checking JWT_SECRET...');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET missing');
      return { success: false, message: 'Server configuration error' };
    }
    console.log('✅ JWT_SECRET found');

    console.log('6. Generating JWT token...');
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ Token generated');

    console.log('7. Updating last login...');
    user.lastLogin = new Date();
    await user.save();
    console.log('✅ Last login updated');

    const response = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };

    console.log('\n🎉 AUTH FLOW COMPLETED SUCCESSFULLY!');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    return response;

  } catch (error) {
    console.log('❌ Auth flow failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    return { success: false, message: 'Internal server error during login' };
  } finally {
    await mongoose.connection.close();
  }
};

testFullAuth();