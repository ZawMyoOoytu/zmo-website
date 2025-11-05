const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// ==========================================
// 🚀 RENDER-SPECIFIC CONFIGURATION
// ==========================================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 5000;
const RENDER_URL = process.env.RENDER_URL || `https://zmo-backend.onrender.com`;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Starting ZMO Backend Server on Render...');
console.log('🌍 Environment:', NODE_ENV);
console.log('🔧 Node Version:', process.version);
console.log('📊 Process ID:', process.pid);

// ==========================================
// 🌐 ENHANCED CORS CONFIGURATION FOR RENDER
// ==========================================
const productionOrigins = [
  'https://zmo-admin.vercel.app',
  'https://zmo-frontend.vercel.app',
  'https://zmo-website.vercel.app',
  'https://zmo-dashboard.vercel.app',
  RENDER_URL,
  'https://zmo-backend.onrender.com' // Your Render backend URL
];

const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  ...productionOrigins // Include production URLs in development
];

const allowedOrigins = isProduction ? productionOrigins : developmentOrigins;

console.log('🌐 CORS Enabled for origins:', allowedOrigins);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, etc.)
    if (!origin && isDevelopment) return callback(null, true);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS Blocked Origin:', origin);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'x-environment',
    'X-Environment',
    'X-API-Key',
    'Cache-Control',
    'x-requested-with'
  ],
  exposedHeaders: ['X-Request-ID', 'X-API-Version', 'X-Token-Expiry']
};

app.use(cors(corsOptions));

// Handle pre-flight requests
app.options('*', cors(corsOptions));

// ==========================================
// 🛡️ ENHANCED SECURITY MIDDLEWARE
// ==========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(compression());

// Rate limiting - Adjusted for Render
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 1000, // Higher limits for Render
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// MongoDB sanitization
app.use(mongoSanitize());

// ==========================================
// 📊 BODY PARSING MIDDLEWARE
// ==========================================
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// ==========================================
// 🔧 CUSTOM MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers dynamically
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Security headers for production
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  res.setHeader('X-API-Version', '2.0.0');
  res.setHeader('X-Deployment-Platform', 'Render');
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  res.setHeader('X-Request-ID', req.requestId);

  // Enhanced logging for Render
  console.log(`📨 [${timestamp}] ${req.method} ${req.originalUrl}`, {
    origin: req.headers.origin,
    ip: req.ip || req.connection.remoteAddress,
    'user-agent': req.headers['user-agent']?.substring(0, 30) + '...',
    requestId: req.requestId
  });
  
  next();
});

// ==========================================
// 🗄️ MONGODB CONNECTION (Render Optimized)
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zmo-database';

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout for Render
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Monitor connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB reconnected');
    });

  } catch (error) {
    console.error('💥 MongoDB connection failed:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// ==========================================
// 🏠 HEALTH & STATUS ENDPOINTS
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus];
    const memoryUsage = process.memoryUsage();
    
    const healthData = {
      status: dbStatus === 1 ? 'OK' : 'WARNING',
      message: `ZMO Backend Server running on Render in ${NODE_ENV} mode`,
      database: {
        status: statusText,
        readyState: dbStatus
      },
      server: {
        environment: NODE_ENV,
        platform: 'Render',
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      cors: {
        enabled: true,
        allowedOrigins: allowedOrigins.length
      }
    };

    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(dbStatus === 1 ? 200 : 503).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Server health check failed',
      error: isProduction ? 'Internal error' : error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    service: 'ZMO Backend API on Render',
    status: 'operational',
    environment: NODE_ENV,
    deployment: 'Render',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// ==========================================
// 🔐 ENHANCED AUTHENTICATION SYSTEM
// ==========================================

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 15 : 50,
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login attempts, please try again later.'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'zmo-render-backend-secret-key-2024';

// Demo users database (in production, use real MongoDB)
const demoUsers = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'admin@zmo.com',
    password: 'password', // Will be hashed
    role: 'super_admin',
    permissions: ['read', 'write', 'delete', 'admin', 'settings'],
    avatar: null,
    isActive: true,
    lastLogin: null
  },
  {
    id: 2,
    name: 'Content Manager',
    email: 'content@zmo.com',
    password: 'demo123',
    role: 'content_manager',
    permissions: ['read', 'write'],
    avatar: null,
    isActive: true,
    lastLogin: null
  }
];

// Hash demo passwords (in real app, do this on user creation)
demoUsers.forEach(user => {
  user.password = bcrypt.hashSync(user.password, 10);
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt from:', req.headers.origin);
    
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required',
        requestId: req.requestId
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    console.log('🔑 Processing login for:', cleanEmail);

    // Find user in demo database
    const user = demoUsers.find(u => u.email === cleanEmail && u.isActive);
    
    if (!user) {
      console.log('❌ User not found:', cleanEmail);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password',
        requestId: req.requestId
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', cleanEmail);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password',
        requestId: req.requestId
      });
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Update last login
    user.lastLogin = new Date().toISOString();

    const userResponse = {
      success: true,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      },
      expiresIn: '24h',
      requestId: req.requestId
    };

    // Add demo info in development
    if (isDevelopment) {
      userResponse.demo = {
        note: 'This is a demo authentication system',
        available_users: demoUsers.map(u => ({ email: u.email, role: u.role }))
      };
    }

    console.log('✅ Login successful for:', cleanEmail);
    
    res.json(userResponse);
  } catch (error) {
    console.error('💥 Login endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service temporarily unavailable',
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

// Token verification middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        requestId: req.requestId
      });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ Token verification failed:', err.message);
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
          requestId: req.requestId
        });
      }

      req.user = decoded;
      console.log('✅ Token verified for user:', decoded.email);
      next();
    });
  } catch (error) {
    console.error('Token middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      requestId: req.requestId
    });
  }
};

