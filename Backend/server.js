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

// ✅ FIX: Add trust proxy for Render
app.set('trust proxy', 1);

console.log('🚀 Starting ZMO Backend Server on Render...');
console.log('🌍 Environment:', NODE_ENV);
console.log('🔧 Node Version:', process.version);
console.log('📊 Process ID:', process.pid);

// ==========================================
// 🌐 ENHANCED CORS CONFIGURATION FOR RENDER + VERCEL
// ==========================================
const productionOrigins = [
  // Vercel Main Deployments
  'https://zmo-admin.vercel.app',
  'https://zmo-frontend.vercel.app',
  'https://zmo-website.vercel.app',
  'https://zmo-dashboard.vercel.app',
  
  // Vercel Preview Deployments (specific patterns)
  'https://zmo-admin-git-main-*.vercel.app',
  'https://zmo-admin-git-develop-*.vercel.app',
  'https://zmo-admin-git-feature-*.vercel.app',
  'https://zmo-admin-git-preview-*.vercel.app',
  'https://zmo-frontend-git-*.vercel.app',
  'https://zmo-website-git-*.vercel.app',
  
  // Generic Vercel patterns (catch-all for any project)
  'https://*-git-main-*.vercel.app',
  'https://*-git-develop-*.vercel.app', 
  'https://*-git-feature-*.vercel.app',
  'https://*-git-preview-*.vercel.app',
  'https://*-*-*.vercel.app', // Broad pattern for any Vercel deployment
  
  // Render URLs
  RENDER_URL,
  'https://zmo-backend.onrender.com',
  
  // Local development (included in production for testing)
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:4174',
  
  // Common development servers
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:4174',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  ...productionOrigins // Include all production URLs in development
];

const allowedOrigins = isProduction ? productionOrigins : developmentOrigins;

console.log('🌐 CORS Configuration:', {
  environment: NODE_ENV,
  totalOrigins: allowedOrigins.length,
  vercelSupported: true,
  localhostSupported: true
});

