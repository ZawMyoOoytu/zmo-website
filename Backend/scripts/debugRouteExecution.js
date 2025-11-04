// backend/scripts/debugRouteExecution.js
const express = require('express');
const request = require('supertest');
require('dotenv').config();

console.log('🔍 Debugging Route Execution');
console.log('============================\n');

const app = express();
app.use(express.json());

// Load auth routes with error handling
try {
  const authRoutes = require('./routes/auth');
  app.use('/api', authRoutes);
  
  console.log('✅ Routes loaded');
  
  // Add error handling middleware to catch any errors
  app.use((error, req, res, next) => {
    console.log('🚨 Express Error Handler Caught:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Express error handler: ' + error.message 
    });
  });
  
  const testExecution = async () => {
    try {
      console.log('1. Sending test request...');
      
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password'
        })
        .set('Content-Type', 'application/json');
      
      console.log('2. Response received:');
      console.log('   Status:', response.status);
      console.log('   Body:', JSON.stringify(response.body, null, 2));
      
      if (response.status === 500) {
        console.log('\n🔧 The route is executing but throwing an error');
        console.log('Error message:', response.body.message);
      } else if (response.status === 200) {
        console.log('\n🎉 Route is working!');
      } else {
        console.log('\n⚠️ Unexpected status:', response.status);
      }
      
    } catch (error) {
      console.log('❌ Test request failed:', error.message);
    }
  };
  
  testExecution();
  
} catch (error) {
  console.log('❌ Error loading routes:', error.message);
}