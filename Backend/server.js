const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const app = express();

// ==========================================
// 🚀 ENVIRONMENT CONFIGURATION
// ==========================================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🚀 Starting in', isProduction ? 'PRODUCTION' : 'DEVELOPMENT', 'mode');

// ==========================================
// 🌐 CORS CONFIGURATION - FIXED FOR PRODUCTION
// ==========================================
const productionOrigins = [
  'https://zmo-admin.vercel.app',
  'https://zmo-frontend.vercel.app',
  'https://zmo-backend.vercel.app',
  'https://zmo-website.vercel.app'
];

const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173', // Vite dev server
  ...productionOrigins // Include production URLs in development
];

const allowedOrigins = isProduction ? productionOrigins : developmentOrigins;

console.log('🌐 CORS Enabled for:', allowedOrigins);

// ✅ FIXED CORS CONFIGURATION
app.use(cors({
  origin: allowedOrigins,
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
    'Cache-Control'
  ]
}));

// ✅ ENHANCED PRE-FLIGHT HANDLER
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, x-environment, X-Environment, X-API-Key, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// ==========================================
// 🛡️ SECURITY MIDDLEWARE
// ==========================================

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disabled for API, enable if serving HTML
}));

// Compression for responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ==========================================
// 📊 BODY PARSING & SECURITY
// ==========================================
app.use(express.json({ 
  limit: '10mb'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb'
}));

// ==========================================
// 🔧 CUSTOM SECURITY HEADERS
// ==========================================
app.use((req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // HSTS only in production
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // API version header
  res.setHeader('X-API-Version', '1.0.0');
  
  next();
});

// ==========================================
// 📝 REQUEST LOGGING MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  
  if (isDevelopment) {
    console.log(`📨 [${timestamp}] ${req.method} ${req.url}`, {
      origin: req.headers.origin,
      ip: req.ip
    });
  }
  
  // Add request ID for tracking
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
});

