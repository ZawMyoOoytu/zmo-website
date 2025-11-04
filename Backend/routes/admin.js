// routes/admin.js
const express = require('express');
const router = express.Router(); // This line is crucial
const Blog = require('../models/Blog');
const Project = require('../models/Project');
const Contact = require('../models/Contact');

// ==================== DASHBOARD STATS ====================
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard statistics...');
    
    const [totalBlogs, publishedBlogs, totalProjects, totalContacts, blogsForViews] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ published: true }),
      Project.countDocuments(),
      Contact.countDocuments(),
      Blog.find({}, 'views')
    ]);

    const totalViews = blogsForViews.reduce((sum, blog) => sum + (blog.views || 0), 0);
    const draftBlogs = totalBlogs - publishedBlogs;

    const stats = {
      totalBlogs,
      totalProjects,
      totalContacts,
      publishedBlogs,
      draftBlogs,
      totalViews
    };

    console.log('📊 Dashboard stats calculated:', stats);

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

// ==================== ADMIN BLOGS ====================
router.get('/blogs', async (req, res) => {
  try {
    console.log('📝 Fetching admin blogs...');
    const blogs = await Blog.find().sort({ createdAt: -1 });
    
    console.log(`📝 Found ${blogs.length} blogs`);
    res.json(blogs);

  } catch (error) {
    console.error('❌ Admin blogs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch blogs',
      message: error.message 
    });
  }
});

// Add other routes...

// Make sure this is at the end
module.exports = router;