const Blog = require('../models/Blog');

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Public
const createBlog = async (req, res) => {
  try {
    console.log('📝 Creating new blog with data:', req.body);
    
    const blogData = {
      title: req.body.title,
      content: req.body.content,
      excerpt: req.body.excerpt || '',
      author: req.body.author || 'Admin',
      readTime: req.body.readTime || 5,
      tags: req.body.tags || [],
      status: req.body.status || 'draft',
      featured: req.body.featured || false,
      imageUrl: req.body.imageUrl || req.body.image || ''
    };

    // Set published field based on status for backward compatibility
    blogData.published = blogData.status === 'published';

    const blog = new Blog(blogData);
    const savedBlog = await blog.save();
    
    console.log('✅ Blog created successfully:', savedBlog._id);
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: savedBlog
    });
    
  } catch (error) {
    console.error('❌ Error creating blog:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }
    
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog with similar title already exists',
        error: 'Duplicate title'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { 
      status, 
      featured, 
      search, 
      page = 1, 
      limit = 10,
      sort = '-createdAt'
    } = req.query;
    
    console.log('📡 Fetching blogs with query:', req.query);
    
    // Build query
    let query = {};
    
    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured === 'true';
    
    // Support both published and status for backward compatibility
    if (req.query.published !== undefined) {
      query.published = req.query.published === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Execute query with pagination
    const blogs = await Blog.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    
    console.log(`✅ Found ${blogs.length} blogs`);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    console.log('✅ Blog found:', blog.title);
    
    res.json({
      success: true,
      data: blog
    });
    
  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Public
const updateBlog = async (req, res) => {
  try {
    console.log('📝 Updating blog:', req.params.id, req.body);
    
    const updateData = { ...req.body };
    
    // Sync published field with status
    if (updateData.status) {
      updateData.published = updateData.status === 'published';
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    console.log('✅ Blog updated successfully:', blog.title);
    
    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
    
  } catch (error) {
    console.error('❌ Error updating blog:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Public
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    console.log('✅ Blog deleted:', blog.title);
    
    res.json({
      success: true,
      message: 'Blog deleted successfully',
      data: blog
    });
    
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
};

// @desc    Get blog statistics
// @route   GET /api/blogs/stats
// @access  Public
const getBlogStats = async (req, res) => {
  try {
    const stats = await Blog.getStats();
    
    console.log('📊 Blog stats calculated:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching blog stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog statistics',
      error: error.message
    });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogStats
};