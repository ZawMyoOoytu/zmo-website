// backend/scripts/debugAuth.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const debugAuth = async () => {
  try {
    console.log('🔍 Debugging Authentication');
    console.log('==========================\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // 1. Find the admin user
    console.log('\n1. Finding admin user...');
    const user = await User.findOne({ email: 'admin@example.com' });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Password hash length:', user.password.length);
    console.log('   Password hash (first 20 chars):', user.password.substring(0, 20) + '...');

    // 2. Test password comparison
    console.log('\n2. Testing password comparison...');
    
    // Check if comparePassword method exists
    if (typeof user.comparePassword !== 'function') {
      console.log('❌ comparePassword method missing from User model!');
      console.log('💡 Add this to your User model:');
      console.log(`
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
      `);
      return;
    }

    // Test with correct password
    console.log('Testing with correct password "password"...');
    const isCorrectPassword = await user.comparePassword('password');
    console.log('   Correct password matches:', isCorrectPassword);

    // Test with wrong password
    console.log('Testing with wrong password "wrongpass"...');
    const isWrongPassword = await user.comparePassword('wrongpass');
    console.log('   Wrong password matches:', isWrongPassword);

    if (!isCorrectPassword) {
      console.log('\n🔐 PASSWORD ISSUE:');
      console.log('   The password "password" does not match the stored hash.');
      console.log('   This usually happens when:');
      console.log('   • The password was hashed with different salt rounds');
      console.log('   • The pre-save hook is not working');
      console.log('   • The password was manually set without hashing');
    } else {
      console.log('\n✅ Password comparison working correctly!');
    }

  } catch (error) {
    console.log('❌ Debug error:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
};

debugAuth();