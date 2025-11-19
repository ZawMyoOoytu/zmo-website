// Backend/routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  author: { type: String, default: 'Admin' },
  readTime: { type: Number, default: 5 },
  tags: [{ type: String }],
  status: { type: String, default: 'draft' },
  featured: { type: Boolean, default: false },
  imageUrl: { type: String },
  published: { type: Boolean, default: false },
  image: { type: String },
  views: { type: Number, default: 0 },
  slug: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

// GET /api/blogs - Get all blogs with pagination
router.get('/', async (req, res) => {
  try {
    console.log('📝 Fetching blogs from database...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments();

    // Fix image URLs for production
    const fixedBlogs = blogs.map(blog => {
      if (blog.image && blog.image.includes('localhost:5000')) {
        blog.image = blog.image.replace('http://localhost:5000', 'https://zmo-backend.onrender.com');
      }
      if (blog.imageUrl && blog.imageUrl.includes('localhost:5000')) {
        blog.imageUrl = blog.imageUrl.replace('http://localhost:5000', 'https://zmo-backend.onrender.com');
      }
      return blog;
    });

    console.log(`✅ Found ${fixedBlogs.length} blogs`);

    res.json({
      success: true,
      data: fixedBlogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blogs',
      message: error.message
    });
  }
});

// GET /api/blogs/stats - Get blog statistics
router.get('/stats', async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ published: true });
    const draftBlogs = await Blog.countDocuments({ published: false });
    const featuredBlogs = await Blog.countDocuments({ featured: true });

    res.json({
      success: true,
      data: {
        total: totalBlogs,
        published: publishedBlogs,
        drafts: draftBlogs,
        featured: featuredBlogs
      }
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog statistics'
    });
  }
});

// GET /api/blogs/:id - Get single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Fix image URLs
    if (blog.image && blog.image.includes('localhost:5000')) {
      blog.image = blog.image.replace('http://localhost:5000', 'https://zmo-backend.onrender.com');
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog'
    });
  }
});

// POST /api/blogs - Create new blog
router.post('/', async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog created successfully'
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blog'
    });
  }
});

// PUT /api/blogs/:id - Update blog
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: blog,
      message: 'Blog updated successfully'
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update blog'
    });
  }
});

// DELETE /api/blogs/:id - Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog'
    });
  }
});

module.exports = router;