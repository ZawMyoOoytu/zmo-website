const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
router.put('/:id', async (req, res) => {
  console.log("🔹 Update request for blog ID:", req.params.id);
  console.log("🔹 Payload received:", req.body);

  // existing update logic...
});


// ----------------- BLOG SCHEMA -----------------
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  author: { type: String, default: 'Admin' },
  readTime: { type: Number, default: 5 },
  category: { type: String },
  tags: [{ type: String }],
  status: { type: String, default: 'draft' },
  featured: { type: Boolean, default: false },
  imageUrl: { type: String },
  published: { type: Boolean, default: false }, // important for draft/publish
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

// ----------------- ROUTES -----------------

// GET /api/blogs - List all blogs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments();

    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch blogs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blogs', message: error.message });
  }
});

// GET /api/blogs/:id - Get a single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('❌ Failed to fetch blog:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blog', message: error.message });
  }
});

// POST /api/blogs - Create a new blog
router.post('/', async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      published: !!req.body.isPublished, // map frontend isPublished to backend
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const blog = new Blog(blogData);
    await blog.save();

    console.log('✅ Blog created:', blog._id);

    res.status(201).json({ success: true, data: blog, message: 'Blog created successfully' });
  } catch (error) {
    console.error('❌ Failed to create blog:', error);
    res.status(500).json({ success: false, error: 'Failed to create blog', message: error.message });
  }
});

// PUT /api/blogs/:id - Update an existing blog
router.put('/:id', async (req, res) => {
  try {
    const blogId = req.params.id;

    // 🔹 Log the request for debugging
    console.log('🔹 Update request for blog ID:', blogId);
    console.log('🔹 Payload received:', req.body);

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      excerpt: req.body.excerpt,
      category: req.body.category,
      tags: req.body.tags || [],
      imageUrl: req.body.imageUrl,
      featured: req.body.featured,
      // Explicitly handle published flag to avoid losing it
      published: typeof req.body.isPublished !== 'undefined' 
        ? req.body.isPublished 
        : req.body.published || false,
      updatedAt: new Date()
    };

    const blog = await Blog.findByIdAndUpdate(blogId, updateData, { new: true, runValidators: true });

    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });

    console.log('✅ Blog updated successfully:', blog._id, 'Published:', blog.published);

    res.json({ success: true, data: blog, message: 'Blog updated successfully' });
  } catch (error) {
    console.error('❌ Failed to update blog:', error);
    res.status(500).json({ success: false, error: 'Failed to update blog', message: error.message });
  }
});

// DELETE /api/blogs/:id - Delete a blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });

    console.log('🗑️ Blog deleted:', blog._id);

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('❌ Failed to delete blog:', error);
    res.status(500).json({ success: false, error: 'Failed to delete blog', message: error.message });
  }
});

module.exports = router;