// ==========================================
// 🏠 HEALTH & STATUS ENDPOINTS
// ==========================================
app.get('/api/health', (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus];
    
    const healthData = {
      status: 'OK',
      message: `ZMO Backend Server is running in ${process.env.NODE_ENV} mode`,
      database: statusText,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cors: {
        enabled: true,
        allowedOrigins: allowedOrigins
      }
    };

    // Cache control for health endpoint
    res.setHeader('Cache-Control', 'no-cache');
    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Server health check failed',
      error: isProduction ? 'Internal error' : error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  res.json({
    success: true,
    service: 'ZMO Backend API',
    status: 'operational',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// ==========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ==========================================

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 10, // Limit auth attempts
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login attempts, please try again later.'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        requestId: req.requestId
      });
    }

    // Trim and sanitize
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Demo authentication
    if (cleanPassword === 'password') {
      // Simulate database processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = {
        success: true,
        token: `zmo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: { 
          id: 1, 
          name: 'Admin User', 
          email: cleanEmail, 
          role: 'admin',
          avatar: null,
          permissions: ['read', 'write', 'delete']
        },
        expiresIn: '24h',
        requestId: req.requestId
      };

      // Add demo message in development
      if (isDevelopment) {
        userData.demo_message = 'Use password "password" for demo access';
      }

      console.log('✅ Login successful for:', cleanEmail);
      return res.json(userData);
    } else {
      console.log('❌ Login failed for:', cleanEmail);
      return res.status(401).json({ 
        success: false, 
        message: isDevelopment 
          ? 'Invalid credentials. Use password: "password"' 
          : 'Invalid email or password',
        requestId: req.requestId
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service temporarily unavailable',
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
        requestId: req.requestId
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        requestId: req.requestId
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        requestId: req.requestId
      });
    }

    // Simulate user registration process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'user',
        createdAt: new Date().toISOString()
      },
      requestId: req.requestId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration service temporarily unavailable',
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided',
        requestId: req.requestId
      });
    }

    // Demo token verification
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (token.startsWith('zmo-token-') || token.startsWith('demo-token-')) {
      return res.json({
        success: true,
        user: { 
          id: 1, 
          name: 'Admin User', 
          email: 'admin@zmo.com', 
          role: 'admin',
          permissions: ['read', 'write', 'delete']
        },
        requestId: req.requestId
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        requestId: req.requestId
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification service unavailable',
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
    requestId: req.requestId
  });
});

// ==========================================
// 📊 ADMIN DASHBOARD ENDPOINTS
// ==========================================
app.get('/api/admin/dashboard/stats', async (req, res) => {
  try {
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const stats = {
      success: true,
      data: {
        totalBlogs: 12,
        totalProjects: 8,
        totalMessages: 25,
        totalUsers: 5,
        monthlyVisitors: 1245,
        revenue: 28450,
        performance: 87.5,
        recentActivities: [
          { 
            id: 1, 
            action: 'Blog published', 
            user: 'Admin', 
            time: '2 hours ago',
            type: 'blog',
            icon: '📝'
          },
          { 
            id: 2, 
            action: 'New message received', 
            user: 'John Doe', 
            time: '5 hours ago',
            type: 'message',
            icon: '📧'
          },
          { 
            id: 3, 
            action: 'Project updated', 
            user: 'Admin', 
            time: '1 day ago',
            type: 'project',
            icon: '🚀'
          }
        ],
        chartData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          visitors: [65, 59, 80, 81, 56, 55],
          revenue: [28, 48, 40, 19, 86, 27],
          projects: [5, 8, 12, 6, 15, 10]
        }
      },
      requestId: req.requestId,
      cached: false
    };

    // Cache control for dashboard data
    res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes cache
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

// ==========================================
// 📝 BLOG MANAGEMENT ENDPOINTS
// ==========================================
app.get('/api/admin/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const blogsData = {
      success: true,
      data: {
        blogs: [
          {
            id: 1,
            title: 'Getting Started with React',
            excerpt: 'Learn the basics of React development and build your first application.',
            content: 'Full content here...',
            status: 'published',
            author: 'Admin User',
            tags: ['react', 'javascript', 'frontend'],
            featured: true,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            publishedAt: '2024-01-15T10:30:00Z',
            views: 1245,
            likes: 89,
            readTime: 5
          },
          {
            id: 2,
            title: 'Node.js Best Practices',
            excerpt: 'Essential practices and patterns for Node.js development in production.',
            content: 'Full content here...',
            status: 'draft',
            author: 'Admin User',
            tags: ['nodejs', 'backend', 'javascript'],
            featured: false,
            createdAt: '2024-01-14T14:20:00Z',
            updatedAt: '2024-01-16T09:15:00Z',
            views: 0,
            likes: 0,
            readTime: 8
          }
        ],
        pagination: {
          total: 12,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 2,
          hasNext: true,
          hasPrev: false
        },
        filters: {
          search: search || '',
          status: 'all'
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
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

// ==========================================
// 🛠️ PROJECT MANAGEMENT ENDPOINTS
// ==========================================
app.get('/api/admin/projects', async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    res.json({
      success: true,
      data: {
        projects: [
          {
            id: 1,
            name: 'E-commerce Platform',
            description: 'Full-stack e-commerce solution with React and Node.js',
            status: 'completed',
            client: 'Tech Corp',
            progress: 100,
            budget: 15000,
            spent: 14200,
            deadline: '2024-02-01',
            startDate: '2024-01-01',
            team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            repoUrl: 'https://github.com/zmo/ecommerce-platform',
            liveUrl: 'https://ecommerce-techcorp.com'
          },
          {
            id: 2,
            name: 'Mobile App Development',
            description: 'Cross-platform mobile application for task management',
            status: 'in-progress',
            client: 'Startup Inc',
            progress: 75,
            budget: 20000,
            spent: 15600,
            deadline: '2024-03-15',
            startDate: '2024-01-10',
            team: ['Admin User', 'Mike Johnson', 'Sarah Wilson'],
            technologies: ['React Native', 'Firebase', 'Redux'],
            repoUrl: 'https://github.com/zmo/mobile-app',
            liveUrl: null
          }
        ],
        stats: {
          total: 8,
          completed: 3,
          inProgress: 4,
          planning: 1
        }
      },
      requestId: req.requestId
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

// ==========================================
// 📧 CONTACT MESSAGES ENDPOINTS
// ==========================================
app.get('/api/admin/contacts', async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    res.json({
      success: true,
      data: {
        messages: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            subject: 'Partnership Inquiry',
            message: 'I would like to discuss potential partnership opportunities for our upcoming project. We are impressed with your portfolio and believe we can create something great together.',
            status: 'new',
            priority: 'high',
            createdAt: '2024-01-20T09:15:00Z',
            read: false,
            source: 'website-form'
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+0987654321',
            subject: 'Support Request',
            message: 'I need help with my account setup. I\'ve been trying to access the dashboard but keep getting error messages. Can you please assist?',
            status: 'replied',
            priority: 'medium',
            createdAt: '2024-01-19T14:30:00Z',
            read: true,
            repliedAt: '2024-01-19T16:45:00Z',
            source: 'email'
          }
        ],
        pagination: {
          total: 25,
          page: parseInt(page),
          limit: 10,
          pages: 3
        },
        filters: {
          status: status || 'all'
        },
        stats: {
          total: 25,
          new: 5,
          replied: 15,
          archived: 5
        }
      },
      requestId: req.requestId
    });
  } catch (error) {
    console.error('Contacts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      requestId: req.requestId,
      ...(isDevelopment && { error: error.message })
    });
  }
});

// ==========================================
// 🌐 ROOT & API DOCUMENTATION
// ==========================================
app.get('/', (req, res) => {
  const apiInfo = {
    success: true,
    message: '🚀 Welcome to ZMO Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/health',
        description: 'Server health check'
      },
      auth: {
        login: { method: 'POST', path: '/api/auth/login' },
        register: { method: 'POST', path: '/api/auth/register' },
        verify: { method: 'GET', path: '/api/auth/verify' },
        logout: { method: 'POST', path: '/api/auth/logout' }
      },
      admin: {
        dashboard: { method: 'GET', path: '/api/admin/dashboard/stats' },
        blogs: { method: 'GET', path: '/api/admin/blogs' },
        projects: { method: 'GET', path: '/api/admin/projects' },
        contacts: { method: 'GET', path: '/api/admin/contacts' }
      }
    },
    documentation: 'https://docs.zmo.com/api',
    support: 'support@zmo.com',
    rate_limits: {
      general: '100 requests per 15 minutes',
      auth: '5 requests per 15 minutes'
    }
  };

  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json(apiInfo);
});

// ==========================================
// 🔧 ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `API route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    suggested: 'Check / for available endpoints'
  });
});

