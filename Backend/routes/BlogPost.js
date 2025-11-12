// backend/routes/blogPosts.js
const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// GET all blog posts
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      data: blogs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET single blog post by ID
router.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog post not found' 
      });
    }
    res.json({ 
      success: true, 
      data: blog 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST create new blog post
router.post('/blogs', async (req, res) => {
  try {
    const blog = new BlogPost(req.body);
    await blog.save();
    res.status(201).json({ 
      success: true, 
      data: blog 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT update blog post
router.put('/blogs/:id', async (req, res) => {
  try {
    const blog = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog post not found' 
      });
    }
    res.json({ 
      success: true, 
      data: blog 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE blog post
router.delete('/blogs/:id', async (req, res) => {
  try {
    const blog = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blog post not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Blog post deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;