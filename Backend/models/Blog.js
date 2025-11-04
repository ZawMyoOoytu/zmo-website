// models/Blog.js - UPDATED TO MATCH ROUTE REQUIREMENTS
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [10, 'Content must be at least 10 characters long']
  },
  excerpt: {
    type: String,
    default: '',
    maxlength: [200, 'Excerpt cannot exceed 200 characters']
  },
  published: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  imageUrl: { // ADD THIS FIELD - used in your routes
    type: String,
    default: ''
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: { // ADD THIS FIELD - used in your routes
    type: String,
    default: 'Admin'
  },
  status: { // ADD THIS FIELD - used in your routes
    type: String,
    default: 'published',
    enum: ['draft', 'published', 'archived']
  }
}, {
  timestamps: true
});

// Create text index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);