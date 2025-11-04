// routes/dashboard.js
const express = require('express');
const router = express.Router();

// Import models with error handling
let Blog, Project, Contact;
try {
  Blog = require('../models/Blog');
  Project = require('../models/Project');
  Contact = require('../models/Contact');
} catch (error) {
  console.error('Error loading models:', error);
}

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard statistics...');
    
    // Check if models are available
    if (!Blog || !Project || !Contact) {
      return res.json({
        success: true,
        data: {
          totalBlogs: 0,
          totalProjects: 0,
          totalContacts: 0,
          publishedBlogs: 0,
          draftBlogs: 0,
          totalViews: 0
        }
      });
    }

    const [totalBlogs, publishedBlogs, totalProjects, totalContacts, blogsForViews] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ published: true }),
      Project.countDocuments(),
      Contact.countDocuments(),
      Blog.find({}, 'views')
    ]);

    const totalViews = blogsForViews.reduce((sum, blog) => sum + (blog.views || 0), 0);

    const stats = {
      totalBlogs,
      totalProjects,
      totalContacts,
      publishedBlogs,
      draftBlogs: totalBlogs - publishedBlogs,
      totalViews
    };

    console.log('Dashboard stats:', stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

module.exports = router;