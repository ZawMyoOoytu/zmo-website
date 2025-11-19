// frontend/src/components/BlogCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  // Safe data extraction with fallbacks
  const {
    _id = '',
    title = 'Untitled Blog Post',
    excerpt = '',
    content = '',
    image = '',
    tags = [],
    createdAt = new Date().toISOString(),
    author = 'Unknown Author',
    readTime = 5
  } = blog || {};

  // Generate excerpt from content if no excerpt provided
  const getExcerpt = () => {
    if (excerpt && excerpt.trim() !== '') {
      return excerpt;
    }
    
    if (content && content.trim() !== '') {
      // Remove markdown-like syntax and truncate
      const plainContent = content
        .replace(/[#*\[\]_`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      return plainContent.length > 150 
        ? plainContent.substring(0, 150) + '...'
        : plainContent;
    }
    
    return 'No content available for this blog post.';
  };

  // Format date safely
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    console.warn('Blog image failed to load:', image);
    e.target.style.display = 'none';
  };

  // Generate placeholder image based on title
  const getPlaceholderImage = () => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100'];
    const color = colors[title.length % colors.length];
    
    return (
      <div className={`w-full h-48 ${color} flex items-center justify-center`}>
        <span className="text-gray-500 text-lg font-semibold">
          {title.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="blog-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      {/* Image Section with Fallback */}
      <div className="image-container">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          getPlaceholderImage()
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-xl font-semibold mb-3 text-gray-900 line-clamp-2 leading-tight">
          {title}
        </h2>
        
        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {getExcerpt()}
        </p>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium capitalize"
              >
                {typeof tag === 'string' ? tag.toLowerCase() : tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-500">
          <div className="meta-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-700">{author}</span>
              <span className="text-gray-300">•</span>
              <span>{formatDate(createdAt)}</span>
              {readTime && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{readTime} min read</span>
                </>
              )}
            </div>
          </div>
          
          {/* Read More Link */}
          <div className="meta-right">
            <Link 
              to={`/blog/${_id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              onClick={(e) => {
                if (!_id) {
                  e.preventDefault();
                  console.error('Blog ID is missing');
                }
              }}
            >
              Read More
              <svg 
                className="w-4 h-4 ml-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default props for safety
BlogCard.defaultProps = {
  blog: {
    _id: '',
    title: 'Untitled Blog Post',
    excerpt: '',
    content: '',
    image: '',
    tags: [],
    createdAt: new Date().toISOString(),
    author: 'Unknown Author',
    readTime: 5
  }
};

export default BlogCard;