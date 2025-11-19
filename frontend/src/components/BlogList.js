// frontend/src/components/BlogList.js - ENHANCED DEBUG VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        setDebugInfo('🔄 Fetching blogs from backend...');
        console.log('📚 Frontend: Fetching all blogs...');
        
        // Enhanced API call with detailed logging
        const result = await publicAPI.getBlogs();
        console.log('🔍 Frontend API Response:', result);
        
        setDebugInfo(`✅ API Response Received - Success: ${result.success}`);
        
        let blogsArray = [];
        
        // Enhanced response structure handling
        if (result && result.success) {
          if (Array.isArray(result.data)) {
            blogsArray = result.data;
            console.log(`✅ Found ${result.data.length} blogs in result.data`);
          } else if (Array.isArray(result.blogs)) {
            blogsArray = result.blogs;
            console.log(`✅ Found ${result.blogs.length} blogs in result.blogs`);
          } else {
            console.warn('⚠️ Unexpected successful response structure:', result);
            setDebugInfo('⚠️ Success but unexpected data structure');
          }
        } else if (result && Array.isArray(result.data)) {
          // Handle case where success might be missing but data exists
          blogsArray = result.data;
          console.log(`✅ Found ${result.data.length} blogs (success field missing)`);
        } else if (Array.isArray(result)) {
          // Handle case where response is directly the array
          blogsArray = result;
          console.log(`✅ Found ${result.length} blogs (direct array response)`);
        } else {
          console.warn('⚠️ Unexpected response format:', result);
          setError('Unexpected data format from server');
          setDebugInfo('❌ Unexpected response format');
        }

        // Debug: Log what we received
        console.log('📊 Raw blogs array:', blogsArray);
        console.log('🔍 First blog sample:', blogsArray[0]);

        // Filter only published blogs with enhanced logic
        const publishedBlogs = blogsArray.filter(blog => {
          const isPublished = blog.published !== false && blog.published !== 'false';
          console.log(`📝 Blog "${blog.title}" - published: ${blog.published}, isPublished: ${isPublished}`);
          return isPublished;
        });
        
        console.log(`✅ Found ${publishedBlogs.length} published blogs out of ${blogsArray.length} total`);
        setDebugInfo(`📊 Loaded ${publishedBlogs.length} published blogs`);
        
        setBlogs(publishedBlogs);
        setFilteredBlogs(publishedBlogs);
        
        // If no blogs found, log detailed info
        if (publishedBlogs.length === 0) {
          console.warn('❌ No published blogs found. Possible issues:');
          console.warn('- All blogs might be unpublished (published: false)');
          console.warn('- Backend might be returning empty array');
          console.warn('- API endpoint might have no data');
          setDebugInfo(prev => prev + ' - ⚠️ No published blogs found');
        }
        
      } catch (error) {
        console.error('❌ Error fetching blogs:', error);
        setError(error.message || 'Failed to load blog posts');
        setDebugInfo(`❌ Error: ${error.message}`);
        setBlogs([]);
        setFilteredBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Search and filter functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        blog.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchTerm, blogs]);

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
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Test API manually
  const testAPI = async () => {
    try {
      setDebugInfo('🧪 Testing API directly...');
      const response = await fetch('https://zmo-backend.onrender.com/api/blogs');
      const data = await response.json();
      console.log('🔍 Direct API Test Result:', data);
      setDebugInfo(`✅ Direct API Test - Status: ${response.status}, Blogs: ${data.data?.length}`);
    } catch (error) {
      console.error('❌ Direct API Test Failed:', error);
      setDebugInfo(`❌ Direct API Test Failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="blog-list-page">
        <div className="container">
          <div className="page-header">
            <h1>Our Blog</h1>
            <p>Discover insights, innovations, and ideas</p>
          </div>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Blog Posts...</h2>
            <p>Please wait while we fetch the latest content</p>
            <div className="debug-info" style={{ 
              background: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px', 
              marginTop: '15px',
              fontSize: '14px'
            }}>
              <strong>Debug:</strong> {debugInfo}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>Our Blog</h1>
          <p>Discover insights, innovations, and ideas from CYBARCSOFT</p>
          
          {/* Debug Section - Temporary */}
          <div style={{ 
            background: '#fff3cd', 
            padding: '15px', 
            margin: '15px 0', 
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong>🔍 Debug Information</strong>
                <div style={{ marginTop: '5px' }}>
                  <span>Status: {debugInfo}</span>
                  <span style={{ marginLeft: '15px' }}>Blogs: {blogs.length}</span>
                  <span style={{ marginLeft: '10px' }}>Filtered: {filteredBlogs.length}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={testAPI}
                  style={{ 
                    padding: '5px 10px', 
                    background: '#17a2b8', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Test API
                </button>
                <button 
                  onClick={() => console.log('🔍 Current blogs:', blogs)}
                  style={{ 
                    padding: '5px 10px', 
                    background: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Console Log
                </button>
                <button 
                  onClick={handleRetry}
                  style={{ 
                    padding: '5px 10px', 
                    background: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={handleClearSearch}
                className="clear-search"
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="results-info">
            <span className="results-count">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'} 
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="blogs-grid">
            {filteredBlogs.map(blog => (
              <article key={blog._id} className="blog-card">
                {/* Blog Image */}
                <div className="blog-card-image">
                  {blog.featuredImage || blog.image ? (
                    <img 
                      src={blog.featuredImage || blog.image} 
                      alt={blog.title}
                      loading="lazy"
                      onError={(e) => {
                        console.warn('Image failed to load:', blog.featuredImage || blog.image);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <i className="fas fa-newspaper"></i>
                    </div>
                  )}
                </div>

                {/* Blog Content */}
                <div className="blog-card-content">
                  {/* Blog Meta */}
                  <div className="blog-card-meta">
                    <span className="blog-date">
                      <i className="fas fa-calendar"></i>
                      {formatDate(blog.createdAt)}
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

                  {/* Blog Title */}
                  <h2 className="blog-card-title">
                    <Link to={`/blog/${blog._id}`}>
                      {blog.title || 'Untitled Blog'}
                    </Link>
                  </h2>

                  {/* Blog Excerpt */}
                  <p className="blog-card-excerpt">
                    {blog.excerpt || (blog.content && blog.content.substring(0, 150) + '...') || 'No content available'}
                  </p>

                  {/* Blog Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="blog-card-tags">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="blog-tag">
                          #{tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="blog-tag-more">
                          +{blog.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Read More Button */}
                  <div className="blog-card-actions">
                    <Link to={`/blog/${blog._id}`} className="read-more-btn">
                      Read More <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="empty-search-state">
            <div className="empty-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>No matching posts found</h3>
            <p>We couldn't find any blog posts matching "<strong>{searchTerm}</strong>"</p>
            <div className="empty-actions">
              <button onClick={handleClearSearch} className="btn btn-primary">
                Clear Search
              </button>
              <button onClick={handleRetry} className="btn btn-outline">
                Refresh Page
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-newspaper"></i>
            </div>
            <h3>No Blog Posts Available</h3>
            <p>There are no published blog posts at the moment.</p>
            <p className="subtext">Check back soon for new content or contact the administrator.</p>
            
            {/* Enhanced empty state with debugging help */}
            <div style={{ 
              background: '#f8d7da', 
              padding: '15px', 
              borderRadius: '8px', 
              margin: '15px 0',
              textAlign: 'left'
            }}>
              <h4 style={{ color: '#721c24', marginBottom: '10px' }}>Troubleshooting Tips:</h4>
              <ul style={{ color: '#721c24', marginBottom: '0' }}>
                <li>Check if blogs are marked as "published" in the admin panel</li>
                <li>Verify the backend API is returning data</li>
                <li>Check browser console for detailed error messages</li>
                <li>Try the "Test API" button above to verify backend connection</li>
              </ul>
            </div>
            
            <div className="empty-actions">
              <button onClick={testAPI} className="btn btn-outline" style={{ marginRight: '10px' }}>
                <i className="fas fa-bug"></i> Test API
              </button>
              <Link to="/admin" className="btn btn-outline">
                <i className="fas fa-cog"></i> Admin Panel
              </Link>
              <button onClick={handleRetry} className="btn btn-primary" style={{ marginLeft: '10px' }}>
                <i className="fas fa-redo"></i> Try Again
              </button>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="page-footer">
          <Link to="/" className="btn btn-outline">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogList;