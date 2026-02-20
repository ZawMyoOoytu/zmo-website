import React, { useState, useEffect } from 'react';
import BlogCard from '../components/BlogCard';
import { publicAPI } from '../services/api'; // Import the new API service
import './Blog.css';

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
      
      console.log('🔄 Fetching blogs using API service...');
      
      // Use the new publicAPI service
      const result = await publicAPI.getBlogs();
      
      console.log('📝 API Response:', result);
      
      if (result.success) {
        // Handle the response structure from the new API
        const blogData = result.data || [];
        setBlogs(blogData);
        console.log(`✅ Loaded ${blogData.length} blogs successfully`);
      } else {
        throw new Error(result.message || 'Failed to load blogs from API');
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      
      // Enhanced error handling with specific messages
      let errorMessage = err.message;
      
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to the server. The backend might be starting up or experiencing issues.';
      } else if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
        errorMessage = 'Request timed out. The server is taking too long to respond.';
      } else if (err.message.includes('CORS')) {
        errorMessage = 'Cross-origin request blocked. Please check backend CORS configuration.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Blog endpoint not found. The API route might have changed.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage = 'Authentication error. Please check your access permissions.';
      }
      
      setError(errorMessage);
      
      // Set empty blogs array on error
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retrying blog fetch...');
    setRetryCount(prev => prev + 1);
  };

  const handleRefresh = () => {
    console.log('🔃 Refreshing page...');
    window.location.reload();
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('🔗 Testing backend connection...');
      const result = await publicAPI.testConnection();
      
      if (result.success) {
        alert('✅ Backend connection successful!');
      } else {
        alert(`❌ Backend connection failed: ${result.message}`);
      }
    } catch (err) {
      alert(`❌ Connection test failed: ${err.message}`);
    }
  };

  // Show connection details for debugging
  const connectionDetails = {
    backendURL: process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com',
    currentEndpoint: '/api/blogs',
    environment: process.env.NODE_ENV,
    adminPanel: 'https://zmo-frontend.vercel.app/admin'
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
          <div className="loading-details">
            <small>Connecting to: {connectionDetails.backendURL}</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>ZMO Blog</h1>
        <p>Sharing insights, tutorials, and company updates</p>
        
        {/* Connection test button for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={testBackendConnection}
            className="btn-test-connection"
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            🔗 Test Backend Connection
          </button>
        )}
      </div>

      {error && (
        <div className="error-section">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Unable to Load Blogs</h3>
            <p className="error-message">{error}</p>
            
            <div className="error-actions">
              <button onClick={handleRetry} className="btn-primary">
                🔄 Try Again
              </button>
              <button onClick={handleRefresh} className="btn-secondary">
                🔃 Refresh Page
              </button>
            </div>

            {/* Enhanced connection details for debugging */}
            <div className="connection-details">
              <h4>Connection Details:</h4>
              <div className="detail-item">
                <strong>Backend URL:</strong> {connectionDetails.backendURL}
              </div>
              <div className="detail-item">
                <strong>Current Endpoint:</strong> {connectionDetails.currentEndpoint}
              </div>
              <div className="detail-item">
                <strong>Environment:</strong> {connectionDetails.environment}
              </div>
              <div className="detail-item">
                <strong>Admin Panel:</strong> {connectionDetails.adminPanel}
              </div>
              
              {/* Troubleshooting tips */}
              <div className="troubleshooting-tips">
                <h5>Troubleshooting Tips:</h5>
                <ul>
                  <li>Check if the backend server is running</li>
                  <li>Verify CORS configuration on the backend</li>
                  <li>Check network connectivity</li>
                  <li>Wait a few minutes if the backend was recently deployed</li>
                </ul>
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
                    key={blog._id} 
                    blog={blog} 
                  />
                ))}
              </div>
              
              {/* Success message */}
              <div className="success-message">
                <small>✅ Successfully loaded blogs from backend</small>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Blog;