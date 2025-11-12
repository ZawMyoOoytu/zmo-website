// backend/routes/blogs.js - FIXED MIDDLEWARE AND ROUTE STRUCTURE
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { adminAuth } = require('../middleware/auth');

console.log('📝 Initializing blog routes...');

// 🌐 PUBLIC ROUTES (no authentication required)

// ✅ GET /api/blogs - Get published blogs for public
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/blogs - Fetching published blogs...');
    
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Build search query for published blogs only
    const searchQuery = { 
      published: true,
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v'); // Exclude version key

    const total = await Blog.countDocuments(searchQuery);

    console.log(`✅ Found ${blogs.length} published blogs out of ${total} total`);
    
    res.json({
      success: true,
      data: blogs,
      total: total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
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

// ✅ GET /api/blogs/simple - Simple endpoint for frontend
router.get('/simple', async (req, res) => {
  try {
    console.log('📡 GET /api/blogs/simple - Fetching simple blogs data...');
    
    const blogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title excerpt imageUrl createdAt tags');
    
    console.log(`✅ Found ${blogs.length} blogs for simple endpoint`);
    
    res.json({
      success: true,
      data: blogs,
      message: 'Blogs fetched successfully'
    });
  } catch (error) {
    console.error('❌ Error in simple endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// ✅ GET /api/blogs/:id - Get single blog post for public
router.get('/:id', async (req, res) => {
  try {
    console.log('📡 GET /api/blogs/', req.params.id);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    const blog = await Blog.findById(req.params.id);
    if (blog && blog.published) {
      // Increment view count
      await Blog.findByIdAndUpdate(req.params.id, { 
        $inc: { views: 1 } 
      });
      
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

// 🔐 ADMIN ROUTES (protected by adminAuth middleware)

// ✅ GET /api/blogs/admin/all - Get all blogs for admin (with pagination)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    console.log('📡 GET /api/blogs/admin/all - Fetching all blogs for admin...');
    console.log('👤 Request by admin:', req.user.email);
    
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    // Build search query for admin (all blogs)
    const searchQuery = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Add status filter if provided
    if (status === 'published') searchQuery.published = true;
    if (status === 'draft') searchQuery.published = false;

    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(searchQuery);

    console.log(`✅ Found ${blogs.length} blogs out of ${total} total for admin`);
    
    res.json({
      success: true,
      data: blogs,
      total: total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

// ✅ POST /api/blogs/admin/create - Create new blog
router.post('/admin/create', adminAuth, async (req, res) => {
  try {
    console.log('📝 POST /api/blogs/admin/create - Creating new blog...');
    console.log('👤 Request by admin:', req.user.email);
    
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
      imageUrl: req.body.imageUrl || req.body.image || '/uploads/default-blog.jpg',
      tags: req.body.tags || [],
      published: req.body.published !== false,
      author: req.body.author || 'Admin',
      authorId: req.user.userId,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedBlog = await newBlog.save();
    
    console.log('✅ Blog created successfully:', savedBlog.title);
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: savedBlog
    });

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

// ✅ PUT /api/blogs/admin/update/:id - Update blog post
router.put('/admin/update/:id', adminAuth, async (req, res) => {
  try {
    console.log('✏️ PUT /api/blogs/admin/update/', req.params.id);
    console.log('👤 Request by admin:', req.user.email);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Handle imageUrl/image field consistency
    if (req.body.imageUrl) {
      updateData.imageUrl = req.body.imageUrl;
    } else if (req.body.image) {
      updateData.imageUrl = req.body.image;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedBlog) {
      console.log('✅ Blog updated successfully:', updatedBlog.title);
      
      res.json({
        success: true,
        message: 'Blog updated successfully',
        data: updatedBlog
      });
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

// ✅ DELETE /api/blogs/admin/delete/:id - Delete blog post
router.delete('/admin/delete/:id', adminAuth, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/blogs/admin/delete/', req.params.id);
    console.log('👤 Request by admin:', req.user.email);
    
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
        data: {
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

// ✅ GET /api/blogs/admin/:id - Get single blog for admin
router.get('/admin/:id', adminAuth, async (req, res) => {
  try {
    console.log('📡 GET /api/blogs/admin/', req.params.id);
    console.log('👤 Request by admin:', req.user.email);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    const blog = await Blog.findById(req.params.id);
    if (blog) {
      res.json({
        success: true,
        data: blog
      });
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

console.log('✅ Blog routes initialized with proper structure');
module.exports = router;