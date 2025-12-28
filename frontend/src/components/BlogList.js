// frontend/src/components/BlogList.js - COMPLETE FIXED VERSION
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
        
        setDebugInfo(`✅ API Response Received - Success: ${result ? result.success : 'false'}`);
        
        let blogsArray = [];
        
        // FIXED RESPONSE HANDLING:
        console.log('🔍 Raw API Response:', result);

        if (result && result.success === true && Array.isArray(result.data)) {
          blogsArray = result.data;
          console.log(`✅ Found ${blogsArray.length} blogs in result.data`);
        } else if (result && Array.isArray(result.data)) {
          blogsArray = result.data;
          console.log(`✅ Found ${blogsArray.length} blogs (success field may be missing)`);
        } else {
          console.warn('⚠️ Unexpected response format:', result);
          setError('Unexpected data format from server: ' + JSON.stringify(result));
          setDebugInfo('❌ Unexpected response format');
          blogsArray = []; // Ensure it's always an array
        }

        // Debug: Log what we received
        console.log('📊 Raw blogs array:', blogsArray);
        
        if (blogsArray.length > 0) {
          console.log('🔍 First blog sample:', blogsArray[0]);
        }

        // FIXED PUBLISHED FILTER:
        const publishedBlogs = blogsArray.filter(blog => {
          // Handle both boolean and string values for published field
          // Also check status field for 'published'
          const isPublished = 
            blog.published === true || 
            blog.published === 'true' || 
            blog.status === 'published';
          
          console.log(`📝 Blog "${blog.title}" - published: ${blog.published}, status: ${blog.status}, isPublished: ${isPublished}`);
          return isPublished;
        });
        
        console.log(`✅ Found ${publishedBlogs.length} published blogs out of ${blogsArray.length} total`);
        setDebugInfo(`📊 Loaded ${publishedBlogs.length} published blogs`);
        
        setBlogs(publishedBlogs);
        setFilteredBlogs(publishedBlogs);
        
        // If no blogs found, log detailed info
        if (publishedBlogs.length === 0 && blogsArray.length > 0) {
          console.warn('❌ No published blogs found. All blogs:', blogsArray);
          console.warn('- Check if blogs have published: true or status: "published"');
          setDebugInfo(prev => prev + ' - ⚠️ No published blogs found');
          
          // TEMPORARY: Show all blogs for debugging
          console.log('🔧 TEMPORARY: Showing all blogs including drafts for debugging');
          setBlogs(blogsArray);
          setFilteredBlogs(blogsArray);
          setDebugInfo(`📊 Showing ALL ${blogsArray.length} blogs (including drafts)`);
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
        (blog.title && blog.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.content && blog.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (blog.author && blog.author.toLowerCase().includes(searchTerm.toLowerCase()))
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
      setDebugInfo(`✅ Direct API Test - Status: ${response.status}, Blogs: ${data.data ? data.data.length : 0}`);
      
      // Show raw data in console for debugging
      console.log('📋 Raw API Data for debugging:', data.data);
    } catch (error) {
      console.error('❌ Direct API Test Failed:', error);
      setDebugInfo(`❌ Direct API Test Failed: ${error.message}`);
    }
  };

  // Show all blogs including drafts (for debugging)
  const showAllBlogs = () => {
    setDebugInfo('🔧 Showing all blogs including drafts');
    // This will refetch and show all blogs
    window.location.reload();
  };

  // Handle image error - FIXED VERSION
  const handleImageError = (e) => {
    console.warn('Image failed to load');
    e.target.style.display = 'none';
    // Show placeholder if image fails - FIXED SYNTAX
    const nextSibling = e.target.nextSibling;
    if (nextSibling && nextSibling.style) {
      nextSibling.style.display = 'block';
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
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                  onClick={showAllBlogs}
                  style={{ 
                    padding: '5px 10px', 
                    background: '#fd7e14', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Show All
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
                  {blog.image || blog.featuredImage ? (
                    <img 
                      src={blog.image || blog.featuredImage} 
                      alt={blog.title}
                      loading="lazy"
                      onError={handleImageError}
                    />
                  ) : null}
                  
                  {/* Image placeholder - show if no image or image fails */}
                  {(!blog.image && !blog.featuredImage) && (
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
                    {/* Show status badge for debugging */}
                    {(blog.published === false || blog.status === 'draft') && (
                      <span className="blog-status" style={{ 
                        background: '#ffc107', 
                        color: '#000',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {blog.status || 'unpublished'}
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
                <li>Click "Show All" to see draft/unpublished blogs</li>
              </ul>
            </div>
            
            <div className="empty-actions">
              <button onClick={testAPI} className="btn btn-outline" style={{ marginRight: '10px' }}>
                <i className="fas fa-bug"></i> Test API
              </button>
              <button onClick={showAllBlogs} className="btn btn-outline" style={{ marginRight: '10px' }}>
                <i className="fas fa-eye"></i> Show All Blogs
              </button>
              <Link to="/admin" className="btn btn-outline" style={{ marginRight: '10px' }}>
                <i className="fas fa-cog"></i> Admin Panel
              </Link>
              <button onClick={handleRetry} className="btn btn-primary">
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