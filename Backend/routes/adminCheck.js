// backend/routes/adminCheck.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Check admin user status
router.get('/admin/check', async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (adminUser) {
      res.json({
        exists: true,
        user: {
          id: adminUser._id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          isActive: adminUser.isActive
        }
      });
    } else {
      res.json({
        exists: false,
        message: 'Admin user not found. Run the setup script to create one.'
      });
    }
  } catch (error) {
    res.status(500).json({
      exists: false,
      error: error.message
    });
  }
});

module.exports = router;