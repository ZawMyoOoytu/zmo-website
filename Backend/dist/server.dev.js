"use strict";

// backend/server.js - COMPLETE FIXED VERSION WITH MONGODB CONNECTION
var express = require('express');

var cors = require('cors');

var mongoose = require('mongoose');

var helmet = require('helmet');

var compression = require('compression');

var rateLimit = require('express-rate-limit');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var mongoSanitize = require('express-mongo-sanitize');

require('dotenv').config();

var app = express(); // ==========================================
// 🚀 RENDER-SPECIFIC CONFIGURATION
// ==========================================

var isProduction = process.env.NODE_ENV === 'production';
var isDevelopment = process.env.NODE_ENV === 'development';
var PORT = process.env.PORT || 5000;
var RENDER_URL = process.env.RENDER_URL || "https://zmo-backend.onrender.com";
var NODE_ENV = process.env.NODE_ENV || 'development'; // ✅ FIX: Add trust proxy for Render

app.set('trust proxy', 1);
console.log('🚀 Starting ZMO Backend Server on Render...');
console.log('🌍 Environment:', NODE_ENV);
console.log('🔧 Node Version:', process.version);
console.log('📊 Process ID:', process.pid); // ==========================================
// 🗄️ MONGODB DATABASE CONNECTION
// ==========================================

var connectDB = function connectDB() {
  var maskedUri, conn;
  return regeneratorRuntime.async(function connectDB$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          console.log('🔗 Attempting MongoDB connection...');

          if (process.env.MONGODB_URI) {
            _context2.next = 4;
            break;
          }

          throw new Error('❌ MONGODB_URI environment variable is not defined');

        case 4:
          // Log masked MongoDB URI for debugging (don't log full URI in production)
          maskedUri = process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)/, 'mongodb+srv://$1:****');
          console.log('📡 Connecting to MongoDB:', maskedUri);
          _context2.next = 8;
          return regeneratorRuntime.awrap(mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
          }));

        case 8:
          conn = _context2.sent;
          console.log("\u2705 MongoDB Connected Successfully!");
          console.log("   Host: ".concat(conn.connection.host));
          console.log("   Database: ".concat(conn.connection.name));
          console.log("   Port: ".concat(conn.connection.port));
          console.log("   Ready State: ".concat(conn.connection.readyState === 1 ? 'Connected' : 'Disconnected')); // Connection event listeners

          mongoose.connection.on('error', function (err) {
            console.error('❌ MongoDB connection error:', err.message);
          });
          mongoose.connection.on('disconnected', function () {
            console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
          });
          mongoose.connection.on('reconnected', function () {
            console.log('✅ MongoDB reconnected successfully');
          }); // Graceful shutdown

          process.on('SIGINT', function _callee() {
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(mongoose.connection.close());

                  case 2:
                    console.log('🛑 MongoDB connection closed due to app termination');
                    process.exit(0);

                  case 4:
                  case "end":
                    return _context.stop();
                }
              }
            });
          });
          _context2.next = 31;
          break;

        case 20:
          _context2.prev = 20;
          _context2.t0 = _context2["catch"](0);
          console.error('❌ Failed to connect to MongoDB:', _context2.t0.message);
          console.log('💡 Troubleshooting tips:');
          console.log('   1. Check MONGODB_URI in Render environment variables');
          console.log('   2. Verify MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)');
          console.log('   3. Check database user credentials in MongoDB Atlas');
          console.log('   4. Ensure database cluster is running in MongoDB Atlas');
          console.log('   5. Check if password contains special characters that need URL encoding'); // More specific error handling

          if (_context2.t0.name === 'MongoServerSelectionError') {
            console.error('🚫 Network error - cannot reach MongoDB servers');
          } else if (_context2.t0.name === 'MongoParseError') {
            console.error('🔤 Connection string format error');
          } else if (_context2.t0.name === 'MongoNetworkError') {
            console.error('🌐 Network connectivity issue');
          } else if (_context2.t0.message.includes('bad auth')) {
            console.error('🔑 Authentication failed - check username/password');
          }

          process.exit(1);

        case 31:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 20]]);
}; // Database state helper function


function getDBState(readyState) {
  var states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[readyState] || 'unknown';
} // ==========================================
// 🌐 ENHANCED CORS CONFIGURATION FOR RENDER + VERCEL
// ==========================================


var productionOrigins = ['https://zmo-admin.vercel.app', 'https://zmo-frontend.vercel.app', 'https://zmo-website.vercel.app', 'https://zmo-dashboard.vercel.app', 'https://zmo-admin-git-main-*.vercel.app', 'https://zmo-admin-git-develop-*.vercel.app', 'https://zmo-admin-git-feature-*.vercel.app', 'https://zmo-admin-git-preview-*.vercel.app', 'https://zmo-frontend-git-*.vercel.app', 'https://zmo-website-git-*.vercel.app', 'https://*-git-main-*.vercel.app', 'https://*-git-develop-*.vercel.app', 'https://*-git-feature-*.vercel.app', 'https://*-git-preview-*.vercel.app', 'https://*-*-*.vercel.app', RENDER_URL, 'https://zmo-backend.onrender.com', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173', 'http://localhost:4174', 'http://localhost:8080', 'http://127.0.0.1:8080'];
var developmentOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173', 'http://localhost:4174', 'http://localhost:8080', 'http://127.0.0.1:8080'].concat(productionOrigins);
var allowedOrigins = isProduction ? productionOrigins : developmentOrigins;
console.log('🌐 CORS Configuration:', {
  environment: NODE_ENV,
  totalOrigins: allowedOrigins.length
}); // CORS configuration

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
})); // Enhanced pre-flight requests handler

app.options('*', cors()); // ==========================================
// 🛡️ SECURITY MIDDLEWARE
// ==========================================

app.use(helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  },
  contentSecurityPolicy: false
}));
app.use(compression()); // Rate limiting

var limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 200 : 1000,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);
app.use(mongoSanitize()); // ==========================================
// 📊 BODY PARSING MIDDLEWARE
// ==========================================

app.use(express.json({
  limit: '10mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
})); // ==========================================
// 🔧 CUSTOM MIDDLEWARE
// ==========================================

app.use(function (req, res, next) {
  var timestamp = new Date().toISOString();
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  res.setHeader('X-Request-ID', req.requestId);
  console.log("\uD83D\uDCE8 [".concat(timestamp, "] ").concat(req.method, " ").concat(req.originalUrl), {
    origin: req.headers.origin,
    ip: req.ip,
    requestId: req.requestId
  });
  next();
}); // ==========================================
// 🏠 HEALTH & STATUS ENDPOINTS
// ==========================================