// Enhanced CORS configuration with better Vercel support
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Development mode - allow all localhost and common dev origins
    if (isDevelopment) {
      // Allow all localhost and 127.0.0.1 in development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list with enhanced wildcard support
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Exact match
      if (allowedOrigin === origin) {
        return true;
      }
      
      // Wildcard pattern matching
      if (allowedOrigin.includes('*')) {
        try {
          // Convert wildcard pattern to regex
          const regexPattern = '^' + allowedOrigin
            .replace(/\./g, '\\.') // Escape dots
            .replace(/\*/g, '.*')  // Convert * to .*
            .replace(/\?/g, '.')   // Convert ? to .
            + '$';
          
          const regex = new RegExp(regexPattern);
          return regex.test(origin);
        } catch (error) {
          console.warn('Invalid CORS pattern:', allowedOrigin, error);
          return false;
        }
      }
      
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('🚫 CORS Blocked Origin:', {
        origin,
        environment: NODE_ENV,
        allowedCount: allowedOrigins.length
      });
      
      // Provide more helpful error message
      const errorMessage = `Origin "${origin}" not allowed by CORS policy. ` +
        `Environment: ${NODE_ENV}, ` +
        `Allowed origins: ${allowedOrigins.length} configured`;
      
      callback(new Error(errorMessage));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version',
    'x-environment',
    'X-Environment',
    'X-API-Key',
    'X-API-Version',
    'Cache-Control',
    'x-requested-with',
    'x-platform',
    'X-Platform',
    'x-app-version',
    'X-App-Version',
    'x-request-id',
    'X-Request-ID',
    'X-Request-Id',
    'X-Client',
    'X-Client-Version',
    'X-Client-Timestamp'
  ],
  exposedHeaders: [
    'X-Request-ID', 
    'X-API-Version', 
    'X-Token-Expiry',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400, // 24 hours for preflight cache
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Enhanced pre-flight requests handler
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Set CORS headers dynamically
  if (origin) {
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const regexPattern = '^' + allowedOrigin.replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexPattern);
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 
    'Content-Type, Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, x-environment, X-Environment, X-API-Key, X-API-Version, Cache-Control, x-requested-with, x-platform, X-Platform, x-app-version, X-App-Version, x-request-id, X-Request-ID, X-Request-Id, X-Client, X-Client-Version, X-Client-Timestamp'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 
    'X-Request-ID, X-API-Version, X-Token-Expiry, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  );
  
  res.status(204).end();
});

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
// 🔧 ENHANCED CUSTOM MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers dynamically with enhanced wildcard support
  if (origin) {
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const regexPattern = '^' + allowedOrigin.replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexPattern);
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 
    'Content-Type, Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, x-environment, X-Environment, X-API-Key, X-API-Version, Cache-Control, x-requested-with, x-platform, X-Platform, x-app-version, X-App-Version, x-request-id, X-Request-ID, X-Request-Id, X-Client, X-Client-Version, X-Client-Timestamp'
  );
  res.setHeader('Access-Control-Expose-Headers', 
    'X-Request-ID, X-API-Version, X-Token-Expiry, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  );
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Security headers for production
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  res.setHeader('X-API-Version', '2.0.0');
  res.setHeader('X-Deployment-Platform', 'Render');
  res.setHeader('X-CORS-Support', 'Vercel+Localhost+Render');
  
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
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not set - using demo mode without database');
}

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      console.log('🚫 MongoDB connection skipped - no MONGODB_URI provided');
      return;
    }

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
      status: 'OK',
      message: `ZMO Backend Server running on Render in ${NODE_ENV} mode`,
      database: {
        status: MONGODB_URI ? statusText : 'demo_mode',
        readyState: dbStatus,
        connected: MONGODB_URI ? dbStatus === 1 : false
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
      authentication: {
        mode: MONGODB_URI ? 'database' : 'demo',
        demo_users: ['admin@zmo.com', 'content@zmo.com']
      },
      cors: {
        enabled: true,
        allowedOrigins: allowedOrigins.length,
        production: isProduction,
        supports_vercel: true,
        supports_localhost: true,
        wildcard_patterns: allowedOrigins.filter(o => o.includes('*')).length,
        environment: NODE_ENV
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };

    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(200).json(healthData);
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
    supports: ['Vercel', 'Local Development', 'Mobile Apps'],
    cors: {
      enabled: true,
      origins: allowedOrigins.length,
      vercel: true,
      localhost: true
    },
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

// Demo users database
const demoUsers = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'admin@zmo.com',
    password: 'password',
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

// Hash demo passwords
demoUsers.forEach(user => {
  user.password = bcrypt.hashSync(user.password, 10);
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt from:', req.headers.origin);
    
    const { email, password } = req.body;
    
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

    const user = demoUsers.find(u => u.email === cleanEmail && u.isActive);
    
    if (!user) {
      console.log('❌ User not found:', cleanEmail);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password',
        requestId: req.requestId
      });
    }

    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', cleanEmail);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password',
        requestId: req.requestId
      });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

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
      requestId: req.requestId,
      mode: MONGODB_URI ? 'database' : 'demo'
    };

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
    const token = authHeader && authHeader.split(' ')[1];

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
// 📝 PUBLIC BLOG ENDPOINTS
// ==========================================

// Simple endpoint
app.get('/api/simple', (req, res) => {
  try {
    console.log('📝 Fetching simple blogs data from:', req.headers.origin);
    
    const blogsData = {
      success: true,
      data: [
        {
          id: 1,
          title: 'Getting Started with React on Render',
          excerpt: 'Learn how to deploy React applications on Render platform.',
          author: 'Admin User',
          publishedAt: '2024-01-15T10:30:00Z',
          readTime: 5,
          tags: ['react', 'deployment', 'tutorial']
        },
        {
          id: 2,
          title: 'Building Scalable Backends with Node.js',
          excerpt: 'Best practices for building scalable backend services.',
          author: 'Content Team',
          publishedAt: '2024-01-10T14:20:00Z',
          readTime: 8,
          tags: ['nodejs', 'backend', 'scalability']
        },
        {
          id: 3,
          title: 'MongoDB Optimization Tips',
          excerpt: 'How to optimize your MongoDB queries for better performance.',
          author: 'Admin User',
          publishedAt: '2024-01-05T09:15:00Z',
          readTime: 6,
          tags: ['mongodb', 'database', 'performance']
        }
      ],
      count: 3,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      message: 'Simple blogs endpoint working!'
    };

    res.json(blogsData);
  } catch (error) {
    console.error('Simple endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blogs',
      requestId: req.requestId
    });
  }
});

// Main blogs endpoint
app.get('/api/blogs', (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    console.log('📚 Fetching blogs data', { page, limit, search, tag, origin: req.headers.origin });
    
    const allBlogs = [
      {
        id: 1,
        title: 'Getting Started with React on Render',
        content: 'Full content about React deployment...',
        excerpt: 'Learn how to deploy React applications on Render platform.',
        status: 'published',
        author: 'Admin User',
        tags: ['react', 'render', 'deployment', 'webdev'],
        featured: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        publishedAt: '2024-01-15T10:30:00Z',
        views: 1245,
        likes: 89,
        readTime: 5,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500'
      },
      {
        id: 2,
        title: 'Building Scalable Backends with Node.js',
        content: 'Complete guide to scalable backend architecture...',
        excerpt: 'Best practices for building scalable backend services.',
        status: 'published',
        author: 'Content Team',
        tags: ['nodejs', 'backend', 'scalability', 'javascript'],
        featured: false,
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-12T16:45:00Z',
        publishedAt: '2024-01-10T14:20:00Z',
        views: 856,
        likes: 45,
        readTime: 8,
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500'
      },
      {
        id: 3,
        title: 'MongoDB Optimization Tips',
        content: 'Advanced MongoDB optimization techniques...',
        excerpt: 'How to optimize your MongoDB queries for better performance.',
        status: 'published',
        author: 'Admin User',
        tags: ['mongodb', 'database', 'performance', 'nosql'],
        featured: true,
        createdAt: '2024-01-05T09:15:00Z',
        updatedAt: '2024-01-08T11:30:00Z',
        publishedAt: '2024-01-05T09:15:00Z',
        views: 923,
        likes: 67,
        readTime: 6,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500'
      }
    ];

    let filteredBlogs = allBlogs.filter(blog => blog.status === 'published');

    if (search) {
      const searchLower = search.toLowerCase();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.excerpt.toLowerCase().includes(searchLower) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (tag) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
      );
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

    const blogsData = {
      success: true,
      data: paginatedBlogs,
      pagination: {
        total: filteredBlogs.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(filteredBlogs.length / limitNum),
        hasNext: endIndex < filteredBlogs.length,
        hasPrev: pageNum > 1
      },
      filters: {
        search: search || null,
        tag: tag || null
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };

    res.json(blogsData);
  } catch (error) {
    console.error('Blogs endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blogs',
      requestId: req.requestId
    });
  }
});

// Single blog post endpoint with NaN fix
app.get('/api/blogs/:id', (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    
    // Fix NaN issue
    if (isNaN(blogId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid blog ID',
        message: 'Blog ID must be a valid number',
        requestId: req.requestId
      });
    }
    
    console.log(`📖 Fetching blog post ${blogId} from:`, req.headers.origin);
    
    const blogs = {
      1: {
        id: 1,
        title: 'Getting Started with React on Render',
        content: `
          <h1>Getting Started with React on Render</h1>
          <p>This is a comprehensive guide to deploying React applications on the Render platform.</p>
        `,
        excerpt: 'Learn how to deploy React applications on Render platform.',
        status: 'published',
        author: 'Admin User',
        tags: ['react', 'render', 'deployment', 'webdev', 'frontend'],
        featured: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        publishedAt: '2024-01-15T10:30:00Z',
        views: 1245,
        likes: 89,
        readTime: 5,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'
      },
      2: {
        id: 2,
        title: 'Building Scalable Backends with Node.js',
        content: `
          <h1>Building Scalable Backends with Node.js</h1>
          <p>Node.js has become the go-to runtime for building scalable backend services.</p>
        `,
        excerpt: 'Best practices for building scalable backend services.',
        status: 'published',
        author: 'Content Team',
        tags: ['nodejs', 'backend', 'scalability', 'javascript', 'performance'],
        featured: false,
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-12T16:45:00Z',
        publishedAt: '2024-01-10T14:20:00Z',
        views: 856,
        likes: 45,
        readTime: 8,
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800'
      }
    };

    const blog = blogs[blogId];
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found',
        message: `Blog with ID ${blogId} does not exist`,
        requestId: req.requestId
      });
    }

    res.json({
      success: true,
      data: blog,
      requestId: req.requestId
    });
  } catch (error) {
    console.error('Blog detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog post',
      requestId: req.requestId
    });
  }
});

