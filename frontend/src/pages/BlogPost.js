// frontend/src/pages/BlogPost.js - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError('');
        console.log(`📖 Fetching blog with ID: ${id}`);
        
        if (!id || id === 'undefined') {
          throw new Error('Invalid blog ID');
        }

        // ✅ Use publicAPI.getBlogById() for frontend access
        const response = await publicAPI.getBlogById(id);
        
        if (response.success && response.data) {
          console.log('✅ Blog loaded successfully:', response.data.title);
          setBlog(response.data);
          
          // Fetch related blogs based on tags
          await fetchRelatedBlogs(response.data.tags, id);
        } else {
          throw new Error(response.message || 'Blog not found');
        }
      } catch (error) {
        console.error('❌ Error fetching blog:', error);
        
        // Enhanced error messages
        let errorMessage = error.message;
        if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to the server. Please check your internet connection.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Blog post not found. It may have been removed or the URL is incorrect.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedBlogs = async (tags = [], currentBlogId) => {
      try {
        if (!tags.length) return;
        
        const response = await publicAPI.getBlogs();
        if (response.success && response.data) {
          // Filter out current blog and find blogs with matching tags
          const related = response.data
            .filter(blog => blog._id !== currentBlogId)
            .filter(blog => 
              blog.tags && blog.tags.some(tag => tags.includes(tag))
            )
            .slice(0, 3); // Limit to 3 related blogs
          
          setRelatedBlogs(related);
        }
      } catch (error) {
        console.warn('Could not load related blogs:', error.message);
      }
    };

    if (id) {
      fetchBlog();
    } else {
      setError('No blog ID provided');
      setLoading(false);
    }
  }, [id]);

  // Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Format time for updated date
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Handle back to blogs
  const handleBackToBlogs = () => {
    navigate('/blog'); // Changed from '/blogs' to match your routing
  };

  // Safe content rendering
  const renderContent = () => {
    if (!blog) return null;

    if (blog.content) {
      return (
        <div 
          className="content-html"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      );
    } else if (blog.excerpt) {
      return (
        <div className="content-text">
          <p className="excerpt">{blog.excerpt}</p>
          <div className="content-unavailable">
            <i className="fas fa-info-circle"></i>
            <p>Full content is not available for this blog post.</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="content-unavailable">
          <i className="fas fa-exclamation-circle"></i>
          <p>No content available for this blog post.</p>
        </div>
      );
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    console.warn('Featured image failed to load');
    e.target.style.display = 'none';
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Blog Post...</h2>
            <p>Please wait while we fetch the content</p>
            <div className="loading-details">
              <small>Blog ID: {id}</small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Unable to Load Blog Post</h2>
            <p className="error-message">{error}</p>
            
            <div className="error-details">
              <p><strong>Blog ID:</strong> {id || 'Not provided'}</p>
              <p><strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com'}</p>
              <p><strong>Endpoint:</strong> /api/blogs/{id}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            </div>
            
            <div className="error-actions">
              <button onClick={handleRetry} className="btn btn-primary">
                <i className="fas fa-redo"></i> Try Again
              </button>
              <button onClick={handleBackToBlogs} className="btn btn-outline">
                <i className="fas fa-arrow-left"></i> Back to Blog
              </button>
              <Link to="/" className="btn btn-outline">
                <i className="fas fa-home"></i> Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="not-found-state">
            <h2>Blog Post Not Available</h2>
            <p>The requested blog post could not be found or is no longer available.</p>
            <div className="not-found-actions">
              <button onClick={handleBackToBlogs} className="btn btn-primary">
                <i className="fas fa-arrow-left"></i> Back to Blog
              </button>
              <Link to="/" className="btn btn-outline">
                <i className="fas fa-home"></i> Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-item">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/blog" className="breadcrumb-item">Blog</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active" title={blog.title}>
            {blog.title.length > 30 ? blog.title.substring(0, 30) + '...' : blog.title}
          </span>
        </nav>

        {/* Blog Article */}
        <article className="blog-article">
          <header className="blog-header">
            <h1 className="blog-title">{blog.title}</h1>
            
            <div className="blog-meta">
              <div className="meta-left">
                <span className="blog-author">
                  <i className="fas fa-user"></i>
                  By {blog.author || 'Admin'}
                </span>
                <span className="blog-date">
                  <i className="fas fa-calendar"></i>
                  Published on {formatDate(blog.createdAt)}
                </span>
                {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                  <span className="blog-updated" title={`Updated at ${formatTime(blog.updatedAt)}`}>
                    <i className="fas fa-edit"></i>
                    Updated on {formatDate(blog.updatedAt)}
                  </span>
                )}
              </div>
              
              <div className="meta-right">
                {blog.readTime && (
                  <span className="blog-read-time">
                    <i className="fas fa-clock"></i>
                    {blog.readTime} min read
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="blog-tags-main">
                <i className="fas fa-tags"></i>
                {blog.tags.map((tag, index) => (
                  <span key={index} className="blog-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {(blog.featuredImage || blog.image) && (
            <div className="blog-featured-image">
              <img 
                src={blog.featuredImage || blog.image} 
                alt={blog.title}
                onError={handleImageError}
                loading="lazy"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="blog-content">
            {renderContent()}
          </div>

          {/* Blog Footer */}
          <footer className="blog-footer">
            <div className="blog-actions">
              <button onClick={() => window.history.back()} className="btn btn-outline">
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <button onClick={handleBackToBlogs} className="btn btn-outline">
                <i className="fas fa-list"></i> All Posts
              </button>
              <button 
                onClick={() => window.print()} 
                className="btn btn-outline"
              >
                <i className="fas fa-print"></i> Print
              </button>
            </div>
            
            {/* Share buttons */}
            <div className="share-section">
              <h4>Share this post</h4>
              <div className="share-buttons">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn twitter"
                >
                  <i className="fab fa-twitter"></i> Twitter
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn linkedin"
                >
                  <i className="fab fa-linkedin"></i> LinkedIn
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(blog.title)}&body=Check out this blog post: ${encodeURIComponent(window.location.href)}`}
                  className="share-btn email"
                >
                  <i className="fas fa-envelope"></i> Email
                </a>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Posts Section */}
        {(relatedBlogs.length > 0) && (
          <section className="related-posts">
            <h3>Related Posts</h3>
            <div className="related-grid">
              {relatedBlogs.map(relatedBlog => (
                <div key={relatedBlog._id} className="related-post-card">
                  <h4>
                    <Link to={`/blog/${relatedBlog._id}`}>
                      {relatedBlog.title}
                    </Link>
                  </h4>
                  <p>{relatedBlog.excerpt}</p>
                  <div className="related-meta">
                    <span>{formatDate(relatedBlog.createdAt)}</span>
                    <span>{relatedBlog.readTime} min read</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="blog-cta">
          <h3>Enjoyed this article?</h3>
          <p>Check out more posts from our blog</p>
          <button onClick={handleBackToBlogs} className="btn btn-primary">
            <i className="fas fa-newspaper"></i> View All Blog Posts
          </button>
        </section>
      </div>
    </div>
  );
};

export default BlogPost;