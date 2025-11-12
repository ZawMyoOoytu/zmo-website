"use strict";

// backend/routes/blogPosts.js
var express = require('express');

var router = express.Router();

var BlogPost = require('../models/BlogPost'); // GET all blog posts


router.get('/blogs', function _callee(req, res) {
  var blogs;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(BlogPost.find().sort({
            createdAt: -1
          }));

        case 3:
          blogs = _context.sent;
          res.json({
            success: true,
            data: blogs
          });
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            success: false,
            error: _context.t0.message
          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // GET single blog post by ID

router.get('/blogs/:id', function _callee2(req, res) {
  var blog;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(BlogPost.findById(req.params.id));

        case 3:
          blog = _context2.sent;

          if (blog) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            success: false,
            error: 'Blog post not found'
          }));

        case 6:
          res.json({
            success: true,
            data: blog
          });
          _context2.next = 12;
          break;

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            success: false,
            error: _context2.t0.message
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // POST create new blog post

router.post('/blogs', function _callee3(req, res) {
  var blog;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          blog = new BlogPost(req.body);
          _context3.next = 4;
          return regeneratorRuntime.awrap(blog.save());

        case 4:
          res.status(201).json({
            success: true,
            data: blog
          });
          _context3.next = 10;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          res.status(400).json({
            success: false,
            error: _context3.t0.message
          });

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // PUT update blog post

router.put('/blogs/:id', function _callee4(req, res) {
  var blog;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(BlogPost.findByIdAndUpdate(req.params.id, req.body, {
            "new": true,
            runValidators: true
          }));

        case 3:
          blog = _context4.sent;

          if (blog) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            success: false,
            error: 'Blog post not found'
          }));

        case 6:
          res.json({
            success: true,
            data: blog
          });
          _context4.next = 12;
          break;

        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](0);
          res.status(400).json({
            success: false,
            error: _context4.t0.message
          });

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // DELETE blog post

router["delete"]('/blogs/:id', function _callee5(req, res) {
  var blog;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(BlogPost.findByIdAndDelete(req.params.id));

        case 3:
          blog = _context5.sent;

          if (blog) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            success: false,
            error: 'Blog post not found'
          }));

        case 6:
          res.json({
            success: true,
            message: 'Blog post deleted successfully'
          });
          _context5.next = 12;
          break;

        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](0);
          res.status(500).json({
            success: false,
            error: _context5.t0.message
          });

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
module.exports = router;