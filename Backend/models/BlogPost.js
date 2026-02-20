const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [100, 'Content should be at least 100 characters']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  author: {
    type: String,
    default: 'Admin',
    trim: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['technology', 'business', 'lifestyle', 'tutorial', 'news', 'other'],
    default: 'technology'
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number,
    default: 5
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metaTitle: {
    type: String,
    maxlength: [70, 'Meta title cannot exceed 70 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
blogPostSchema.pre('save', function(next) {
  if (this.title && (this.isModified('title') || !this.slug)) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  
  // Auto-generate excerpt if not provided
  if (this.content && !this.excerpt) {
    this.excerpt = this.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 150)
      .trim() + '...';
  }
  
  // Auto-generate meta if not provided
  if (!this.metaTitle) {
    this.metaTitle = this.title.substring(0, 70);
  }
  
  if (!this.metaDescription && this.excerpt) {
    this.metaDescription = this.excerpt.substring(0, 160);
  }
  
  // Set published date when published
  if (this.isModified('published') && this.published === true && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate reading time
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(words / 200); // 200 words per minute
  }
  
  next();
});

// Virtual for formatted date
blogPostSchema.virtual('formattedDate').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
});

// Index for better query performance
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ published: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, published: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ isFeatured: 1, published: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);