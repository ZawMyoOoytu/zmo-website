// frontend/src/components/BlogDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './BlogDetail.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        console.log(`📖 Fetching blog with ID: ${id}`);
        
        const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog post not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📄 Blog detail response:', data);
        
        if (data.success && data.data) {
          setBlog(data.data);
        } else {
          throw new Error('Invalid blog data format');
        }
      } catch (err) {
        console.error('❌ Error fetching blog detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Blog Post...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-page">
        <div className="container">
          <div className="error-state">
            <h2>Error Loading Blog</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <div className="container">
          <div className="not-found">
            <h2>Blog Post Not Found</h2>
            <p>The requested blog post could not be found.</p>
            <Link to="/blogs" className="btn btn-primary">
              View All Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="blog-detail-page">
      <div className="container">
        {/* Back Button */}
        <div className="back-nav">
          <button onClick={() => navigate(-1)} className="back-btn">
            <i className="fas fa-arrow-left"></i> Back to Blogs
          </button>
        </div>

        {/* Blog Header */}
        <header className="blog-header">
          <div className="blog-meta">
            <span className="blog-date">
              <i className="fas fa-calendar"></i>
              {formatDate(blog.createdAt || blog.publishedAt)}
            </span>
            <span className="blog-author">
              <i className="fas fa-user"></i>
              {blog.author || 'Admin'}
            </span>
            {blog.readTime && (
              <span className="blog-read-time">
                <i className="fas fa-clock"></i>
                {blog.readTime} min read
              </span>
            )}
          </div>
          
          <h1 className="blog-title">{blog.title}</h1>
          
          {blog.excerpt && (
            <p className="blog-excerpt">{blog.excerpt}</p>
          )}
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags">
              {blog.tags.map((tag, index) => (
                <span key={index} className="blog-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="featured-image">
            <img 
              src={blog.featuredImage} 
              alt={blog.title}
              className="blog-image"
            />
          </div>
        )}

        {/* Blog Content */}
        <article className="blog-content">
          {blog.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: blog.content }} 
              className="blog-body"
            />
          ) : (
            <p className="no-content">No content available for this blog post.</p>
          )}
        </article>

        {/* Blog Footer */}
        <footer className="blog-footer">
          <div className="blog-footer-meta">
            <div className="published-info">
              <span>Published on: {formatDate(blog.publishedAt)}</span>
              {blog.updatedAt && blog.updatedAt !== blog.publishedAt && (
                <span>Last updated: {formatDate(blog.updatedAt)}</span>
              )}
            </div>
          </div>
          
          <div className="blog-actions">
            <button onClick={() => navigate(-1)} className="btn btn-outline">
              <i className="fas fa-arrow-left"></i> Back to Blogs
            </button>
            <Link to="/" className="btn btn-outline">
              <i className="fas fa-home"></i> Go to Home
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlogDetail;