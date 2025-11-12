"use strict";

// backend/routes/projects.js - FIXED ROUTE STRUCTURE
var express = require('express');

var mongoose = require('mongoose');

var router = express.Router();

var _require = require('../middleware/auth'),
    adminAuth = _require.adminAuth; // ✅ Add authentication


console.log('🔧 Initializing projects routes...');
var Project;

try {
  Project = require('../models/Project');
  console.log('✅ Project model loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Project model:', error.message);
  Project = mongoose.model('Project');
} // 🔐 APPLY ADMIN AUTH MIDDLEWARE TO ADMIN ROUTES


router.use('/admin', adminAuth); // ✅ GET /api/projects - Get all projects for PUBLIC (FIXED PATH)

router.get('/', function _callee(req, res) {
  var projects;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          console.log('📡 GET /api/projects - Fetching all projects for public...');
          _context.next = 4;
          return regeneratorRuntime.awrap(Project.find({}).sort({
            createdAt: -1
          }));

        case 4:
          projects = _context.sent;
          console.log("\u2705 Found ".concat(projects.length, " projects for public"));
          res.json({
            success: true,
            data: projects,
            count: projects.length
          });
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.error('❌ Error fetching projects:', _context.t0);
          res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: _context.t0.message
          });

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // ✅ ADMIN ROUTES (require authentication)
// GET /api/projects/admin - Get all projects for admin (FIXED PATH)

router.get('/admin', function _callee2(req, res) {
  var projects;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          console.log('📡 GET /api/projects/admin - Fetching all projects for admin...');
          console.log('👤 Request by admin:', req.user.email);
          _context2.next = 5;
          return regeneratorRuntime.awrap(Project.find({}).sort({
            createdAt: -1
          }));

        case 5:
          projects = _context2.sent;
          console.log("\u2705 Found ".concat(projects.length, " projects for admin"));
          res.json({
            success: true,
            data: projects,
            count: projects.length
          });
          _context2.next = 14;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          console.error('❌ Error fetching projects for admin:', _context2.t0);
          res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: _context2.t0.message
          });

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
}); // POST /api/projects/admin - Create new project (FIXED PATH)

router.post('/admin', function _callee3(req, res) {
  var newProject, savedProject;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          console.log('📝 POST /api/projects/admin - Creating new project...');
          console.log('👤 Request by admin:', req.user.email);
          console.log('📦 Request body:', req.body);

          if (!(!req.body.name || !req.body.description)) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: 'Name and description are required fields'
          }));

        case 6:
          newProject = new Project({
            name: req.body.name,
            description: req.body.description,
            technologies: req.body.technologies || [],
            githubUrl: req.body.githubUrl || '',
            liveUrl: req.body.liveUrl || '',
            demoUrl: req.body.demoUrl || '',
            featured: req.body.featured || false,
            image: req.body.image || ''
          });
          _context3.next = 9;
          return regeneratorRuntime.awrap(newProject.save());

        case 9:
          savedProject = _context3.sent;
          console.log('✅ Project created successfully:', savedProject.name);
          res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: savedProject
          });
          _context3.next = 20;
          break;

        case 14:
          _context3.prev = 14;
          _context3.t0 = _context3["catch"](0);
          console.error('❌ Error creating project:', _context3.t0);

          if (!(_context3.t0.name === 'ValidationError')) {
            _context3.next = 19;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: 'Validation error',
            error: _context3.t0.message
          }));

        case 19:
          res.status(500).json({
            success: false,
            message: 'Server error creating project',
            error: _context3.t0.message
          });

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); // PUT /api/projects/admin/:id - Update project (FIXED PATH)

router.put('/admin/:id', function _callee4(req, res) {
  var updateData, updatedProject;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          console.log('✏️ PUT /api/projects/admin/', req.params.id);
          console.log('👤 Request by admin:', req.user.email);
          console.log('📦 Update data:', req.body);

          if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            success: false,
            message: 'Invalid project ID format'
          }));

        case 6:
          updateData = {
            name: req.body.name,
            description: req.body.description,
            technologies: req.body.technologies || [],
            githubUrl: req.body.githubUrl || '',
            liveUrl: req.body.liveUrl || '',
            demoUrl: req.body.demoUrl || '',
            featured: req.body.featured || false,
            image: req.body.image || ''
          };
          _context4.next = 9;
          return regeneratorRuntime.awrap(Project.findByIdAndUpdate(req.params.id, updateData, {
            "new": true,
            runValidators: true
          }));

        case 9:
          updatedProject = _context4.sent;

          if (updatedProject) {
            console.log('✅ Project updated successfully:', updatedProject.name);
            res.json({
              success: true,
              message: 'Project updated successfully',
              data: updatedProject
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'Project not found'
            });
          }

          _context4.next = 19;
          break;

        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](0);
          console.error('❌ Error updating project:', _context4.t0);

          if (!(_context4.t0.name === 'ValidationError')) {
            _context4.next = 18;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            success: false,
            message: 'Validation error',
            error: _context4.t0.message
          }));

        case 18:
          res.status(500).json({
            success: false,
            message: 'Error updating project',
            error: _context4.t0.message
          });

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // DELETE /api/projects/admin/:id - Delete project (FIXED PATH)

