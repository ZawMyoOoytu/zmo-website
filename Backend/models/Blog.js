const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [50, 'Content must be at least 50 characters long']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [200, 'Excerpt cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    default: 'Admin'
  },
  readTime: {
    type: Number,
    required: true,
    min: [1, 'Read time must be at least 1 minute'],
    max: [60, 'Read time cannot exceed 60 minutes'],
    default: 5
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    default: 'draft',
    enum: ['draft', 'published']
  },
  featured: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  published: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  views: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Sync published field with status for backward compatibility
blogSchema.pre('save', function(next) {
  this.published = this.status === 'published';
  next();
});

// Static method to get blog stats
blogSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const published = await this.countDocuments({ status: 'published' });
  const drafts = await this.countDocuments({ status: 'draft' });
  const featured = await this.countDocuments({ featured: true });
  
  return {
    total,
    published,
    drafts,
    featured,
    publishedPercentage: total > 0 ? Math.round((published / total) * 100) : 0,
    draftPercentage: total > 0 ? Math.round((drafts / total) * 100) : 0
  };
};

// Create text index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);