"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// backend/routes/blogs.js - FIXED MIDDLEWARE AND ROUTE STRUCTURE
var express = require('express');

var router = express.Router();

var Blog = require('../models/Blog');

var _require = require('../middleware/auth'),
    adminAuth = _require.adminAuth;

console.log('📝 Initializing blog routes...'); // 🌐 PUBLIC ROUTES (no authentication required)
// ✅ GET /api/blogs - Get published blogs for public

router.get('/', function _callee(req, res) {
  var _req$query, _req$query$page, page, _req$query$limit, limit, _req$query$search, search, searchQuery, blogs, total;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          console.log('📡 GET /api/blogs - Fetching published blogs...');
          _req$query = req.query, _req$query$page = _req$query.page, page = _req$query$page === void 0 ? 1 : _req$query$page, _req$query$limit = _req$query.limit, limit = _req$query$limit === void 0 ? 10 : _req$query$limit, _req$query$search = _req$query.search, search = _req$query$search === void 0 ? '' : _req$query$search; // Build search query for published blogs only

          searchQuery = _objectSpread({
            published: true
          }, search && {
            $or: [{
              title: {
                $regex: search,
                $options: 'i'
              }
            }, {
              content: {
                $regex: search,
                $options: 'i'
              }
            }, {
              tags: {
                $regex: search,
                $options: 'i'
              }
            }]
          });
          _context.next = 6;
          return regeneratorRuntime.awrap(Blog.find(searchQuery).sort({
            createdAt: -1
          }).limit(limit * 1).skip((page - 1) * limit).select('-__v'));

        case 6:
          blogs = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(Blog.countDocuments(searchQuery));

        case 9:
          total = _context.sent;
          console.log("\u2705 Found ".concat(blogs.length, " published blogs out of ").concat(total, " total"));
          res.json({
            success: true,
            data: blogs,
            total: total,
            pagination: {
              current: parseInt(page),
              pages: Math.ceil(total / limit),
              total: total
            }
          });
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error('❌ Error fetching published blogs:', _context.t0);
          res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: _context.t0.message
          });

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); // ✅ GET /api/blogs/simple - Simple endpoint for frontend

router.get('/simple', function _callee2(req, res) {
  var blogs;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          console.log('📡 GET /api/blogs/simple - Fetching simple blogs data...');
          _context2.next = 4;
          return regeneratorRuntime.awrap(Blog.find({
            published: true
          }).sort({
            createdAt: -1
          }).limit(6).select('title excerpt imageUrl createdAt tags'));

        case 4:
          blogs = _context2.sent;
          console.log("\u2705 Found ".concat(blogs.length, " blogs for simple endpoint"));
          res.json({
            success: true,
            data: blogs,
            message: 'Blogs fetched successfully'
          });
          _context2.next = 13;
          break;

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          console.error('❌ Error in simple endpoint:', _context2.t0);
          res.status(500).json({
            success: false,
            message: 'Failed to fetch blogs',
            error: _context2.t0.message
          });

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // ✅ GET /api/blogs/:id - Get single blog post for public

router.get('/:id', function _callee3(req, res) {
  var blog;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          console.log('📡 GET /api/blogs/', req.params.id);

          if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: 'Invalid blog ID format'
          }));

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(Blog.findById(req.params.id));

        case 6:
          blog = _context3.sent;

          if (!(blog && blog.published)) {
            _context3.next = 13;
            break;
          }

          _context3.next = 10;
          return regeneratorRuntime.awrap(Blog.findByIdAndUpdate(req.params.id, {
            $inc: {
              views: 1
            }
          }));

        case 10:
          res.json({
            success: true,
            data: blog
          });
          _context3.next = 14;
          break;

        case 13:
          res.status(404).json({
            success: false,
            message: 'Blog not found or not published'
          });

        case 14:
          _context3.next = 20;
          break;

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](0);
          console.error('❌ Error fetching blog post:', _context3.t0);
          res.status(500).json({
            success: false,
            message: 'Error fetching blog post',
            error: _context3.t0.message
          });

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 16]]);
}); // 🔐 ADMIN ROUTES (protected by adminAuth middleware)
// ✅ GET /api/blogs/admin/all - Get all blogs for admin (with pagination)

router.get('/admin/all', adminAuth, function _callee4(req, res) {
  var _req$query2, _req$query2$page, page, _req$query2$limit, limit, _req$query2$search, search, _req$query2$status, status, searchQuery, blogs, total;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          console.log('📡 GET /api/blogs/admin/all - Fetching all blogs for admin...');
          console.log('👤 Request by admin:', req.user.email);
          _req$query2 = req.query, _req$query2$page = _req$query2.page, page = _req$query2$page === void 0 ? 1 : _req$query2$page, _req$query2$limit = _req$query2.limit, limit = _req$query2$limit === void 0 ? 10 : _req$query2$limit, _req$query2$search = _req$query2.search, search = _req$query2$search === void 0 ? '' : _req$query2$search, _req$query2$status = _req$query2.status, status = _req$query2$status === void 0 ? '' : _req$query2$status; // Build search query for admin (all blogs)

          searchQuery = search ? {
            $or: [{
              title: {
                $regex: search,
                $options: 'i'
              }
            }, {
              content: {
                $regex: search,
                $options: 'i'
              }
            }, {
              tags: {
                $regex: search,
                $options: 'i'
              }
            }]
          } : {}; // Add status filter if provided

          if (status === 'published') searchQuery.published = true;
          if (status === 'draft') searchQuery.published = false;
          _context4.next = 9;
          return regeneratorRuntime.awrap(Blog.find(searchQuery).sort({
            createdAt: -1
          }).limit(limit * 1).skip((page - 1) * limit));

        case 9:
          blogs = _context4.sent;
          _context4.next = 12;
          return regeneratorRuntime.awrap(Blog.countDocuments(searchQuery));

        case 12:
          total = _context4.sent;
          console.log("\u2705 Found ".concat(blogs.length, " blogs out of ").concat(total, " total for admin"));
          res.json({
            success: true,
            data: blogs,
            total: total,
            pagination: {
              current: parseInt(page),
              pages: Math.ceil(total / limit),
              total: total
            }
          });
          _context4.next = 21;
          break;

        case 17:
          _context4.prev = 17;
          _context4.t0 = _context4["catch"](0);
          console.error('❌ Error fetching admin blogs:', _context4.t0);
          res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: _context4.t0.message
          });

        case 21:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 17]]);
}); // ✅ POST /api/blogs/admin/create - Create new blog

