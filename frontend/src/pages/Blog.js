import React, { useState, useEffect } from 'react';
import BlogCard from '../components/BlogCard';
import './Blog.css'; // Make sure you have this CSS file

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchBlogs();
  }, [retryCount]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use environment variable or fallback to correct backend URL
      const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://zmo-backend.onrender.com/api';
      
      console.log('🔄 Fetching blogs from:', `${API_BASE}/blogs/simple`);
      
      const response = await fetch(`${API_BASE}/blogs/simple`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        // Try alternative endpoint if simple fails
        if (response.status === 404) {
          console.log('🔄 Simple endpoint not found, trying main blogs endpoint...');
          return await fetchMainBlogs();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📝 API Response:', data);
      
      if (data.success) {
        // Handle different response structures
        const blogData = data.data || data.blogs || [];
        setBlogs(blogData);
        console.log(`✅ Loaded ${blogData.length} blogs successfully`);
      } else {
        throw new Error(data.message || 'Failed to load blogs from API');
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      
      // Provide user-friendly error messages
      let errorMessage = err.message;
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection and try again.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Blog endpoint not found. The server might be updating.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      
      // Set empty blogs array on error
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMainBlogs = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://zmo-backend.onrender.com/api';
      console.log('🔄 Trying main blogs endpoint:', `${API_BASE}/blogs`);
      
      const response = await fetch(`${API_BASE}/blogs`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const blogData = data.data || data.blogs || [];
        setBlogs(blogData);
        console.log(`✅ Loaded ${blogData.length} blogs from main endpoint`);
      } else {
        throw new Error(data.message || 'Failed to load blogs from main endpoint');
      }
    } catch (err) {
      throw new Error(`Alternative endpoint also failed: ${err.message}`);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Show connection details for debugging
  const connectionDetails = {
    backendURL: process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com',
    currentEndpoint: '/api/blogs/simple',
    alternativeEndpoint: '/api/blogs',
    adminPanel: 'https://zmo-admin.vercel.app'
  };

  if (loading) {
    return (
      <div className="blog-container">
        <div className="blog-header">
          <h1>ZMO Blog</h1>
          <p>Sharing insights and updates</p>
        </div>
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>ZMO Blog</h1>
        <p>Sharing insights, tutorials, and company updates</p>
      </div>

      {error && (
        <div className="error-section">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Failed to load blogs</h3>
            <p>{error}</p>
            
            <div className="error-actions">
              <button onClick={handleRetry} className="btn-primary">
                🔄 Try Again
              </button>
              <button onClick={handleRefresh} className="btn-secondary">
                🔃 Refresh Page
              </button>
            </div>

            {/* Connection details for debugging */}
            <div className="connection-details">
              <h4>Connection Details:</h4>
              <div className="detail-item">
                <strong>Backend URL:</strong> {connectionDetails.backendURL}
              </div>
              <div className="detail-item">
                <strong>Current Endpoint:</strong> {connectionDetails.currentEndpoint}
              </div>
              <div className="detail-item">
                <strong>Alternative:</strong> {connectionDetails.alternativeEndpoint}
              </div>
              <div className="detail-item">
                <strong>Admin Panel:</strong> {connectionDetails.adminPanel}
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && (
        <div className="blog-content">
          {blogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Blogs Available</h3>
              <p>There are no blog posts published yet. Please check back later.</p>
              <button onClick={handleRetry} className="btn-primary">
                🔄 Check Again
              </button>
            </div>
          ) : (
            <>
              <div className="blogs-count">
                <p>Showing {blogs.length} blog{blogs.length !== 1 ? 's' : ''}</p>
              </div>
              
              <div className="blog-grid">
                {blogs.map(blog => (
                  <BlogCard 
                    key={blog._id || blog.id} 
                    blog={blog} 
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Blog;