// Token verification endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = demoUsers.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({
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
      permissions: user.permissions,
      avatar: user.avatar,
      lastLogin: user.lastLogin
    },
    requestId: req.requestId
  });
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  console.log('👋 Logout request from:', req.user.email);
  
  res.json({
    success: true,
    message: 'Logged out successfully',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 📊 PROTECTED ADMIN ENDPOINTS
// ==========================================

// Dashboard stats
app.get('/api/admin/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Dashboard request from:', req.user.email);
    
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const stats = {
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
          uptime: process.uptime()
        },
        recentActivities: [
          { 
            id: 1, 
            action: 'New blog published', 
            user: req.user.name, 
            time: '2 hours ago',
            type: 'blog',
            icon: '📝'
          },
          { 
            id: 2, 
            action: 'Project completed', 
            user: 'Content Team', 
            time: '5 hours ago',
            type: 'project',
            icon: '🚀'
          }
        ],
        chartData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          visitors: [65, 59, 80, 81, 56, 55, 70],
          revenue: [28, 48, 40, 19, 86, 27, 45],
          projects: [5, 8, 12, 6, 15, 10, 8]
        }
      },
      requestId: req.requestId,
      user: req.user,
      timestamp: new Date().toISOString()
    };

    res.setHeader('Cache-Control', 'private, max-age=300');
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      requestId: req.requestId
    });
  }
});

// Blog management endpoints
app.get('/api/admin/blogs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const blogsData = {
      success: true,
      data: {
        blogs: [
          {
            id: 1,
            title: 'Getting Started with React on Render',
            excerpt: 'Learn how to deploy React applications on Render platform.',
            status: 'published',
            author: req.user.name,
            tags: ['react', 'render', 'deployment'],
            featured: true,
            createdAt: '2024-01-15T10:30:00Z',
            views: 1245,
            likes: 89,
            readTime: 5
          }
        ],
        pagination: {
          total: 24,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 3
        }
      },
      requestId: req.requestId
    };

    res.json(blogsData);
  } catch (error) {
    console.error('Blogs fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      requestId: req.requestId
    });
  }
});

// ==========================================
// 🌐 ROOT ENDPOINT
// ==========================================
app.get('/', (req, res) => {
  const apiInfo = {
    success: true,
    message: '🚀 ZMO Backend API - Deployed on Render',
    version: '2.0.0',
    environment: NODE_ENV,
    deployment: 'Render',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    status: 'operational',
    features: [
      'JWT Authentication',
      'MongoDB Integration',
      'CORS Enabled',
      'Rate Limiting',
      'Helmet Security',
      'Admin Dashboard'
    ],
    demo: {
      login: {
        email: 'admin@zmo.com',
        password: 'password'
      },
      note: 'Use the credentials above for demo access'
    },
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
        logout: 'POST /api/auth/logout'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard/stats',
        blogs: 'GET /api/admin/blogs'
      }
    },
    documentation: 'https://docs.zmo.com/api',
    support: 'Check Render logs for detailed debugging'
  };

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(apiInfo);
});

// ==========================================
// 🔧 ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 Handler
app.use('/api/*', (req, res) => {
  console.log('❌ 404 - API route not found:', req.originalUrl);
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `API route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  const errorId = Date.now().toString(36);
  
  console.error('💥 Global Error Handler:', {
    errorId,
    message: error.message,
    url: req.url,
    method: req.method,
    origin: req.headers.origin,
    requestId: req.requestId
  });

  // CORS error
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Request blocked by CORS policy',
      requestId: req.requestId,
      errorId,
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin
    });
  }

  const errorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong' : error.message,
    requestId: req.requestId,
    errorId,
    timestamp: new Date().toISOString(),
    deployment: 'Render'
  };

  if (isDevelopment) {
    errorResponse.stack = error.stack;
  }

  res.status(error.status || 500).json(errorResponse);
});

// ==========================================
// 🚀 SERVER STARTUP (Render Optimized)
// ==========================================
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🎉 ==========================================');
      console.log('🚀 ZMO Backend Server Started Successfully!');
      console.log('🎯 ==========================================');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🏢 Platform: Render`);
      console.log(`🔗 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
      console.log(`🌐 CORS: Enabled for ${allowedOrigins.length} origins`);
      console.log(`🛡️ Security: Rate limiting, Helmet, CORS`);
      console.log(`📊 Demo Login: admin@zmo.com / password`);
      console.log('==========================================\n');
      
      // Log important URLs
      console.log('🔗 Important URLs:');
      console.log(`   Health Check: ${RENDER_URL}/api/health`);
      console.log(`   API Documentation: ${RENDER_URL}/`);
      console.log(`   Render Dashboard: https://render.com/dashboard`);
    });

    // Graceful shutdown for Render
    const gracefulShutdown = (signal) => {
      return () => {
        console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
        
        server.close(() => {
          console.log('✅ HTTP server closed.');
          
          if (mongoose.connection.readyState === 1) {
            mongoose.connection.close(false, () => {
              console.log('✅ MongoDB connection closed.');
              console.log('👋 Server shutdown completed.');
              process.exit(0);
            });
          } else {
            console.log('👋 Server shutdown completed.');
            process.exit(0);
          }
        });

        // Force shutdown after 8 seconds
        setTimeout(() => {
          console.log('❌ Forcing server shutdown...');
          process.exit(1);
        }, 8000);
      };
    };

    process.on('SIGTERM', gracefulShutdown('SIGTERM'));
    process.on('SIGINT', gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('💥 Server failed to start:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;