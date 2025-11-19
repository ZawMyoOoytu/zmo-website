const express = require('express');
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogStats
} = require('../controllers/blogController');

// @route   GET /api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', getBlogs);

// @route   GET /api/blogs/stats
// @desc    Get blog statistics
// @access  Public
router.get('/stats', getBlogStats);

// @route   GET /api/blogs/:id
// @desc    Get single blog by ID
// @access  Public
router.get('/:id', getBlogById);

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Public
router.post('/', createBlog);

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Public
router.put('/:id', updateBlog);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Public
router.delete('/:id', deleteBlog);

module.exports = router;