router["delete"]('/admin/:id', function _callee5(req, res) {
  var deletedProject;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          console.log('🗑️ DELETE /api/projects/admin/', req.params.id);
          console.log('👤 Request by admin:', req.user.email);

          if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            success: false,
            message: 'Invalid project ID format'
          }));

        case 5:
          _context5.next = 7;
          return regeneratorRuntime.awrap(Project.findByIdAndDelete(req.params.id));

        case 7:
          deletedProject = _context5.sent;

          if (deletedProject) {
            console.log('✅ Project deleted successfully:', deletedProject.name);
            res.json({
              success: true,
              message: 'Project deleted successfully',
              data: {
                id: deletedProject._id,
                name: deletedProject.name
              }
            });
          } else {
            console.log('❌ Project not found for deletion:', req.params.id);
            res.status(404).json({
              success: false,
              message: 'Project not found'
            });
          }

          _context5.next = 15;
          break;

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          console.error('❌ Error deleting project:', _context5.t0);
          res.status(500).json({
            success: false,
            message: 'Error deleting project',
            error: _context5.t0.message
          });

        case 15:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); // KEEP YOUR EXISTING UTILITY ROUTES (they're fine)
// PATCH /api/projects/admin/fix-demo-urls - Fix existing projects missing demoUrl

router.patch('/admin/fix-demo-urls', function _callee6(req, res) {
  var projects, updatedCount, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, project;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          console.log('🔧 PATCH: Fixing projects missing demoUrl field...');
          console.log('👤 Request by admin:', req.user.email);
          _context6.next = 5;
          return regeneratorRuntime.awrap(Project.find({}));

        case 5:
          projects = _context6.sent;
          updatedCount = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context6.prev = 10;
          _iterator = projects[Symbol.iterator]();

        case 12:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context6.next = 22;
            break;
          }

          project = _step.value;

          if (!(project.demoUrl === undefined || project.demoUrl === null)) {
            _context6.next = 19;
            break;
          }

          _context6.next = 17;
          return regeneratorRuntime.awrap(Project.findByIdAndUpdate(project._id, {
            $set: {
              demoUrl: ''
            }
          }, {
            "new": true
          }));

        case 17:
          updatedCount++;
          console.log("\u2705 Fixed project: ".concat(project.name));

        case 19:
          _iteratorNormalCompletion = true;
          _context6.next = 12;
          break;

        case 22:
          _context6.next = 28;
          break;

        case 24:
          _context6.prev = 24;
          _context6.t0 = _context6["catch"](10);
          _didIteratorError = true;
          _iteratorError = _context6.t0;

        case 28:
          _context6.prev = 28;
          _context6.prev = 29;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 31:
          _context6.prev = 31;

          if (!_didIteratorError) {
            _context6.next = 34;
            break;
          }

          throw _iteratorError;

        case 34:
          return _context6.finish(31);

        case 35:
          return _context6.finish(28);

        case 36:
          console.log("\uD83C\uDF89 Fixed ".concat(updatedCount, " projects"));
          res.json({
            success: true,
            message: "Updated ".concat(updatedCount, " projects with demoUrl field"),
            updatedCount: updatedCount
          });
          _context6.next = 44;
          break;

        case 40:
          _context6.prev = 40;
          _context6.t1 = _context6["catch"](0);
          console.error('❌ Error fixing demo URLs:', _context6.t1);
          res.status(500).json({
            success: false,
            message: 'Error fixing demo URLs',
            error: _context6.t1.message
          });

        case 44:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 40], [10, 24, 28, 36], [29,, 31, 35]]);
}); // GET /api/projects/debug - Debug route (public)

router.get('/debug', function _callee7(req, res) {
  var projects;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          console.log('🐛 GET /api/projects/debug - Debugging projects data...');
          _context7.next = 4;
          return regeneratorRuntime.awrap(Project.find({}).sort({
            createdAt: -1
          }));

        case 4:
          projects = _context7.sent;
          console.log("\uD83D\uDD0D Found ".concat(projects.length, " projects for debugging"));
          res.json({
            success: true,
            data: projects,
            count: projects.length,
            debug: projects.map(function (p) {
              return {
                name: p.name,
                liveUrl: p.liveUrl,
                githubUrl: p.githubUrl,
                demoUrl: p.demoUrl,
                featured: p.featured,
                technologies: p.technologies
              };
            })
          });
          _context7.next = 13;
          break;

        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          console.error('❌ Error in debug route:', _context7.t0);
          res.status(500).json({
            success: false,
            message: 'Debug error',
            error: _context7.t0.message
          });

        case 13:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
console.log('✅ Projects routes initialized with proper API structure');
module.exports = router;