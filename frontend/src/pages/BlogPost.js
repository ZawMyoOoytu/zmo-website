// frontend/src/pages/BlogPost.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api'; // ✅ FIXED: Use publicAPI for frontend
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError('');
        console.log(`📖 Fetching blog with ID: ${id}`);
        
        // ✅ FIXED: Use publicAPI.getBlogById() for frontend access
        const response = await publicAPI.getBlogById(id);
        
        if (response.success && response.data) {
          console.log('✅ Blog loaded successfully:', response.data.title);
          setBlog(response.data);
        } else {
          throw new Error(response.message || 'Blog not found');
        }
      } catch (error) {
        console.error('❌ Error fetching blog:', error);
        setError(error.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    } else {
      setError('No blog ID provided');
      setLoading(false);
    }
  }, [id]);

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Handle back to blogs
  const handleBackToBlogs = () => {
    navigate('/blogs');
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Blog Post...</h2>
            <p>Please wait while we fetch the content</p>
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
            <h2>Blog Post Not Found</h2>
            <p className="error-message">{error}</p>
            
            <div className="error-details">
              <p><strong>Blog ID:</strong> {id}</p>
              <p><strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com'}</p>
              <p><strong>Endpoint:</strong> /api/blogs/{id}</p>
              <p><strong>Admin Panel:</strong> {window.location.origin}/admin</p>
            </div>
            
            <div className="error-actions">
              <button onClick={handleRetry} className="btn btn-primary">
                <i className="fas fa-redo"></i> Try Again
              </button>
              <button onClick={handleBackToBlogs} className="btn btn-outline">
                <i className="fas fa-arrow-left"></i> Back to Blogs
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
              <Link to="/blogs" className="btn btn-primary">
                Browse All Blogs
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
          <Link to="/blogs" className="breadcrumb-item">Blogs</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">{blog.title}</span>
        </nav>

        {/* Blog Header */}
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
                  <span className="blog-updated">
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
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-tags">
                    <i className="fas fa-tags"></i>
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="blog-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {(blog.featuredImage || blog.image) && (
            <div className="blog-featured-image">
              <img 
                src={blog.featuredImage || blog.image} 
                alt={blog.title}
                loading="lazy"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="blog-content">
            {blog.content ? (
              <div 
                className="content-html"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            ) : blog.excerpt ? (
              <div className="content-text">
                <p>{blog.excerpt}</p>
                <div className="content-unavailable">
                  <i className="fas fa-info-circle"></i>
                  <p>Full content is not available for this blog post.</p>
                </div>
              </div>
            ) : (
              <div className="content-unavailable">
                <i className="fas fa-exclamation-circle"></i>
                <p>No content available for this blog post.</p>
              </div>
            )}
          </div>

          {/* Blog Footer */}
          <footer className="blog-footer">
            <div className="blog-actions">
              <button onClick={() => window.history.back()} className="btn btn-outline">
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <Link to="/blogs" className="btn btn-outline">
                <i className="fas fa-list"></i> All Blogs
              </Link>
              <button 
                onClick={() => window.print()} 
                className="btn btn-outline"
              >
                <i className="fas fa-print"></i> Print
              </button>
            </div>
            
            {/* Share buttons */}
            <div className="share-section">
              <h4>Share this post:</h4>
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

        {/* Related Posts Section (Optional) */}
        <section className="related-posts">
          <h3>You might also like</h3>
          <div className="related-actions">
            <Link to="/blogs" className="btn btn-primary">
              <i className="fas fa-newspaper"></i> Explore More Blog Posts
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogPost;