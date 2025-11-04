// backend/routes/blog.js - UPDATED TO MATCH FRONTEND ROUTES
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

console.log('📝 Initializing blog routes...');

// ✅ GET /admin/blogs - Get all blogs for admin (UPDATED PATH)
router.get('/admin/blogs', async (req, res) => {
  try {
    console.log('📡 GET /admin/blogs - Fetching all blogs...');
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    console.log(`✅ Found ${blogs.length} blogs`);
    
    // Return array directly to match frontend expectation
    res.json(blogs);
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

// ✅ POST /admin/blogs - Create new blog (UPDATED PATH)
router.post('/admin/blogs', async (req, res) => {
  try {
    console.log('📝 POST /admin/blogs - Creating new blog...', req.body);
    
    if (!req.body.title || !req.body.content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required fields'
      });
    }

    const excerpt = req.body.excerpt || 
      (req.body.content.length > 150 
        ? req.body.content.substring(0, 150) + '...' 
        : req.body.content);

    const newBlog = new Blog({
      title: req.body.title,
      content: req.body.content,
      excerpt: excerpt,
      image: req.body.image || '',
      imageUrl: req.body.imageUrl || '',
      tags: req.body.tags || [],
      published: req.body.published !== false,
      author: req.body.author || 'Admin',
      // Add createdAt and updatedAt for consistency
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedBlog = await newBlog.save();
    
    console.log('✅ Blog created successfully:', savedBlog.title);
    
    // Return the blog directly to match frontend expectation
    res.status(201).json(savedBlog);

  } catch (error) {
    console.error('❌ Error creating blog:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating blog',
      error: error.message
    });
  }
});

// ✅ PUT /admin/blogs/:id - Update blog post (UPDATED PATH)
router.put('/admin/blogs/:id', async (req, res) => {
  try {
    console.log('✏️ PUT /admin/blogs/', req.params.id, 'with data:', req.body);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    // Add updatedAt timestamp
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedBlog) {
      console.log('✅ Blog updated successfully:', updatedBlog.title);
      
      // Return the blog directly to match frontend expectation
      res.json(updatedBlog);
    } else {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
  } catch (error) {
    console.error('❌ Error updating blog:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
});

// ✅ DELETE /admin/blogs/:id - Delete blog post (UPDATED PATH)
router.delete('/admin/blogs/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /admin/blogs/', req.params.id);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (deletedBlog) {
      console.log('✅ Blog deleted successfully:', deletedBlog.title);
      res.json({
        success: true,
        message: 'Blog deleted successfully',
        deletedBlog: {
          id: deletedBlog._id,
          title: deletedBlog.title
        }
      });
    } else {
      console.log('❌ Blog not found for deletion:', req.params.id);
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
});

// ✅ GET /admin/blogs/:id - Get single blog for admin (NEW ROUTE)
router.get('/admin/blogs/:id', async (req, res) => {
  try {
    console.log('📡 GET /admin/blogs/', req.params.id);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    const blog = await Blog.findById(req.params.id);
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    });
  }
});

// ✅ PUBLIC ROUTES (keep these as they are)

// GET /blog - Get published blogs for public
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /blog - Fetching published blogs...');
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    console.log(`✅ Found ${blogs.length} published blogs`);
    
    res.json({
      success: true,
      data: blogs,
      count: blogs.length
    });
  } catch (error) {
    console.error('❌ Error fetching published blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

// GET /blog/:id - Get single blog post for public
router.get('/:id', async (req, res) => {
  try {
    console.log('📡 GET /blog/', req.params.id);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    const blog = await Blog.findById(req.params.id);
    if (blog && blog.published) {
      res.json({
        success: true,
        data: blog
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Blog not found or not published'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
      error: error.message
    });
  }
});

console.log('✅ Blog routes initialized with frontend-compatible paths');
module.exports = router;