// Global wildcard handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Route ${req.originalUrl} does not exist on this server`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// Global error handler
app.use((error, req, res, next) => {
  const errorId = Date.now().toString(36);
  
  console.error('💥 Global Error Handler:', {
    errorId,
    message: error.message,
    stack: error.stack,
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
      errorId
    });
  }

  // MongoDB error
  if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      error: 'Database Error',
      message: 'Database service temporarily unavailable',
      requestId: req.requestId,
      errorId
    });
  }

  // Rate limit error (handled by express-rate-limit)
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later',
      requestId: req.requestId,
      errorId
    });
  }

  // Default error response
  const errorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong' : error.message,
    requestId: req.requestId,
    errorId,
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (isDevelopment) {
    errorResponse.stack = error.stack;
  }

  res.status(error.status || 500).json(errorResponse);
});

// ==========================================
// 🚀 SERVER STARTUP & GRACEFUL SHUTDOWN
// ==========================================
const startServer = async () => {
  try {
    console.log('🚀 Starting ZMO Backend Server...');
    console.log('📁 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔧 Node Version:', process.version);
    console.log('⏰ Startup Time:', new Date().toISOString());

    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully!');

    // Start Express server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🎯 Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log(`🔒 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      console.log(`🌐 CORS Enabled for: ${allowedOrigins.join(', ')}`);
      
      if (isProduction) {
        console.log('🛡️  Production mode enabled with enhanced security');
      }
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal) => {
      return () => {
        console.log(`\n🛑 Received ${signal}, closing server gracefully...`);
        
        server.close(() => {
          console.log('✅ HTTP server closed.');
          
          mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed.');
            console.log('👋 Server shutdown completed.');
            process.exit(0);
          });
        });

        // Force close after 10 seconds
        setTimeout(() => {
          console.log('❌ Forcing server shutdown...');
          process.exit(1);
        }, 10000);
      };
    };

    // Handle various shutdown signals
    process.on('SIGTERM', gracefulShutdown('SIGTERM'));
    process.on('SIGINT', gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', gracefulShutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

// Export app for Vercel
module.exports = app;