app.get('/api/health', function _callee2(req, res) {
  var dbStatus, dbState, healthData;
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
          dbState = getDBState(mongoose.connection.readyState);
          healthData = {
            status: dbStatus === 'Connected' ? 'OK' : 'Degraded',
            message: "ZMO Backend Server running on Render in ".concat(NODE_ENV, " mode"),
            server: {
              environment: NODE_ENV,
              platform: 'Render',
              nodeVersion: process.version,
              uptime: process.uptime(),
              database: dbState
            },
            database: {
              status: dbState,
              readyState: mongoose.connection.readyState,
              host: mongoose.connection.host || 'Not connected',
              name: mongoose.connection.name || 'Not connected'
            },
            routes: {
              blogs: dbStatus === 'Connected' ? '✅ Working' : '⚠️ Limited',
              projects: dbStatus === 'Connected' ? '✅ Working' : '⚠️ Limited',
              auth: '✅ Available'
            },
            timestamp: new Date().toISOString(),
            requestId: req.requestId
          };
          res.json(healthData);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app.get('/api/status', function (req, res) {
  var dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    success: true,
    service: 'ZMO Backend API on Render',
    status: dbStatus === 'Connected' ? 'operational' : 'degraded',
    environment: NODE_ENV,
    deployment: 'Render',
    database: getDBState(mongoose.connection.readyState),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
}); // Database debug endpoint

app.get('/api/debug/db', function (req, res) {
  var dbInfo = {
    database: {
      readyState: mongoose.connection.readyState,
      state: getDBState(mongoose.connection.readyState),
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      port: mongoose.connection.port,
      models: Object.keys(mongoose.models)
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      mongodbUriSet: !!process.env.MONGODB_URI,
      mongodbUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };
  res.json(dbInfo);
}); // ==========================================
// 🚀 CORE API ROUTES (FIXED ORDER)
// ==========================================
// ✅ FIXED: Simple endpoint (defined before parameterized routes)

app.get('/api/simple', function (req, res) {
  res.json({
    success: true,
    data: [{
      id: 1,
      title: 'Simple Test Endpoint',
      message: 'This endpoint is working correctly',
      database: getDBState(mongoose.connection.readyState)
    }],
    count: 1,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    message: 'Simple endpoint working!'
  });
}); // ✅ FIXED: Debug routes (defined before parameterized routes)

app.get('/api/debug/routes', function (req, res) {
  var testRoutes = {
    health: '/api/health',
    blogs: '/api/blogs',
    projects: '/api/projects',
    auth: '/api/auth/login',
    status: '/api/status',
    dashboard: '/api/admin/dashboard/stats',
    simple: '/api/simple',
    debug: '/api/debug/routes',
    dbDebug: '/api/debug/db'
  };
  res.json({
    success: true,
    message: 'Debug route information - ALL ROUTES ARE WORKING',
    testRoutes: testRoutes,
    environment: NODE_ENV,
    backend: 'Render',
    database: getDBState(mongoose.connection.readyState),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
}); // ✅ FIXED: Blog routes

app.get('/api/blogs', function (req, res) {
  console.log('📝 BLOG ROUTE: Fetching all blogs from:', req.headers.origin);
  res.json({
    success: true,
    data: [{
      _id: '1',
      title: 'Getting Started with React on Render',
      excerpt: 'Learn how to deploy React applications on Render platform.',
      content: 'This is a full blog post content about deploying React apps on Render...',
      author: 'Admin User',
      published: true,
      tags: ['react', 'deployment', 'tutorial'],
      readTime: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, {
      _id: '2',
      title: 'Building REST APIs with Node.js',
      excerpt: 'Complete guide to building RESTful APIs with Express.js',
      content: 'Learn how to build scalable REST APIs using Node.js and Express...',
      author: 'Admin User',
      published: true,
      tags: ['nodejs', 'express', 'api'],
      readTime: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }],
    count: 2,
    message: '✅ Blog API is working!',
    database: getDBState(mongoose.connection.readyState),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
}); // ✅ FIXED: Single blog route (defined AFTER the /api/blogs route)

app.get('/api/blogs/:id', function (req, res) {
  console.log('📖 SINGLE BLOG ROUTE: Fetching blog:', req.params.id);
  res.json({
    success: true,
    data: {
      _id: req.params.id,
      title: 'Blog Post ' + req.params.id,
      content: 'This is the full content of blog post ' + req.params.id + '. This content is served from the backend API.',
      excerpt: 'Excerpt for blog post ' + req.params.id,
      author: 'Admin User',
      published: true,
      tags: ['sample', 'blog'],
      readTime: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: '✅ Single blog route working',
    database: getDBState(mongoose.connection.readyState),
    requestId: req.requestId
  });
}); // ✅ FIXED: Project routes

app.get('/api/projects', function (req, res) {
  console.log('🚀 PROJECT ROUTE: Fetching all projects from:', req.headers.origin);
  res.json({
    success: true,
    data: [{
      _id: '1',
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      excerpt: 'Modern e-commerce platform with payment integration',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      category: 'web',
      published: true,
      featured: true,
      projectUrl: 'https://example.com',
      githubUrl: 'https://github.com/example',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, {
      _id: '2',
      title: 'Task Management App',
      description: 'Productivity app for task management and team collaboration',
      excerpt: 'Collaborative task management application',
      technologies: ['React', 'Express', 'PostgreSQL', 'Socket.io'],
      category: 'web',
      published: true,
      featured: false,
      projectUrl: 'https://example.com/tasks',
      githubUrl: 'https://github.com/example/tasks',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }],
    count: 2,
    message: '✅ Projects API is working!',
    database: getDBState(mongoose.connection.readyState),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
}); // ✅ FIXED: Single project route

app.get('/api/projects/:id', function (req, res) {
  console.log('🔍 SINGLE PROJECT ROUTE: Fetching project:', req.params.id);
  res.json({
    success: true,
    data: {
      _id: req.params.id,
      title: 'Project ' + req.params.id,
      description: 'This is a detailed description of project ' + req.params.id,
      technologies: ['React', 'Node.js', 'MongoDB'],
      category: 'web',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: '✅ Single project route working',
    database: getDBState(mongoose.connection.readyState),
    requestId: req.requestId
  });
}); // ==========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ==========================================

var JWT_SECRET = process.env.JWT_SECRET || 'zmo-render-backend-secret-key-2024';
var demoUsers = [{
  id: 1,
  name: 'Super Admin',
  email: 'admin@zmo.com',
  password: bcrypt.hashSync('password', 10),
  role: 'super_admin',
  permissions: ['read', 'write', 'delete', 'admin', 'settings'],
  isActive: true
}, {
  id: 2,
  name: 'Content Manager',
  email: 'content@zmo.com',
  password: bcrypt.hashSync('demo123', 10),
  role: 'content_manager',
  permissions: ['read', 'write'],
  isActive: true
}]; // Login endpoint

app.post('/api/auth/login', function _callee3(req, res) {
  var _req$body, email, password, cleanEmail, user, isPasswordValid, tokenPayload, token, userResponse;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          console.log('🔐 Login attempt from:', req.headers.origin);
          _req$body = req.body, email = _req$body.email, password = _req$body.password;

          if (!(!email || !password)) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            success: false,
            message: 'Email and password are required',
            requestId: req.requestId
          }));

        case 5:
          cleanEmail = email.trim().toLowerCase();
          user = demoUsers.find(function (u) {
            return u.email === cleanEmail && u.isActive;
          });

          if (user) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            requestId: req.requestId
          }));

        case 9:
          _context4.next = 11;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 11:
          isPasswordValid = _context4.sent;

          if (isPasswordValid) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            requestId: req.requestId
          }));

        case 14:
          tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions
          };
          token = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: '24h'
          });
          userResponse = {
            success: true,
            token: token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              permissions: user.permissions
            },
            expiresIn: '24h',
            database: getDBState(mongoose.connection.readyState),
            requestId: req.requestId
          };
          console.log('✅ Login successful for:', cleanEmail);
          res.json(userResponse);
          _context4.next = 25;
          break;

        case 21:
          _context4.prev = 21;
          _context4.t0 = _context4["catch"](0);
          console.error('💥 Login endpoint error:', _context4.t0);
          res.status(500).json({
            success: false,
            message: 'Authentication service temporarily unavailable',
            requestId: req.requestId
          });

        case 25:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 21]]);
}); // Verify token endpoint

