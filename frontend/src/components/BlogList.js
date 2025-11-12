// frontend/src/components/BlogList.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api'; // ✅ Use publicAPI for frontend
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('📚 Fetching all blogs...');
        
        // ✅ FIXED: Use publicAPI.getBlogs() for frontend
        const result = await publicAPI.getBlogs();
        console.log('✅ Blogs API response:', result);
        
        let blogsArray = [];
        
        // ✅ Handle the correct response structure
        if (result && result.success && Array.isArray(result.data)) {
          blogsArray = result.data;
        } else if (result && Array.isArray(result.data)) {
          blogsArray = result.data;
        } else if (Array.isArray(result)) {
          blogsArray = result;
        } else {
          console.warn('⚠️ Unexpected response format:', result);
          setError('Unexpected data format from server');
        }

        // Filter only published blogs
        const publishedBlogs = blogsArray.filter(blog => blog.published !== false);
        console.log(`✅ Found ${publishedBlogs.length} published blogs`);
        
        setBlogs(publishedBlogs);
        setFilteredBlogs(publishedBlogs);
        
      } catch (error) {
        console.error('❌ Error fetching blogs:', error);
        setError(error.message || 'Failed to load blog posts');
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
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
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
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-list-page">
        <div className="container">
          <div className="page-header">
            <h1>Our Blog</h1>
            <p>Discover insights, innovations, and ideas</p>
          </div>
          <div className="error-state">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Unable to Load Blogs</h2>
            <p className="error-message">{error}</p>
            
            <div className="error-details">
              <p><strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com'}</p>
              <p><strong>Current Endpoint:</strong> /api/blogs</p>
              <p><strong>Admin Panel:</strong> {window.location.origin}/admin</p>
            </div>
            
            <div className="error-actions">
              <button onClick={handleRetry} className="btn btn-primary">
                <i className="fas fa-redo"></i> Try Again
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
    <div className="blog-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>Our Blog</h1>
          <p>Discover insights, innovations, and ideas from CYBARCSOFT</p>
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
              <Link to="/blogs" className="btn btn-outline">
                View All Posts
              </Link>
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
            <div className="empty-actions">
              <Link to="/admin" className="btn btn-outline">
                <i className="fas fa-cog"></i>
                Admin Panel
              </Link>
              <Link to="/" className="btn btn-outline">
                <i className="fas fa-home"></i>
                Go Home
              </Link>
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