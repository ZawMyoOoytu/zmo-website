// backend/middleware/auth.js - UPDATED TO MATCH YOUR JWT STRUCTURE
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('🔐 Initializing auth middleware...');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Auth check - Token present:', !!token);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    // Verify user still exists in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = decoded;
    console.log('✅ Auth successful for user:', decoded.email);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Admin auth check - Token present:', !!token);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    // Verify user exists and is admin
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // ✅ FIX: Check for 'role' field instead of 'isAdmin'
    if (decoded.role !== 'admin') {
      console.log('❌ Admin access denied for role:', decoded.role);
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    req.user = decoded;
    console.log('✅ Admin auth successful for:', decoded.email);
    next();
  } catch (error) {
    console.error('❌ Admin auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

// Enhanced auth middleware with role checking
const requireRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'No token provided' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
      
      // Verify user exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user has required role
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error('❌ Role-based auth error:', error);
      res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }
  };
};

console.log('✅ Auth middleware initialized');
module.exports = { auth, adminAuth, requireRole };