router.post('/admin/create', adminAuth, function _callee5(req, res) {
  var excerpt, newBlog, savedBlog;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          console.log('📝 POST /api/blogs/admin/create - Creating new blog...');
          console.log('👤 Request by admin:', req.user.email);

          if (!(!req.body.title || !req.body.content)) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            success: false,
            message: 'Title and content are required fields'
          }));

        case 5:
          excerpt = req.body.excerpt || (req.body.content.length > 150 ? req.body.content.substring(0, 150) + '...' : req.body.content);
          newBlog = new Blog({
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
          _context5.next = 9;
          return regeneratorRuntime.awrap(newBlog.save());

        case 9:
          savedBlog = _context5.sent;
          console.log('✅ Blog created successfully:', savedBlog.title);
          res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: savedBlog
          });
          _context5.next = 20;
          break;

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](0);
          console.error('❌ Error creating blog:', _context5.t0);

          if (!(_context5.t0.name === 'ValidationError')) {
            _context5.next = 19;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            success: false,
            message: 'Validation error',
            error: _context5.t0.message
          }));

        case 19:
          res.status(500).json({
            success: false,
            message: 'Server error creating blog',
            error: _context5.t0.message
          });

        case 20:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); // ✅ PUT /api/blogs/admin/update/:id - Update blog post

router.put('/admin/update/:id', adminAuth, function _callee6(req, res) {
  var updateData, updatedBlog;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          console.log('✏️ PUT /api/blogs/admin/update/', req.params.id);
          console.log('👤 Request by admin:', req.user.email);

          if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            _context6.next = 5;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            success: false,
            message: 'Invalid blog ID format'
          }));

        case 5:
          updateData = _objectSpread({}, req.body, {
            updatedAt: new Date()
          }); // Handle imageUrl/image field consistency

          if (req.body.imageUrl) {
            updateData.imageUrl = req.body.imageUrl;
          } else if (req.body.image) {
            updateData.imageUrl = req.body.image;
          }

          _context6.next = 9;
          return regeneratorRuntime.awrap(Blog.findByIdAndUpdate(req.params.id, updateData, {
            "new": true,
            runValidators: true
          }));

        case 9:
          updatedBlog = _context6.sent;

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

          _context6.next = 19;
          break;

        case 13:
          _context6.prev = 13;
          _context6.t0 = _context6["catch"](0);
          console.error('❌ Error updating blog:', _context6.t0);

          if (!(_context6.t0.name === 'ValidationError')) {
            _context6.next = 18;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            success: false,
            message: 'Validation error',
            error: _context6.t0.message
          }));

        case 18:
          res.status(500).json({
            success: false,
            message: 'Error updating blog',
            error: _context6.t0.message
          });

        case 19:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // ✅ DELETE /api/blogs/admin/delete/:id - Delete blog post

router["delete"]('/admin/delete/:id', adminAuth, function _callee7(req, res) {
  var deletedBlog;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          console.log('🗑️ DELETE /api/blogs/admin/delete/', req.params.id);
          console.log('👤 Request by admin:', req.user.email);

          if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            _context7.next = 5;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            success: false,
            message: 'Invalid blog ID format'
          }));

        case 5:
          _context7.next = 7;
          return regeneratorRuntime.awrap(Blog.findByIdAndDelete(req.params.id));

        case 7:
          deletedBlog = _context7.sent;

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

          _context7.next = 15;
          break;

        case 11:
          _context7.prev = 11;
          _context7.t0 = _context7["catch"](0);
          console.error('❌ Error deleting blog:', _context7.t0);
          res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: _context7.t0.message
          });

        case 15:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // ✅ GET /api/blogs/admin/:id - Get single blog for admin

router.get('/admin/:id', adminAuth, function _callee8(req, res) {
  var blog;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          console.log('📡 GET /api/blogs/admin/', req.params.id);
          console.log('👤 Request by admin:', req.user.email);

          if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            _context8.next = 5;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            success: false,
            message: 'Invalid blog ID format'
          }));

        case 5:
          _context8.next = 7;
          return regeneratorRuntime.awrap(Blog.findById(req.params.id));

        case 7:
          blog = _context8.sent;

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

          _context8.next = 15;
          break;

        case 11:
          _context8.prev = 11;
          _context8.t0 = _context8["catch"](0);
          console.error('❌ Error fetching blog post:', _context8.t0);
          res.status(500).json({
            success: false,
            message: 'Error fetching blog post',
            error: _context8.t0.message
          });

        case 15:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
console.log('✅ Blog routes initialized with proper structure');
module.exports = router;