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
const fs = require('fs');
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
// 🌐 CORS CONFIGURATION
// ==========================================
console.log('🌐 Setting up CORS...');

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
  'http://localhost:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
];

const allowedOrigins = isDevelopment ? developmentOrigins : productionOrigins;

console.log(isDevelopment ? '🔓 Development mode: Allowing ALL origins' : '🔐 Production mode: Allowing specific origins');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    
    if (isDevelopment) {
      return callback(null, true);
    }
    
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
      const msg = `The CORS policy does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Request-ID', 'Content-Length'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Request-ID'],
  maxAge: 86400,
}));

app.options('*', cors());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (isDevelopment) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
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
// 📁 CREATE UPLOADS DIRECTORY & STATIC FILES
// ==========================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));
console.log('📁 Serving static files from:', uploadsDir);
console.log('🔗 Uploads accessible at:', `${RENDER_URL}/uploads/`);

// ==========================================
// 📊 BODY PARSING & LOGGING
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
// 🖼️ MULTER CONFIGURATION
// ==========================================
console.log('📁 Configuring multer for file uploads...');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
    cb(null, 'blog-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
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

console.log('✅ Multer configured for disk storage');

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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
    uploads: {
      directory: uploadsDir,
      exists: fs.existsSync(uploadsDir),
      fileCount: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0,
      url: `${RENDER_URL}/uploads/`
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

app.get('/api/status', async (req, res) => {
  res.json({
    success: true,
    status: 'online',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
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
    
    const user = demoUsers.find(u => u.email === cleanEmail && u.isActive);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = cleanPassword === user.password;
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password'
      });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);

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

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar
    },
    message: 'Token is valid',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 🖼️ IMAGE UPLOAD ENDPOINTS
// ==========================================

// 1. SINGLE IMAGE UPLOAD
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
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      path: req.file.path
    });
    
    // Verify file was saved to disk
    if (!fs.existsSync(req.file.path)) {
      throw new Error('Uploaded file was not saved to disk');
    }
    
    // Construct the public URL
    const imageUrl = `${RENDER_URL}/uploads/${req.file.filename}`;
    
    console.log('✅ Image saved to:', req.file.path);
    console.log('✅ Image accessible at:', imageUrl);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        sizeFormatted: formatBytes(req.file.size),
        mimetype: req.file.mimetype,
        url: imageUrl,
        accessibleUrl: imageUrl,
        path: req.file.path
      },
      requestId: req.requestId,
      timestamp: new Date().toISOString()
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

// 2. TEST UPLOAD ENDPOINT
app.get('/api/admin/upload', authenticateToken, (req, res) => {
  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  
  res.json({
    success: true,
    message: 'Upload endpoint is working',
    endpoint: '/api/admin/upload',
    methods: ['POST'],
    allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    maxFileSize: '5MB',
    uploadsDirectory: {
      path: uploadsDir,
      exists: fs.existsSync(uploadsDir),
      fileCount: files.length,
      files: files.slice(0, 10)
    },
    publicUrl: `${RENDER_URL}/uploads/`,
    exampleRequest: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
      },
      body: {
        'image': 'File upload (multipart/form-data)'
      }
    },
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 📝 BLOG POST ENDPOINTS
// ==========================================

// 1. GET ALL BLOG POSTS (Public)
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
        .select('-content')
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
        image: `https://images.unsplash.com/photo-${1499750310107 + i}?w=800`,
        featuredImage: `https://images.unsplash.com/photo-${1499750310107 + i}?w=800`,
        published: true,
        status: 'published',
        readTime: 5,
        views: Math.floor(Math.random() * 5000),
        likes: Math.floor(Math.random() * 200),
        isFeatured: i < 3,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }));
      
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

