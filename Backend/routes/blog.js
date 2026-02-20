// backend/routes/Blog.js - UPDATED WITH FIELD MISMATCH FIXES
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { adminAuth } = require('../middleware/auth');

console.log('📝 Initializing blog routes...');

// ============================================
// 🎯 DEBUG & DIAGNOSTIC ROUTES
// ============================================

// 🔍 Debug blog field structure
router.get('/debug/fields', async (req, res) => {
  try {
    console.log('🔍 Debugging blog field structure...');
    
    // Get all blogs
    const blogs = await Blog.find({});
    
    const analysis = blogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      fields: {
        published: blog.published,
        status: blog.status,
        hasPublished: blog.published !== undefined,
        hasStatus: blog.status !== undefined,
        hasBoth: (blog.published !== undefined && blog.status !== undefined)
      }
    }));
    
    // Count blogs by field
    const total = await Blog.countDocuments({});
    const withPublished = await Blog.countDocuments({ published: { $exists: true } });
    const withStatus = await Blog.countDocuments({ status: { $exists: true } });
    const publishedTrue = await Blog.countDocuments({ published: true });
    const statusPublished = await Blog.countDocuments({ status: 'published' });
    const hasBothFields = await Blog.countDocuments({ 
      $and: [
        { published: { $exists: true } },
        { status: { $exists: true } }
      ]
    });
    
    console.log('📊 Field Analysis:');
    console.log(`Total blogs: ${total}`);
    console.log(`With "published" field: ${withPublished}`);
    console.log(`With "status" field: ${withStatus}`);
    console.log(`With BOTH fields: ${hasBothFields}`);
    console.log(`published: true: ${publishedTrue}`);
    console.log(`status: 'published': ${statusPublished}`);
    
    res.json({
      success: true,
      message: 'Field analysis complete',
      analysis: analysis,
      counts: {
        total,
        withPublished,
        withStatus,
        publishedTrue,
        statusPublished,
        hasBothFields
      },
      diagnosis: hasBothFields < total 
        ? `⚠️ ${total - hasBothFields} blogs missing one or both status fields`
        : '✅ All blogs have both status fields'
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 🛠️ Migrate blog fields to have both formats
router.get('/admin/migrate-blog-fields', adminAuth, async (req, res) => {
  try {
    console.log('🔄 Starting blog field migration...');
    console.log('👤 Request by admin:', req.user.email);
    
    // Find all blogs
    const allBlogs = await Blog.find({});
    let updatedCount = 0;
    const results = [];
    
    for (const blog of allBlogs) {
      const updates = {};
      let changes = [];
      
      // Sync published field from status
      if (blog.status === 'published' && blog.published !== true) {
        updates.published = true;
        changes.push('published: true');
      }
      
      if (blog.status === 'draft' && blog.published !== false) {
        updates.published = false;
        changes.push('published: false');
      }
      
      // Sync status field from published
      if (blog.published === true && blog.status !== 'published') {
        updates.status = 'published';
        changes.push("status: 'published'");
      }
      
      if (blog.published === false && blog.status !== 'draft') {
        updates.status = 'draft';
        changes.push("status: 'draft'");
      }
      
      // If no status or published field, default to draft
      if (blog.published === undefined && blog.status === undefined) {
        updates.published = false;
        updates.status = 'draft';
        changes.push('published: false, status: draft');
      }
      
      // Apply updates if needed
      if (Object.keys(updates).length > 0) {
        try {
          const updatedBlog = await Blog.findByIdAndUpdate(
            blog._id,
            { $set: updates },
            { new: true }
          );
          
          updatedCount++;
          results.push(`✅ "${blog.title}": ${changes.join(', ')}`);
          console.log(`Updated: "${blog.title}" - ${changes.join(', ')}`);
        } catch (updateError) {
          results.push(`❌ "${blog.title}": Update failed - ${updateError.message}`);
          console.error(`Update failed for "${blog.title}":`, updateError);
        }
      } else {
        results.push(`➖ "${blog.title}": Already synchronized`);
      }
    }
    
    console.log(`✅ Migration complete. Updated ${updatedCount} blogs`);
    
    res.json({
      success: true,
      message: `Migration complete. Updated ${updatedCount} blogs`,
      updated: updatedCount,
      total: allBlogs.length,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

// ============================================
// 🌐 PUBLIC ROUTES (no authentication required)
// ============================================

// ✅ GET /api/blogs - Get published blogs for public (FIXED VERSION)
router.get('/', async (req, res) => {
  try {
    console.log('📡 GET /api/blogs - Fetching published blogs...');
    
    const { 
      page = 1, 
      limit = 50, 
      search = '',
      category,
      tag,
      featured 
    } = req.query;
    
    // 🚨 CRITICAL FIX: Check for BOTH field formats
    const searchQuery = {
      $or: [
        // Format 1: published: true (old format)
        { published: true },
        // Format 2: status: 'published' (new format from dashboard)
        { status: 'published' }
      ]
    };
    
    // Add text search if provided
    if (search) {
      searchQuery.$and = [{
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ]
      }];
    }
    
    // Add category filter
    if (category) {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push({ category: category });
    }
    
    // Add tag filter
    if (tag) {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push({ tags: tag });
    }
    
    // Add featured filter (optional)
    if (featured === 'true') {
      if (!searchQuery.$and) searchQuery.$and = [];
      searchQuery.$and.push({ featured: true });
    }

    console.log('🔍 Search query:', JSON.stringify(searchQuery, null, 2));
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const blogs = await Blog.find(searchQuery)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v'); // Exclude version key

    const total = await Blog.countDocuments(searchQuery);

    console.log(`✅ Found ${blogs.length} published blogs out of ${total} total`);
    
    // 🐛 DEBUG: Log what we found
    console.log('📊 Blogs returned to frontend:');
    blogs.forEach((blog, index) => {
      console.log(`  ${index + 1}. "${blog.title}"`);
      console.log(`     published: ${blog.published}, status: ${blog.status}`);
      console.log(`     featured: ${blog.featured || false}`);
    });
    
    res.json({
      success: true,
      data: blogs,
      total: total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      debug: {
        queryUsed: searchQuery,
        found: blogs.length,
        totalInQuery: total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching published blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message,
      debug: { query: req.query }
    });
  }
});

// ✅ GET /api/blogs/count - Get count of published blogs
router.get('/count', async (req, res) => {
  try {
    const count = await Blog.countDocuments({
      $or: [
        { published: true },
        { status: 'published' }
      ]
    });
    
    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ GET /api/blogs/simple - Simple endpoint for frontend
router.get('/simple', async (req, res) => {
  try {
    console.log('📡 GET /api/blogs/simple - Fetching simple blogs data...');
    
    const blogs = await Blog.find({
      $or: [
        { published: true },
        { status: 'published' }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title excerpt imageUrl createdAt tags slug');
    
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
    if (blog) {
      // Check if blog is published (using both field formats)
      const isPublished = blog.published === true || blog.status === 'published';
      
      if (isPublished) {
        // Increment view count
        await Blog.findByIdAndUpdate(req.params.id, { 
          $inc: { views: 1 } 
        });
        
        res.json({
          success: true,
          data: blog,
          published: isPublished
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Blog not published',
          published: false
        });
      }
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

// ============================================
// 🔐 ADMIN ROUTES (protected by adminAuth middleware)
// ============================================

// ✅ GET /api/blogs/admin/all - Get all blogs for admin (with pagination)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    console.log('📡 GET /api/blogs/admin/all - Fetching all blogs for admin...');
    console.log('👤 Request by admin:', req.user.email);
    
    const { page = 1, limit = 50, search = '', status = '' } = req.query;
    
    // Build search query for admin (all blogs)
    const searchQuery = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Add status filter if provided (handles both formats)
    if (status === 'published') {
      searchQuery.$or = [
        { published: true },
        { status: 'published' }
      ];
    } else if (status === 'draft') {
      searchQuery.$or = [
        { published: false },
        { status: 'draft' }
      ];
    }

    const skip = (page - 1) * limit;
    
    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Blog.countDocuments(searchQuery);

    console.log(`✅ Found ${blogs.length} blogs out of ${total} total for admin`);
    
    // Add field info for debugging
    const blogsWithFields = blogs.map(blog => ({
      ...blog.toObject(),
      fieldInfo: {
        published: blog.published,
        status: blog.status,
        hasBoth: blog.published !== undefined && blog.status !== undefined
      }
    }));
    
    res.json({
      success: true,
      data: blogsWithFields,
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

// ✅ GET /api/blogs?all=true - Special endpoint for dashboard (returns all statuses)
router.get('/', async (req, res) => {
  try {
    // Check for ?all=true parameter
    if (req.query.all === 'true') {
      console.log('📡 GET /api/blogs?all=true - Fetching ALL blogs for dashboard...');
      
      const blogs = await Blog.find({})
        .sort({ createdAt: -1 })
        .limit(100); // Increased limit for dashboard
      
      console.log(`✅ Dashboard: Found ${blogs.length} total blogs`);
      
      return res.json({
        success: true,
        data: blogs,
        total: blogs.length,
        forDashboard: true
      });
    }
    
    // Otherwise, use the normal public route logic (already defined above)
    // This handles the regular /api/blogs endpoint
    
  } catch (error) {
    console.error('❌ Error in all=true endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all blogs',
      error: error.message
    });
  }
});

// ✅ POST /api/blogs/admin/create - Create new blog (UPDATED to set both fields)
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

    // 🚨 IMPORTANT: Set BOTH status fields
    const isPublished = req.body.status === 'published' || req.body.published === true;
    
    const newBlog = new Blog({
      title: req.body.title,
      content: req.body.content,
      excerpt: excerpt,
      imageUrl: req.body.imageUrl || req.body.image || '/uploads/default-blog.jpg',
      tags: req.body.tags || [],
      // SET BOTH FIELDS FOR CONSISTENCY
      published: isPublished,
      status: isPublished ? 'published' : 'draft',
      author: req.body.author || 'Admin',
      authorId: req.user.userId,
      views: 0,
      // SEO fields
      slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      metaDescription: req.body.metaDescription || excerpt,
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: isPublished ? new Date() : null
    });

    const savedBlog = await newBlog.save();
    
    console.log('✅ Blog created successfully:', savedBlog.title);
    console.log('   Status:', savedBlog.status, 'Published:', savedBlog.published);
    
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

// ✅ PUT /api/blogs/admin/update/:id - Update blog post (UPDATED to sync both fields)
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

    // 🚨 SYNC BOTH STATUS FIELDS
    if (req.body.status === 'published' && req.body.published !== true) {
      updateData.published = true;
      updateData.publishedAt = updateData.publishedAt || new Date();
    } else if (req.body.status === 'draft' && req.body.published !== false) {
      updateData.published = false;
    } else if (req.body.published === true && req.body.status !== 'published') {
      updateData.status = 'published';
      updateData.publishedAt = updateData.publishedAt || new Date();
    } else if (req.body.published === false && req.body.status !== 'draft') {
      updateData.status = 'draft';
    }

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
      console.log('   New status:', updatedBlog.status, 'Published:', updatedBlog.published);
      
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

// ✅ PATCH /api/blogs/:id - Update blog status (compatible with dashboard)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    console.log('🔄 PATCH /api/blogs/', req.params.id);
    console.log('👤 Request by admin:', req.user.email);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    // Handle status update from dashboard
    if (req.body.status) {
      updateData.status = req.body.status;
      updateData.published = req.body.status === 'published';
      
      if (req.body.status === 'published') {
        updateData.publishedAt = req.body.publishedAt || new Date();
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (updatedBlog) {
      console.log('✅ Blog status updated:', updatedBlog.title);
      console.log('   Status:', updatedBlog.status, 'Published:', updatedBlog.published);
      
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
    console.error('❌ Error updating blog status:', error);
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
        data: blog,
        fieldInfo: {
          published: blog.published,
          status: blog.status,
          isPubliclyVisible: blog.published === true || blog.status === 'published'
        }
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

// ============================================
// 🚨 EMERGENCY FIX ROUTES
// ============================================

// 🛠️ Fix all blogs to have both status fields
router.post('/admin/fix-all-status', adminAuth, async (req, res) => {
  try {
    console.log('🛠️ Fixing all blog status fields...');
    console.log('👤 Request by admin:', req.user.email);
    
    const allBlogs = await Blog.find({});
    let fixedCount = 0;
    const results = [];
    
    for (const blog of allBlogs) {
      const updates = {};
      
      // Determine correct status
      if (blog.status === 'published' || blog.published === true) {
        updates.published = true;
        updates.status = 'published';
        if (!blog.publishedAt) updates.publishedAt = new Date();
      } else {
        updates.published = false;
        updates.status = 'draft';
      }
      
      // Only update if needed
      if (blog.published !== updates.published || blog.status !== updates.status) {
        await Blog.findByIdAndUpdate(blog._id, { $set: updates });
        fixedCount++;
        results.push(`✅ "${blog.title}": ${blog.status || 'no status'} → ${updates.status}`);
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} blogs`);
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} blog status fields`,
      fixed: fixedCount,
      total: allBlogs.length,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Fix error:', error);
    res.status(500).json({
      success: false,
      message: 'Fix failed',
      error: error.message
    });
  }
});

// 🔄 Sync single blog status
router.post('/admin/sync-status/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    const updates = {};
    
    // Sync from status to published
    if (blog.status === 'published' && blog.published !== true) {
      updates.published = true;
      updates.publishedAt = blog.publishedAt || new Date();
    } else if (blog.status === 'draft' && blog.published !== false) {
      updates.published = false;
    }
    
    // Sync from published to status
    if (blog.published === true && blog.status !== 'published') {
      updates.status = 'published';
    } else if (blog.published === false && blog.status !== 'draft') {
      updates.status = 'draft';
    }
    
    if (Object.keys(updates).length > 0) {
      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );
      
      res.json({
        success: true,
        message: 'Status synchronized',
        data: updatedBlog,
        changes: updates
      });
    } else {
      res.json({
        success: true,
        message: 'Status already synchronized',
        data: blog
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

console.log('✅ Blog routes initialized with field mismatch fixes');
module.exports = router;