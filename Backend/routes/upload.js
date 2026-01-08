const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Make sure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
    cb(null, 'blog-' + uniqueSuffix + '-' + safeName);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max file size (more realistic for web)
  },
  fileFilter: fileFilter
});

// Upload endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }
    
    console.log('✅ File uploaded successfully:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      path: req.file.path
    });
    
    // Construct the URL - ALWAYS USE HTTPS FOR RENDER
    const imageUrl = `https://zmo-backend.onrender.com/uploads/${req.file.filename}`;
    
    // Verify file exists
    if (!fs.existsSync(req.file.path)) {
      throw new Error('Uploaded file not found on server');
    }
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      sizeFormatted: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      accessibleUrl: imageUrl // Explicit field for frontend
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Test endpoint - FIXED: Make it accessible without auth for testing
router.get('/upload/test', (req, res) => {
  try {
    // Check if uploads directory is accessible
    const uploadsExist = fs.existsSync(uploadDir);
    const uploadsFiles = uploadsExist ? fs.readdirSync(uploadDir) : [];
    
    res.json({
      success: true,
      message: 'Upload endpoint is working',
      endpoint: '/api/admin/upload',
      publicEndpoint: '/api/upload',
      method: 'POST',
      accepts: 'multipart/form-data',
      fieldName: 'image',
      maxSize: '5MB',
      allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
      uploadsDirectory: {
        exists: uploadsExist,
        path: uploadDir,
        fileCount: uploadsFiles.length,
        sampleFiles: uploadsFiles.slice(0, 5)
      },
      note: 'Use POST /api/admin/upload with Authorization header for actual uploads'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
});

// Public endpoint to check if a specific image exists
router.get('/uploads/check/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
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
        url: `https://zmo-backend.onrender.com/uploads/${filename}`
      });
    } else {
      res.status(404).json({
        exists: false,
        filename: filename,
        message: 'File not found in uploads directory',
        availableFiles: fs.readdirSync(uploadDir).slice(0, 20)
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;