// 2. GET SINGLE BLOG POST (Public)
app.get('/api/blogs/:id', async (req, res) => {
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
      
      // Increment views
      blogPost.views += 1;
      await blogPost.save();
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

// 3. CREATE BLOG POST (Admin)
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
      blogPost = new BlogPost(blogData);
      await blogPost.save();
      console.log('✅ Blog post saved to database:', blogPost._id);
    } else {
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

// 4. UPDATE BLOG POST (Admin)
app.put('/api/admin/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('✏️ Updating blog post:', id);
    
    let blogPost;
    
    if (mongoose.connection.readyState === 1) {
      blogPost = await BlogPost.findById(id);
      
      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }
      
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

// 5. DELETE BLOG POST (Admin)
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

// 6. GET ALL BLOG POSTS (Admin with filters)
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
      blogs = Array.from({ length: 25 }, (_, i) => ({
        _id: `demo-blog-${i + 1}`,
        title: `Blog Post ${i + 1}`,
        excerpt: `This is an excerpt for blog post ${i + 1}`,
        content: `Content for blog post ${i + 1}`,
        slug: `blog-post-${i + 1}`,
        author: i % 2 === 0 ? 'Admin User' : 'Content Manager',
        category: ['technology', 'business', 'lifestyle'][i % 3],
        tags: ['react', 'nodejs', 'mongodb'].slice(0, i % 3 + 1),
        image: `https://images.unsplash.com/photo-${1499750310107 + i}?w=800`,
        featuredImage: `https://images.unsplash.com/photo-${1499750310107 + i}?w=800`,
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
        uploads: {
          directory: uploadsDir,
          fileCount: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0
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
// 🛠️ DEBUG & UTILITY ENDPOINTS
// ==========================================

// List all uploaded files
app.get('/api/debug/uploads', (req, res) => {
  try {
    const exists = fs.existsSync(uploadsDir);
    const files = exists ? fs.readdirSync(uploadsDir) : [];
    
    const fileDetails = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      
      return {
        filename,
        url: `${RENDER_URL}/uploads/${filename}`,
        exists: fs.existsSync(filePath),
        size: stats ? formatBytes(stats.size) : 'N/A',
        created: stats ? stats.birthtime : 'N/A',
        modified: stats ? stats.mtime : 'N/A'
      };
    });
    
    res.json({
      success: true,
      uploadsDirectory: uploadsDir,
      exists: exists,
      fileCount: files.length,
      files: fileDetails,
      note: 'Files may be ephemeral on Render.com. Consider using cloud storage for production.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to list uploads',
      timestamp: new Date().toISOString()
    });
  }
});

// Check a specific uploaded file
app.get('/api/debug/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      res.json({
        exists: true,
        filename: filename,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        created: stats.birthtime,
        modified: stats.mtime,
        url: `${RENDER_URL}/uploads/${filename}`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        exists: false,
        filename: filename,
        message: 'File not found in uploads directory',
        uploadsDirectory: uploadsDir,
        availableFiles: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).slice(0, 20) : [],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// List all API routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    success: true,
    routes: routes,
    count: routes.length,
    timestamp: new Date().toISOString()
  });
});

// Check database status
app.get('/api/debug/db', (req, res) => {
  res.json({
    success: true,
    database: getDBState(mongoose.connection.readyState),
    connected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || 'N/A',
    name: mongoose.connection.name || 'N/A',
    collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : [],
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
app.get('/api/simple', (req, res) => {
  res.json({
    success: true,
    message: 'Simple test endpoint',
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
    version: '3.2.0',
    environment: NODE_ENV,
    database: getDBState(mongoose.connection.readyState),
    uploads: {
      directory: uploadsDir,
      exists: fs.existsSync(uploadsDir),
      url: `${RENDER_URL}/uploads/`,
      fileCount: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0
    },
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
      status: 'GET /api/status',
      simple: 'GET /api/simple',
      login: 'POST /api/auth/login',
      verify: 'GET /api/auth/verify',
      uploadImage: 'POST /api/admin/upload',
      uploadTest: 'GET /api/admin/upload',
      publicBlogs: 'GET /api/blogs',
      publicBlog: 'GET /api/blogs/:id',
      createBlog: 'POST /api/admin/blogs',
      updateBlog: 'PUT /api/admin/blogs/:id',
      deleteBlog: 'DELETE /api/admin/blogs/:id',
      adminBlogs: 'GET /api/admin/blogs',
      dashboardStats: 'GET /api/admin/dashboard/stats',
      debugRoutes: 'GET /api/debug/routes',
      debugDB: 'GET /api/debug/db',
      debugUploads: 'GET /api/debug/uploads',
      debugFileCheck: 'GET /api/debug/uploads/:filename'
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
  
  // Collect available routes for debugging
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push(handler.route.path);
        }
      });
    }
  });
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `API route ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    availableRoutes: routes,
    database: getDBState(mongoose.connection.readyState)
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
      console.log(`📁 Uploads Directory: ${uploadsDir}`);
      console.log(`🌐 Uploads URL: ${RENDER_URL}/uploads/`);
      console.log(`🌐 CORS: ${isDevelopment ? 'All origins allowed 🔓' : 'Restricted origins 🔐'}`);
      console.log(`📁 File Upload: Enabled (Max 5MB, Disk Storage)`);
      console.log('==========================================\n');
      
      console.log('🔗 Key Endpoints:');
      console.log(`   • Health: ${RENDER_URL}/api/health`);
      console.log(`   • Upload Test: ${RENDER_URL}/api/admin/upload`);
      console.log(`   • Debug Uploads: ${RENDER_URL}/api/debug/uploads`);
      console.log(`   • Public Blogs: ${RENDER_URL}/api/blogs`);
      console.log(`   • Debug Routes: ${RENDER_URL}/api/debug/routes`);
      console.log('\n👤 Demo Credentials:');
      console.log('   • Email: admin@zmo.com');
      console.log('   • Password: password');
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