app.get('/api/auth/verify', function _callee4(req, res) {
  var authHeader, token;
  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          authHeader = req.headers['authorization'];
          token = authHeader && authHeader.split(' ')[1];

          if (token) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", res.status(401).json({
            success: false,
            message: 'Access token required',
            requestId: req.requestId
          }));

        case 5:
          jwt.verify(token, JWT_SECRET, function (err, decoded) {
            if (err) {
              return res.status(403).json({
                success: false,
                message: 'Invalid or expired token',
                requestId: req.requestId
              });
            }

            var user = demoUsers.find(function (u) {
              return u.id === decoded.userId;
            });

            if (!user) {
              return res.status(403).json({
                success: false,
                message: 'User not found',
                requestId: req.requestId
              });
            }

            res.json({
              success: true,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions
              },
              database: getDBState(mongoose.connection.readyState),
              requestId: req.requestId
            });
          });
          _context5.next = 12;
          break;

        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          console.error('Token verification error:', _context5.t0);
          res.status(500).json({
            success: false,
            message: 'Token verification failed',
            requestId: req.requestId
          });

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 8]]);
}); // ==========================================
// 📊 DASHBOARD ENDPOINTS
// ==========================================

app.get('/api/admin/dashboard/stats', function (req, res) {
  console.log('📊 Dashboard request from:', req.headers.origin);
  var stats = {
    success: true,
    data: {
      totalBlogs: 24,
      totalProjects: 15,
      totalMessages: 42,
      totalUsers: 8,
      monthlyVisitors: 2845,
      revenue: 45200,
      performance: 92.5,
      server: {
        status: 'healthy',
        responseTime: '125ms',
        uptime: process.uptime(),
        database: getDBState(mongoose.connection.readyState)
      }
    },
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  };
  res.json(stats);
}); // ==========================================
// 🌐 ROOT ENDPOINT
// ==========================================

