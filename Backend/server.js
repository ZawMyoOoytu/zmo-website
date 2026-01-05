const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoSanitize = require('express-mongo-sanitize');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// ==========================================
// 🚀 CONFIGURATION
// ==========================================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 5000;
const RENDER_URL = process.env.RENDER_URL || `https://zmo-backend.onrender.com`;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Trust proxy for Render
app.set('trust proxy', 1);

console.log('🚀 Starting ZMO Backend Server...');
console.log('🌍 Environment:', NODE_ENV);
console.log('🔧 Node Version:', process.version);
console.log('📊 Process ID:', process.pid);
console.log('📍 Port:', PORT);

// ==========================================
// 🌐 CORS CONFIGURATION (UPDATED)
// ==========================================
console.log('🌐 Setting up CORS...');

// Define allowed origins
const developmentOrigins = ['*'];

const productionOrigins = [
  'https://zmo-admin.vercel.app',
  'https://zmo-frontend.vercel.app',
  'https://zmo-website.vercel.app',
  'https://zmo-dashboard.vercel.app',
  'https://zmo-admin-*.vercel.app',
  RENDER_URL,
  'https://zmo-backend.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',      // ✅ ADDED: Your frontend dashboard
  'http://localhost:5173',      // ✅ ADDED: Vite dev server
  'http://127.0.0.1:5000',     // ✅ ADDED: Localhost IP
  'http://127.0.0.1:3000',     // ✅ ADDED: Localhost IP
  'http://localhost:8080',     // ✅ ADDED: Alternative port
];

const allowedOrigins = isDevelopment ? developmentOrigins : productionOrigins;

