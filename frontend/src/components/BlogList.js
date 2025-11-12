// frontend/src/components/BlogList.js - COMPLETELY FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './BlogList.css';

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Get API base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://zmo-backend.onrender.com/api';

  // Fetch blogs function - FIXED: removed retryCount dependency
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📡 Fetching blogs from:', `${API_BASE_URL}/blogs/simple`);

      // Try the simple endpoint first
      const response = await fetch(`${API_BASE_URL}/blogs/simple`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('🔄 Simple endpoint not found, trying main blogs endpoint...');
          // Try the main blogs endpoint
          const mainResponse = await fetch(`${API_BASE_URL}/blogs`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          if (mainResponse.ok) {
            const mainData = await mainResponse.json();
            processBlogData(mainData);
            return;
          }
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ API Response received');
      processBlogData(result);

    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      
      let errorMessage = err.message;
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Blog endpoints not found. The server might be updating.';
      }
      
      setError(errorMessage);
      setBlogs([]); // Clear any previous data
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]); // FIXED: Removed retryCount dependency

  // Process blog data from different response structures
  const processBlogData = (result) => {
    console.log('📝 Processing blog data:', result);
    
    let blogsData = [];
    
    // Handle different response structures
    if (result && Array.isArray(result.data)) {
      blogsData = result.data;
    } else if (result && Array.isArray(result.blogs)) {
      blogsData = result.blogs;
    } else if (Array.isArray(result)) {
      blogsData = result;
    } else if (result && result.success && Array.isArray(result.data)) {
      blogsData = result.data;
    } else if (result && result.success && Array.isArray(result.blogs)) {
      blogsData = result.blogs;
    }

    console.log(`✅ Processed ${blogsData.length} blogs`);
    
    // Filter only published blogs if needed
    const publishedBlogs = blogsData.filter(blog => 
      blog.published !== false && blog.published !== undefined
    );
    
    setBlogs(publishedBlogs.length > 0 ? publishedBlogs : blogsData);

    if (blogsData.length === 0) {
      setError('No blog posts found in the database.');
    } else {
      setError(''); // Clear any previous errors
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs, retryCount]); // FIXED: Added retryCount here instead

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Helper functions
  const createExcerpt = (content, wordLimit = 25) => {
    if (!content) return 'No content available';
    const plainText = content.replace(/<[^>]*>/g, '');
    const words = plainText.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : plainText;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getImageUrl = (blog) => {
    if (blog.imageUrl) return blog.imageUrl;
    if (blog.image) return blog.image;
    if (blog.featuredImage) return blog.featuredImage;
    return null;
  };

  // FIXED: Image error handler without optional chaining
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const nextSibling = e.target.nextElementSibling;
    if (nextSibling) {
      nextSibling.style.display = 'block';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="blog-list">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading blogs from live database...</p>
          <p className="loading-url">Fetching from: {API_BASE_URL}/blogs/simple</p>
          <p className="loading-note">If this takes too long, the backend might be starting up...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && blogs.length === 0) {
    return (
      <div className="blog-list">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <h3>📝 ZMO Blog</h3>
          <p className="error-text">{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-btn primary">
              🔄 Try Again
            </button>
            <button onClick={handleRefresh} className="retry-btn secondary">
              🔃 Refresh Page
            </button>
          </div>
          <div className="backend-info">
            <h4>Connection Details:</h4>
            <div className="connection-detail">
              <strong>Backend URL:</strong> {API_BASE_URL.replace('/api', '')}
            </div>
            <div className="connection-detail">
              <strong>Current Endpoint:</strong> /api/blogs/simple
            </div>
            <div className="connection-detail">
              <strong>Alternative:</strong> /api/blogs
            </div>
            <div className="connection-detail">
              <strong>Admin Panel:</strong> {process.env.REACT_APP_ADMIN_URL || 'https://zmo-admin.vercel.app'}
            </div>
            <div className="connection-detail">
              <strong>Retry Attempt:</strong> {retryCount + 1}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render blog list
  return (
    <div className="blog-list">
      <header className="blog-header">
        <h1>📝 ZMO Blog</h1>
        <p className="blog-subtitle">Latest insights and updates from our team</p>
        <div className="blog-stats">
          <p className="blog-count">Showing {blogs.length} post{blogs.length !== 1 ? 's' : ''}</p>
          <p className="blog-source">📍 Connected to live database</p>
        </div>
      </header>

      {error && (
        <div className="warning-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="no-blogs">
          <div className="no-blogs-icon">📄</div>
          <h3>No blog posts yet</h3>
          <p>Blog posts will appear here once they are published from the admin panel.</p>
          <div className="admin-link">
            <a 
              href={process.env.REACT_APP_ADMIN_URL || 'https://zmo-admin.vercel.app'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="admin-btn"
            >
              👉 Visit Admin Panel to create posts
            </a>
          </div>
        </div>
      ) : (
        <div className="blogs-grid">
          {blogs.map(blog => (
            <article key={blog._id || blog.id} className="blog-card">
              {getImageUrl(blog) && (
                <div className="blog-image">
                  <img 
                    src={getImageUrl(blog)} 
                    alt={blog.title} 
                    onError={handleImageError} // FIXED: Using the safe function
                  />
                  <div className="image-fallback" style={{display: 'none'}}>
                    <span>📝</span>
                  </div>
                </div>
              )}

              <div className="blog-content">
                <h2 className="blog-title">{blog.title || 'Untitled Post'}</h2>
                <p className="blog-excerpt">
                  {blog.excerpt || createExcerpt(blog.content || 'No content available')}
                </p>
                
                <div className="blog-meta">
                  <span className="blog-date">
                    📅 {formatDate(blog.createdAt || blog.createdDate || blog.date)}
                  </span>
                  {blog.author && (
                    <span className="blog-author">👤 {blog.author}</span>
                  )}
                </div>
                
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-tags">
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="tag-more">+{blog.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                
                <Link 
                  to={`/blog/${blog._id || blog.id}`} 
                  className="read-more-btn"
                  state={{ blog }}
                >
                  Read Full Article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>Debug Information</summary>
            <div className="debug-content">
              <p><strong>Backend URL:</strong> {API_BASE_URL}</p>
              <p><strong>Total Posts:</strong> {blogs.length}</p>
              <p><strong>Retry Count:</strong> {retryCount}</p>
              <button 
                onClick={() => {
                  console.log('Blogs data:', blogs);
                  console.log('API Base URL:', API_BASE_URL);
                  alert('Check browser console for detailed data');
                }}
                className="debug-btn"
              >
                View Raw Data in Console
              </button>
            </div>
          </details>
        </div>
      )}

      {/* Refresh button for production */}
      {process.env.NODE_ENV !== 'development' && (
        <div className="refresh-section">
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh Blog List
          </button>
        </div>
      )}
    </div>
  );
}

export default BlogList;