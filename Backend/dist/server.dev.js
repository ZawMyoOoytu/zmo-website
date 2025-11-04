"use strict";

var express = require('express');

var cors = require('cors');

var mongoose = require('mongoose');

require('dotenv').config();

var app = express(); // Middleware

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})); // ✅ ADD THIS: Increase payload size limits to fix "PayloadTooLargeError"

app.use(express.json({
  limit: '500mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '500mb'
})); // Request logging middleware

app.use(function (req, res, next) {
  console.log("".concat(new Date().toISOString(), " - ").concat(req.method, " ").concat(req.path));
  next();
}); // Routes

app.use('/api/auth', require('./routes/auth'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact', require('./routes/contact')); // Test route

app.get('/api/test', function (req, res) {
  res.json({
    success: true,
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  });
}); // Health check route

app.get('/api/health', function (req, res) {
  res.json({
    success: true,
    message: 'Server is healthy',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
}); // MongoDB connection

mongoose.connect(process.env.MONGODB_URI).then(function () {
  console.log('✅ MongoDB Connected');
})["catch"](function (error) {
  console.error('❌ MongoDB connection error:', error);
});
var PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("\uD83D\uDE80 Server is running on port ".concat(PORT));
  console.log("\uD83D\uDCCA MongoDB URI: ".concat(process.env.MONGODB_URI ? 'Set' : 'Not set'));
});