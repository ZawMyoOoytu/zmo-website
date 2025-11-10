// frontend/src/components/BlogList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './BlogList.css';

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get API base URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://zmo-backend.onrender.com/api';

  // Fetch blogs function
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📡 Fetching blogs from:', `${API_BASE_URL}/simple`);

      const response = await fetch(`${API_BASE_URL}/simple`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);

      // Determine where blog data is
      let blogsData = [];
      if (result && Array.isArray(result.blogs)) {
        blogsData = result.blogs;
      } else if (result && Array.isArray(result.data)) {
        blogsData = result.data;
      } else if (Array.isArray(result)) {
        blogsData = result;
      }

      console.log('📝 Processed blogs data:', blogsData);
      setBlogs(blogsData);

      if (blogsData.length === 0) {
        setError('No blog posts found in the database.');
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      setError(`Failed to load blogs: ${err.message}`);

      // Fallback endpoint
      try {
        console.log('🔄 Trying fallback endpoint: /blogs');
        const fallbackResponse = await fetch(`${API_BASE_URL}/blogs`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && Array.isArray(fallbackData.blogs)) {
            setBlogs(fallbackData.blogs);
            setError('');
          } else if (Array.isArray(fallbackData)) {
            setBlogs(fallbackData);
            setError('');
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Helpers
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

  // Render loading state
  if (loading) {
    return (
      <div className="blog-list">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading blogs from live database...</p>
          <p className="loading-url">Fetching from: {API_BASE_URL}/simple</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="blog-list">
        <div className="error-message">
          <h3>📝 ZMO Blog</h3>
          <p>{error}</p>
          <button onClick={fetchBlogs} className="retry-btn">🔄 Try Again</button>
          <div className="backend-info">
            <h4>Connection Details:</h4>
            <p><strong>Backend URL:</strong> {API_BASE_URL}</p>
            <p><strong>Current Endpoint:</strong> /simple</p>
            <p><strong>Alternative:</strong> /blogs</p>
            <p><strong>Admin Panel:</strong> {process.env.REACT_APP_ADMIN_URL}</p>
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
          <p className="blog-count">Showing {blogs.length} posts</p>
          <p className="blog-source">📍 Connected to live MongoDB database</p>
        </div>
      </header>

      {blogs.length === 0 ? (
        <div className="no-blogs">
          <div className="no-blogs-icon">📄</div>
          <h3>No blog posts yet</h3>
          <p>Blog posts will appear here once they are created from the admin panel.</p>
          <p><a href={process.env.REACT_APP_ADMIN_URL} target="_blank" rel="noopener noreferrer">👉 Visit Admin Panel to create posts</a></p>
        </div>
      ) : (
        <div className="blogs-grid">
          {blogs.map(blog => (
            <article key={blog._id || blog.id} className="blog-card">
              {(blog.image || blog.imageUrl) && (
                <div className="blog-image">
                  <img 
                    src={blog.image || blog.imageUrl} 
                    alt={blog.title} 
                    onError={(e) => e.target.style.display = 'none'} 
                  />
                </div>
              )}

              <div className="blog-content">
                <h2>{blog.title}</h2>
                <p className="blog-excerpt">{blog.excerpt || createExcerpt(blog.content)}</p>
                <div className="blog-meta">
                  <span className="blog-date">📅 {formatDate(blog.createdAt || blog.createdDate)}</span>
                  {blog.author && <span className="blog-author">👤 {blog.author}</span>}
                </div>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-tags">
                    {blog.tags.map((tag, index) => <span key={index} className="tag">#{tag}</span>)}
                  </div>
                )}
                <Link to={`/blog/${blog._id || blog.id}`} className="read-more-btn">Read Full Article →</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Debug / status info */}
      <div className="debug-info">
        <strong>Live Connection Status:</strong> ✅ Connected to {API_BASE_URL}<br/>
        <strong>Total Posts:</strong> {blogs.length} posts loaded<br/>
        <button onClick={() => {
          console.log('Blogs data:', blogs);
          alert('Check console for detailed blog data');
        }}>View Raw Data</button>
      </div>
    </div>
  );
}

export default BlogList;