// Blog categories/tags endpoint
app.get('/api/blogs/tags', (req, res) => {
  try {
    console.log('🏷️ Fetching blog tags from:', req.headers.origin);
    
    const tagsData = {
      success: true,
      data: [
        { name: 'react', count: 3 },
        { name: 'nodejs', count: 2 },
        { name: 'mongodb', count: 2 },
        { name: 'deployment', count: 1 },
        { name: 'backend', count: 2 },
        { name: 'frontend', count: 2 },
        { name: 'security', count: 1 },
        { name: 'performance', count: 2 },
        { name: 'webdev', count: 3 },
        { name: 'javascript', count: 2 }
      ],
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };

    res.json(tagsData);
  } catch (error) {
    console.error('Tags endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags',
      requestId: req.requestId
    });
  }
});

// ==========================================
// 📊 PROTECTED ADMIN ENDPOINTS
// ==========================================

// Dashboard stats
app.get('/api/admin/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Dashboard request from:', req.user.email, 'Origin:', req.headers.origin);
    
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
      'Admin Dashboard',
      'Blog API Endpoints',
      'Vercel Support'
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
      blogs: {
        simple: 'GET /api/simple',
        list: 'GET /api/blogs',
        single: 'GET /api/blogs/:id',
        tags: 'GET /api/blogs/tags'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard/stats',
        blogs: 'GET /api/admin/blogs'
      }
    },
    cors: {
      enabled: true,
      supports_vercel: true,
      supports_localhost: true,
      environment: NODE_ENV,
      total_origins: allowedOrigins.length
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
      allowedOrigins: allowedOrigins.length,
      yourOrigin: req.headers.origin,
      environment: NODE_ENV,
      supports_vercel: true
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
    await connectDB();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🎉 ==========================================');
      console.log('🚀 ZMO Backend Server Started Successfully!');
      console.log('🎯 ==========================================');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🏢 Platform: Render`);
      console.log(`🔗 MongoDB: ${MONGODB_URI ? (mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected') : 'Demo Mode'}`);
      console.log(`🌐 CORS: Enabled for ${allowedOrigins.length} origins`);
      console.log(`✅ ENHANCED: Vercel deployment support`);
      console.log(`✅ ENHANCED: Wildcard CORS patterns`);
      console.log(`✅ ENHANCED: Localhost support in production`);
      console.log(`✅ FIX: NaN blog ID issue resolved`);
      console.log(`🛡️ Security: Rate limiting, Helmet, CORS`);
      console.log(`📊 Demo Login: admin@zmo.com / password`);
      console.log('==========================================\n');
      
      console.log('🔗 Important URLs:');
      console.log(`   Health Check: ${RENDER_URL}/api/health`);
      console.log(`   Simple Blogs: ${RENDER_URL}/api/simple`);
      console.log(`   All Blogs: ${RENDER_URL}/api/blogs`);
      console.log(`   API Documentation: ${RENDER_URL}/`);
      console.log(`   Render Dashboard: https://render.com/dashboard`);
      console.log('\n🌐 Supported Frontends:');
      console.log(`   ✅ Vercel deployments (*.vercel.app)`);
      console.log(`   ✅ Localhost:3000, :3001, :5173, :5174`);
      console.log(`   ✅ All main ZMO domains`);
      console.log(`   ✅ Preview deployments (git branches)`);
    });

    // Graceful shutdown
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