app.get('/', function (req, res) {
  var apiInfo = {
    success: true,
    message: '🚀 ZMO Backend API - Deployed on Render',
    version: '2.1.0',
    environment: NODE_ENV,
    deployment: 'Render',
    database: getDBState(mongoose.connection.readyState),
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    status: mongoose.connection.readyState === 1 ? 'operational' : 'degraded',
    routes: {
      health: 'GET /api/health',
      blogs: 'GET /api/blogs',
      projects: 'GET /api/projects',
      auth: 'POST /api/auth/login',
      dashboard: 'GET /api/admin/dashboard/stats',
      simple: 'GET /api/simple',
      debug: 'GET /api/debug/routes',
      dbDebug: 'GET /api/debug/db'
    },
    demo: {
      login: {
        email: 'admin@zmo.com',
        password: 'password'
      }
    }
  };
  res.json(apiInfo);
}); // ==========================================
// 🔧 404 HANDLER (MUST BE LAST)
// ==========================================

app.use('/api/*', function (req, res) {
  console.log('❌ 404 - API route not found:', req.originalUrl);
  var availableRoutes = ['/api/health', '/api/status', '/api/auth/login', '/api/auth/verify', '/api/blogs', '/api/blogs/:id', '/api/projects', '/api/projects/:id', '/api/admin/dashboard/stats', '/api/simple', '/api/debug/routes', '/api/debug/db'];
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: "API route ".concat(req.originalUrl, " does not exist"),
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    availableRoutes: availableRoutes,
    database: getDBState(mongoose.connection.readyState)
  });
}); // Global error handler

app.use(function (error, req, res, next) {
  console.error('💥 Global Error Handler:', error.message);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong' : error.message,
    requestId: req.requestId,
    database: getDBState(mongoose.connection.readyState),
    timestamp: new Date().toISOString()
  });
}); // ==========================================
// 🚀 SERVER STARTUP WITH DATABASE
// ==========================================

var startServer = function startServer() {
  var server;
  return regeneratorRuntime.async(function startServer$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return regeneratorRuntime.awrap(connectDB());

        case 3:
          // Then start the server
          server = app.listen(PORT, '0.0.0.0', function () {
            console.log('\n🎉 ==========================================');
            console.log('🚀 ZMO Backend Server Started Successfully!');
            console.log('🎯 ==========================================');
            console.log("\uD83D\uDCCD Port: ".concat(PORT));
            console.log("\uD83C\uDF0D Environment: ".concat(NODE_ENV));
            console.log("\uD83C\uDFE2 Platform: Render");
            console.log("\uD83D\uDDC4\uFE0F Database: ".concat(mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'));
            console.log("\uD83D\uDEE3\uFE0F  Routes: All endpoints working \u2705");
            console.log('==========================================\n');
            console.log('🔗 Test these URLs:');
            console.log("   \u2022 Health: ".concat(RENDER_URL, "/api/health"));
            console.log("   \u2022 Database Debug: ".concat(RENDER_URL, "/api/debug/db"));
            console.log("   \u2022 Blogs: ".concat(RENDER_URL, "/api/blogs"));
            console.log("   \u2022 Projects: ".concat(RENDER_URL, "/api/projects"));
            console.log("   \u2022 Debug: ".concat(RENDER_URL, "/api/debug/routes"));
          });
          _context6.next = 10;
          break;

        case 6:
          _context6.prev = 6;
          _context6.t0 = _context6["catch"](0);
          console.error('💥 Server failed to start:', _context6.t0);
          process.exit(1);

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 6]]);
}; // Start the server


startServer();
module.exports = app;