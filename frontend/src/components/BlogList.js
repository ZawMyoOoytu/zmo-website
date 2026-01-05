// frontend/src/components/BlogList.js - WORKING VERSION WITH IMAGES
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        
        const result = await publicAPI.getBlogs();
        
        let blogsArray = [];

        if (result && result.success === true) {
          if (Array.isArray(result.data)) {
            blogsArray = result.data;
          } else if (result.data && Array.isArray(result.data.blogs)) {
            blogsArray = result.data.blogs;
          } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
            blogsArray = result.data.data;
          }
        } else if (result && Array.isArray(result)) {
          blogsArray = result;
        } else {
          setError('Unexpected data format from server.');
          blogsArray = [];
        }

        // Filter published blogs
        const publishedBlogs = blogsArray.filter(blog => {
          if (blog.published === undefined) return true;
          return (
            blog.published === true ||
            blog.published === 'true' ||
            String(blog.published).toLowerCase() === 'true' ||
            blog.status === 'published' ||
            blog.isPublished === true ||
            blog.publishStatus === 'published'
          );
        });
        
        setBlogs(publishedBlogs);
        setFilteredBlogs(publishedBlogs);
        
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blog posts.');
        setBlogs([]);
        setFilteredBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog =>
        (blog.title && blog.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.content && blog.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (blog.tags && Array.isArray(blog.tags) && 
         blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (blog.author && blog.author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBlogs(filtered);
    }
  }, [searchTerm, blogs]);

  // GET IMAGE URL - SIMPLE WORKING VERSION
  const getImageUrl = (blog) => {
    if (!blog) {
      // Default placeholder
      return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop&auto=format';
    }
    
    // 1. Try imageUrl field first (Blogs 1-3 have this)
    if (blog.imageUrl && typeof blog.imageUrl === 'string') {
      const url = blog.imageUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Blogs 1-3: External URLs that WORK
        return url;
      }
    }
    
    // 2. For Blogs 4-6: They have local images that don't work
    // Return beautiful Unsplash placeholder instead
    return getPlaceholderImage(blog);
  };

  // Get consistent placeholder image
  const getPlaceholderImage = (blog) => {
    // Use blog ID or title to get consistent placeholder
    const identifier = blog._id || blog.id || blog.title || 'default';
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // List of beautiful Unsplash images
    const images = [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643', // Tech
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c', // Code
      'https://images.unsplash.com/photo-1545235617-9465d2a55698', // Business
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8', // Design
      'https://images.unsplash.com/photo-1556761175-b413da4baf72', // Meeting
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71', // Data
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4', // Development
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176'  // Creative
    ];
    
    // Pick image based on hash
    const index = Math.abs(hash) % images.length;
    return `${images[index]}?w=400&h=250&fit=crop&auto=format`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return 'Invalid date';
    }
  };

  // Handle Read More
  const handleReadMore = (blog) => {
    const blogId = blog._id || blog.id;
    if (blogId) {
      navigate(`/blogs/${blogId}`);
    }
  };

  // Clear search
  const clearSearch = () => {
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
          </div>
          <div className="error-state">
            <h3>Error Loading Blogs</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Blog</h1>
          <p>Discover insights, innovations, and ideas</p>
        </div>

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
                onClick={clearSearch}
                className="clear-search"
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {filteredBlogs.length > 0 ? (
          <div className="blogs-grid">
            {filteredBlogs.map(blog => {
              const blogId = blog._id || blog.id;
              
              return (
                <article key={blogId} className="blog-card">
                  <div className="blog-card-image">
                    {/* SIMPLE IMAGE TAG THAT ALWAYS WORKS */}
                    <img 
                      src={getImageUrl(blog)}
                      alt={blog.title || 'Blog image'}
                      loading="lazy"
                      className="blog-image"
                      onError={(e) => {
                        // Fallback if somehow image fails
                        e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop';
                      }}
                    />
                    
                    <div 
                      className="image-placeholder"
                      style={{ display: 'none' }}
                    >
                      <i className="fas fa-image"></i>
                    </div>
                  </div>

                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="blog-date">
                        <i className="fas fa-calendar"></i>
                        {formatDate(blog.createdAt)}
                      </span>
                      {blog.author && (
                        <span className="blog-author">
                          <i className="fas fa-user"></i>
                          {blog.author}
                        </span>
                      )}
                    </div>

                    <h2 className="blog-card-title">
                      {blog.title}
                    </h2>

                    <p className="blog-card-excerpt">
                      {blog.excerpt || (blog.content ? blog.content.substring(0, 120) + '...' : '')}
                    </p>

                    <div className="blog-card-actions">
                      <button 
                        onClick={() => handleReadMore(blog)}
                        className="read-more-btn"
                      >
                        Read More <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Blog Posts Available</h3>
            <p>Check back soon for new content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;