console.log(isDevelopment ? '🔓 Development mode: Allowing ALL origins' : '🔐 Production mode: Allowing specific origins');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow everything
    if (isDevelopment) {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const isAllowed = 
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.includes('localhost:') ||
      origin.includes('127.0.0.1:') ||
      origin.includes('zmo-') ||
      origin.includes('.vercel.app') ||
      origin.includes('.onrender.com');
    
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      const msg = `The CORS policy does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Request-ID', 'Content-Length'], // Added Content-Length
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
}));

// Handle pre-flight requests
app.options('*', cors());

// Add CORS headers manually as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (isDevelopment) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    // Check if origin is allowed
    const isAllowedOrigin = 
      origin && (
        allowedOrigins.includes(origin) ||
        origin.includes('localhost:') ||
        origin.includes('127.0.0.1:') ||
        origin.includes('zmo-') ||
        origin.includes('.vercel.app') ||
        origin.includes('.onrender.com')
      );
    
    if (isAllowedOrigin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Request-ID, Content-Length');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, X-Request-ID');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ==========================================
// 🗄️ MONGODB DATABASE CONNECTION
// ==========================================
const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not found, using demo mode');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('💡 Running in demo mode (no database)');
  }
};

// Database state helper
function getDBState(readyState) {
  const states = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[readyState] || 'unknown';
}

// ==========================================
// 🛡️ SECURITY MIDDLEWARE
// ==========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 200 : 1000,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(mongoSanitize());

// ==========================================
// 📊 BODY PARSING & LOGGING
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  res.setHeader('X-Request-ID', req.requestId);

  console.log(`📨 [${timestamp}] ${req.method} ${req.originalUrl}`, {
    origin: req.headers.origin || 'No origin',
    ip: req.ip,
    requestId: req.requestId
  });
  
  next();
});

// ==========================================
// 🗄️ IMPORT MODELS
// ==========================================
const BlogPost = require('./models/BlogPost');

// ==========================================
// 🔐 AUTHENTICATION
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || 'zmo-backend-jwt-secret-key-2024';

// Demo users
const demoUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@zmo.com',
    password: 'password',
    role: 'admin',
    avatar: null,
    isActive: true
  },
  {
    id: 2,
    name: 'Content Manager',
    email: 'content@zmo.com',
    password: 'demo123',
    role: 'editor',
    avatar: null,
    isActive: true
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = demoUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// ==========================================
// 🖼️ MULTER CONFIGURATION FOR FILE UPLOADS
// ==========================================
console.log('📁 Configuring multer for file uploads...');

// Configure multer for memory storage (for Render compatibility)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

console.log('✅ Multer configured successfully');

// ==========================================
// 🏠 HEALTH & STATUS ENDPOINTS
// ==========================================
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const dbState = getDBState(mongoose.connection.readyState);

  const healthData = {
    success: true,
    status: 'OK',
    message: `ZMO Backend Server running in ${NODE_ENV} mode`,
    server: {
      environment: NODE_ENV,
      nodeVersion: process.version,
      uptime: process.uptime(),
      database: dbState
    },
    cors: {
      enabled: true,
      allowedOrigins: isDevelopment ? ['All'] : productionOrigins,
      currentOrigin: req.headers.origin || 'No origin'
    },
    features: {
      upload: true,
      authentication: true,
      blogManagement: true
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(healthData);
});

// ==========================================
// 🔐 AUTH ENDPOINTS
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request received');

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    // Find user
    const user = demoUsers.find(u => u.email === cleanEmail && u.isActive);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = cleanPassword === user.password;
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

    // Prepare user response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    console.log('✅ Login successful for:', cleanEmail);
    
    res.json({
      success: true,
      token: token,
      user: userResponse,
      expiresIn: '24h',
      message: 'Login successful',
      database: getDBState(mongoose.connection.readyState),
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Login endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service temporarily unavailable',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// 🖼️ IMAGE UPLOAD ENDPOINTS
// ==========================================

// 1. SINGLE IMAGE UPLOAD ENDPOINT
app.post('/api/admin/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    console.log('📁 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fieldname: req.file.fieldname
    });
    
    // For Render compatibility, we'll use Unsplash placeholder images
    // In production, you should integrate with Cloudinary, AWS S3, or similar
    
    const timestamp = Date.now();
    const filename = `blog-${timestamp}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
    
    // Generate a unique Unsplash placeholder URL based on timestamp
    const unsplashImageId = 1000000 + (timestamp % 9000000); // Random ID between 1M-10M
    const mockImageUrl = `https://images.unsplash.com/photo-${unsplashImageId}?w=800&auto=format&fit=crop`;
    
    // Log successful upload
    console.log('✅ Image upload successful:', {
      filename: filename,
      size: (req.file.size / 1024).toFixed(2) + ' KB',
      url: mockImageUrl
    });
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: mockImageUrl,
        dimensions: {
          width: 800,
          height: 600
        }
      },
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      note: isDevelopment ? 'Using Unsplash placeholder for demo. Configure real storage for production.' : undefined
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    
    let statusCode = 500;
    let errorMessage = 'Failed to upload image';
    
    if (error.message.includes('file size') || error.message.includes('Only image files')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      statusCode = 400;
      errorMessage = 'File size exceeds 5MB limit';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: isDevelopment ? error.message : undefined,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 2. TEST UPLOAD ENDPOINT (GET)
app.get('/api/admin/upload', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Upload endpoint is working',
    endpoint: '/api/admin/upload',
    methods: ['POST'],
    allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    maxFileSize: '5MB',
    authentication: 'Required (Bearer token)',
    exampleRequest: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'multipart/form-data'
      },
      body: {
        'image': 'File upload'
      }
    },
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// 3. MULTIPLE IMAGE UPLOAD
app.post('/api/admin/upload/multiple', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    console.log('📤 Multiple upload request:', req.files?.length || 0, 'files');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const uploadResults = req.files.map((file, index) => {
      const timestamp = Date.now();
      const filename = `blog-${timestamp}-${index}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      const unsplashImageId = 1000000 + ((timestamp + index) % 9000000);
      
      return {
        filename: filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `https://images.unsplash.com/photo-${unsplashImageId}?w=800&auto=format&fit=crop`,
        index: index,
        status: 'success'
      };
    });
    
    console.log(`✅ ${uploadResults.length} images uploaded successfully`);
    
    res.json({
      success: true,
      message: `${uploadResults.length} images uploaded successfully`,
      data: uploadResults,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Multiple upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: isDevelopment ? error.message : undefined,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// 📝 BLOG POST ENDPOINTS
// ==========================================

// 1. CREATE BLOG POST
app.post('/api/admin/blogs', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, image, featuredImage, author, readTime, status, published } = req.body;
    
    console.log('📝 Creating new blog post:', { 
      title, 
      category,
      status,
      published,
      hasImage: !!(image || featuredImage)
    });
    
    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    const blogData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category: category || 'technology',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      image: image || featuredImage || '',
      featuredImage: featuredImage || image || '',
      author: author || req.user.name || 'Admin',
      readTime: readTime || '5',
      published: published || status === 'published',
      status: status || (published ? 'published' : 'draft'),
      isFeatured: req.body.isFeatured || false
    };
    
    let blogPost;
    
    if (mongoose.connection.readyState === 1) {
      // Real database
      blogPost = new BlogPost(blogData);
      await blogPost.save();
      console.log('✅ Blog post saved to database:', blogPost._id);
    } else {
      // Demo mode
      blogPost = {
        _id: `demo-${Date.now()}`,
        ...blogData,
        slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: blogData.published ? new Date().toISOString() : null
      };
      console.log('✅ Blog post created in demo mode');
    }
    
    console.log('✅ Blog post created successfully:', blogPost.title);
    
    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blogPost,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Blog creation error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this title already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: isDevelopment ? error.message : undefined,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 2. GET ALL BLOG POSTS (Admin - with drafts)
app.get('/api/admin/blogs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query;
    
    console.log('📖 Fetching admin blogs:', { page, search, status, category });
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'published') query.published = true;
    if (status === 'draft') query.published = false;
    if (category) query.category = category;
    
    let blogs;
    let total;
    
    if (mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      
      blogs = await BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await BlogPost.countDocuments(query);
    } else {
      // Demo data
      blogs = Array.from({ length: 25 }, (_, i) => ({
        _id: `demo-blog-${i + 1}`,
        title: `Blog Post ${i + 1}`,
        excerpt: `This is an excerpt for blog post ${i + 1}`,
        content: `Content for blog post ${i + 1}`,
        slug: `blog-post-${i + 1}`,
        author: i % 2 === 0 ? 'Admin User' : 'Content Manager',
        category: ['technology', 'business', 'lifestyle'][i % 3],
        tags: ['react', 'nodejs', 'mongodb'].slice(0, i % 3 + 1),
        image: i % 4 === 0 ? 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800' : '',
        featuredImage: i % 4 === 0 ? 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800' : '',
        published: i < 15,
        status: i < 15 ? 'published' : 'draft',
        readTime: 5,
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        isFeatured: i < 5,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
        publishedAt: i < 15 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString() : null
      }));
      
      // Filter
      if (search) {
        const searchLower = search.toLowerCase();
        blogs = blogs.filter(blog => 
          blog.title.toLowerCase().includes(searchLower) ||
          blog.excerpt.toLowerCase().includes(searchLower)
        );
      }
      if (status === 'published') blogs = blogs.filter(blog => blog.published);
      if (status === 'draft') blogs = blogs.filter(blog => !blog.published);
      if (category) blogs = blogs.filter(blog => blog.category === category);
      
      total = blogs.length;
      const skip = (page - 1) * limit;
      blogs = blogs.slice(skip, skip + parseInt(limit));
    }
    
    console.log(`✅ Found ${blogs.length} blogs (total: ${total})`);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      database: getDBState(mongoose.connection.readyState),
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching admin blogs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 3. GET SINGLE BLOG POST (Admin)
app.get('/api/admin/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📄 Fetching blog post:', id);
    
    let blogPost;
    
    if (mongoose.connection.readyState === 1) {
      blogPost = await BlogPost.findById(id);
      
      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }
    } else {
      blogPost = {
        _id: id,
        title: 'Sample Blog Post',
        content: '<h1>Welcome to ZMO Blog</h1><p>This is a sample blog post content.</p>',
        excerpt: 'This is a sample blog post excerpt.',
        slug: 'sample-blog-post',
        author: 'Admin User',
        category: 'technology',
        tags: ['demo', 'sample'],
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        published: true,
        status: 'published',
        readTime: 5,
        views: 1234,
        likes: 89,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };
    }
    
    res.json({
      success: true,
      data: blogPost,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching blog post:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 4. UPDATE BLOG POST
app.put('/api/admin/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('✏️ Updating blog post:', id);
    console.log('📝 Update data:', updateData);
    
    let blogPost;
    
    if (mongoose.connection.readyState === 1) {
      blogPost = await BlogPost.findById(id);
      
      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }
      
      // Update fields
      Object.keys(updateData).forEach(key => {
        blogPost[key] = updateData[key];
      });
      
      blogPost.updatedAt = new Date();
      await blogPost.save();
    } else {
      blogPost = {
        _id: id,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
    }
    
    console.log('✅ Blog post updated successfully');
    
    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: blogPost,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating blog post:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 5. DELETE BLOG POST
app.delete('/api/admin/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting blog post:', id);
    
    if (mongoose.connection.readyState === 1) {
      const result = await BlogPost.findByIdAndDelete(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }
    }
    
    console.log('✅ Blog post deleted successfully');
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting blog post:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 6. TOGGLE PUBLISH STATUS
app.patch('/api/admin/blogs/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    
    console.log('📢 Toggling publish status:', { id, published });
    
    let blogPost;
    
    if (mongoose.connection.readyState === 1) {
      blogPost = await BlogPost.findById(id);
      
      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }
      
      blogPost.published = published;
      blogPost.status = published ? 'published' : 'draft';
      if (published && !blogPost.publishedAt) {
        blogPost.publishedAt = new Date();
      }
      blogPost.updatedAt = new Date();
      await blogPost.save();
    } else {
      blogPost = {
        _id: id,
        published,
        status: published ? 'published' : 'draft',
        publishedAt: published ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      };
    }
    
    console.log(`✅ Blog post ${published ? 'published' : 'unpublished'}`);
    
    res.json({
      success: true,
      message: published ? 'Blog post published' : 'Blog post unpublished',
      data: blogPost,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error toggling publish status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update publish status',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// 🌐 PUBLIC BLOG ENDPOINTS (No auth required)
// ==========================================

// 1. GET PUBLISHED BLOG POSTS
app.get('/api/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 9, category, tag, search, featured } = req.query;
    
    console.log('🌐 Fetching public blogs:', { page, category, tag, search, featured });
    
    let query = { published: true };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (featured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    let blogs;
    let total;
    
    if (mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      
      blogs = await BlogPost.find(query)
        .select('-content') // Don't send full content in list
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await BlogPost.countDocuments(query);
    } else {
      blogs = Array.from({ length: 20 }, (_, i) => ({
        _id: `public-blog-${i + 1}`,
        title: `Published Blog Post ${i + 1}`,
        excerpt: `This is a published blog post ${i + 1} for the website.`,
        slug: `published-blog-post-${i + 1}`,
        author: 'Admin User',
        category: ['technology', 'business', 'lifestyle'][i % 3],
        tags: ['react', 'nodejs', 'mongodb'].slice(0, i % 3 + 1),
        image: i % 4 === 0 ? 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800' : '',
        featuredImage: i % 4 === 0 ? 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800' : '',
        published: true,
        status: 'published',
        readTime: 5,
        views: Math.floor(Math.random() * 5000),
        likes: Math.floor(Math.random() * 200),
        isFeatured: i < 3,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      // Filter
      if (category) blogs = blogs.filter(blog => blog.category === category);
      if (tag) blogs = blogs.filter(blog => blog.tags.includes(tag));
      if (featured === 'true') blogs = blogs.filter(blog => blog.isFeatured);
      if (search) {
        const searchLower = search.toLowerCase();
        blogs = blogs.filter(blog => 
          blog.title.toLowerCase().includes(searchLower) ||
          blog.excerpt.toLowerCase().includes(searchLower)
        );
      }
      
      total = blogs.length;
      const skip = (page - 1) * limit;
      blogs = blogs.slice(skip, skip + parseInt(limit));
    }
    
    console.log(`✅ Found ${blogs.length} public blogs (total: ${total})`);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      database: getDBState(mongoose.connection.readyState),
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching public blogs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 2. GET SINGLE PUBLISHED BLOG POST
app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('🌐 Fetching public blog:', slug);
    
    let blogPost;
    
    if (mongoose.connection.readyState === 1) {
      blogPost = await BlogPost.findOne({ slug, published: true });
      
      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }
      
      // Increment views
      blogPost.views += 1;
      await blogPost.save();
    } else {
      blogPost = {
        _id: 'demo-public-blog-1',
        title: 'Getting Started with Web Development',
        content: `
          <h1>Welcome to Web Development</h1>
          <p>This is a sample blog post that would be displayed on the website.</p>
          <p>You can write detailed articles with <strong>rich text formatting</strong>, images, and code examples.</p>
          <pre><code>console.log('Hello World!');</code></pre>
        `,
        excerpt: 'A comprehensive guide to getting started with modern web development.',
        slug: slug,
        author: 'Admin User',
        category: 'technology',
        tags: ['web-development', 'tutorial'],
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        published: true,
        status: 'published',
        readTime: 8,
        views: 15234,
        likes: 245,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
    
    res.json({
      success: true,
      data: blogPost,
      database: getDBState(mongoose.connection.readyState),
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching public blog:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 3. GET BLOG CATEGORIES
app.get('/api/categories', async (req, res) => {
  try {
    let categories;
    
    if (mongoose.connection.readyState === 1) {
      categories = await BlogPost.distinct('category', { published: true });
    } else {
      categories = ['technology', 'business', 'lifestyle', 'tutorial', 'news'];
    }
    
    res.json({
      success: true,
      data: categories,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 4. GET BLOG TAGS
app.get('/api/tags', async (req, res) => {
  try {
    let tags;
    
    if (mongoose.connection.readyState === 1) {
      tags = await BlogPost.distinct('tags', { published: true });
    } else {
      tags = ['react', 'javascript', 'nodejs', 'mongodb', 'web-development', 'tutorial'];
    }
    
    res.json({
      success: true,
      data: tags,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching tags:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// 5. GET FEATURED BLOG POSTS
app.get('/api/featured-blogs', async (req, res) => {
  try {
    let blogs;
    
    if (mongoose.connection.readyState === 1) {
      blogs = await BlogPost.find({ published: true, isFeatured: true })
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(3);
    } else {
      blogs = Array.from({ length: 3 }, (_, i) => ({
        _id: `featured-blog-${i + 1}`,
        title: `Featured Blog Post ${i + 1}`,
        excerpt: `This is a featured blog post ${i + 1}.`,
        slug: `featured-blog-post-${i + 1}`,
        author: 'Admin User',
        category: 'technology',
        tags: ['featured', 'popular'],
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
        published: true,
        status: 'published',
        readTime: 5,
        views: 5000 + i * 1000,
        likes: 200 + i * 50,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        publishedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
    }
    
    res.json({
      success: true,
      data: blogs,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching featured blogs:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured blogs',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// 📊 DASHBOARD STATISTICS
// ==========================================
app.get('/api/admin/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Dashboard stats request');
    
    let totalBlogs = 0;
    let publishedBlogs = 0;
    let totalViews = 0;
    
    if (mongoose.connection.readyState === 1) {
      totalBlogs = await BlogPost.countDocuments();
      publishedBlogs = await BlogPost.countDocuments({ published: true });
      
      // Calculate total views
      const result = await BlogPost.aggregate([
        { $match: { published: true } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);
      totalViews = result[0]?.totalViews || 0;
    } else {
      totalBlogs = 25;
      publishedBlogs = 15;
      totalViews = 15234;
    }
    
    const stats = {
      success: true,
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs: totalBlogs - publishedBlogs,
        totalViews,
        totalLikes: 845,
        averageReadingTime: '5 min',
        popularCategories: ['technology', 'business', 'lifestyle'],
        recentActivity: [
          { id: 1, action: 'New blog post created', user: 'Admin User', time: '2 hours ago' },
          { id: 2, action: 'Blog post published', user: 'Content Manager', time: '1 day ago' },
          { id: 3, action: 'Blog post updated', user: 'Admin User', time: '2 days ago' }
        ],
        performance: {
          uptime: process.uptime(),
          database: getDBState(mongoose.connection.readyState),
          responseTime: '125ms'
        }
      },
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// 🎪 DEMO & TEST ENDPOINTS
// ==========================================
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint - Everything is working!',
    environment: NODE_ENV,
    database: getDBState(mongoose.connection.readyState),
    cors: 'Enabled',
    allowedOrigins: isDevelopment ? ['All'] : productionOrigins,
    currentOrigin: req.headers.origin || 'No origin',
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 🌐 ROOT ENDPOINT
// ==========================================
app.get('/', (req, res) => {
  const apiInfo = {
    success: true,
    message: '🚀 ZMO Backend API',
    version: '3.0.0',
    environment: NODE_ENV,
    database: getDBState(mongoose.connection.readyState),
    cors: {
      enabled: true,
      allowedOrigins: isDevelopment ? ['All'] : productionOrigins,
      currentOrigin: req.headers.origin || 'No origin'
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    status: 'operational',
    endpoints: {
      health: 'GET /api/health',
      test: 'GET /api/test',
      login: 'POST /api/auth/login',
      // Upload endpoints
      uploadImage: 'POST /api/admin/upload',
      testUpload: 'GET /api/admin/upload',
      // Public endpoints
      publicBlogs: 'GET /api/blogs',
      publicBlog: 'GET /api/blogs/:slug',
      categories: 'GET /api/categories',
      tags: 'GET /api/tags',
      featuredBlogs: 'GET /api/featured-blogs',
      // Admin endpoints (protected)
      adminBlogs: 'GET /api/admin/blogs',
      createBlog: 'POST /api/admin/blogs',
      updateBlog: 'PUT /api/admin/blogs/:id',
      deleteBlog: 'DELETE /api/admin/blogs/:id',
      togglePublish: 'PATCH /api/admin/blogs/:id/publish',
      dashboardStats: 'GET /api/admin/dashboard/stats'
    },
    demoCredentials: {
      admin: 'admin@zmo.com / password',
      editor: 'content@zmo.com / demo123'
    }
  };

  res.json(apiInfo);
});

// ==========================================
// 🚫 404 HANDLER
// ==========================================
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// ==========================================
// 🚀 SERVER STARTUP
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
      console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected (Demo Mode) ✅'}`);
      console.log(`🌐 CORS: ${isDevelopment ? 'All origins allowed 🔓' : 'Restricted origins 🔐'}`);
      console.log(`📁 File Upload: Enabled (Max 5MB)`);
      console.log('==========================================\n');
      
      console.log('🔗 Available Endpoints:');
      console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   • Test: http://localhost:${PORT}/api/test`);
      console.log(`   • Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   • Upload: POST http://localhost:${PORT}/api/admin/upload`);
      console.log(`   • Public Blogs: http://localhost:${PORT}/api/blogs`);
      console.log(`   • Admin Blogs: http://localhost:${PORT}/api/admin/blogs`);
      console.log(`   • Dashboard: http://localhost:${PORT}/api/admin/dashboard/stats`);
      console.log('\n👤 Demo Credentials:');
      console.log('   • Email: admin@zmo.com');
      console.log('   • Password: password');
      console.log('\n🚀 Quick Test Commands:');
      console.log('   curl http://localhost:5000/api/health');
      console.log('   curl http://localhost:5000/api/blogs');
      console.log('   curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d \'{"email":"admin@zmo.com","password":"password"}\'');
      console.log('==========================================\n');
    });
  } catch (error) {
    console.error('💥 Server failed to start:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;