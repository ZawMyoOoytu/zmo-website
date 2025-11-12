// frontend/src/pages/Home.js - COMPLETELY FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api'; // ✅ FIXED: Use publicAPI instead of blogAPI
import './Home.css';

const Home = () => {
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const blogContainerRef = useRef(null);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('📚 Fetching recent blogs...');
        
        // ✅ FIXED: Use publicAPI.getBlogs() instead of blogAPI.getBlogs()
        const result = await publicAPI.getBlogs();
        console.log('✅ Blogs API response:', result);
        
        let blogs = [];
        
        // ✅ FIXED: Handle the correct response structure from publicAPI
        if (result && result.success && Array.isArray(result.data)) {
          blogs = result.data;
          console.log(`✅ Found ${blogs.length} blogs`);
        } else if (result && Array.isArray(result.data)) {
          blogs = result.data;
        } else if (Array.isArray(result)) {
          blogs = result;
        } else {
          console.warn('⚠️ Unexpected response format:', result);
          setError('Unexpected data format from server');
        }

        // Filter published blogs and take first 3
        const publishedBlogs = blogs.filter(blog => blog.published !== false);
        const recent = publishedBlogs.slice(0, 3);
        
        console.log('✅ Setting recent blogs:', recent);
        setRecentBlogs(recent);
        
      } catch (error) {
        console.error('❌ Error fetching recent blogs:', error);
        setError(error.message || 'Failed to load blog posts');
        setRecentBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBlogs();
  }, []);

  // Fixed Drag functionality - prevents blocking links
  const handleMouseDown = (e) => {
    // Don't start drag if clicking on links
    if (e.target.closest('.read-more') || e.target.tagName === 'A') {
      return;
    }
    
    setIsDragging(true);
    setStartX(e.pageX - blogContainerRef.current.offsetLeft);
    setScrollLeft(blogContainerRef.current.scrollLeft);
    blogContainerRef.current.classList.add('grabbing');
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    blogContainerRef.current?.classList.remove('grabbing');
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    blogContainerRef.current?.classList.remove('grabbing');
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - blogContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    blogContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Fixed Touch events for mobile
  const handleTouchStart = (e) => {
    // Don't start drag if touching links
    if (e.target.closest('.read-more')) {
      return;
    }
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - blogContainerRef.current.offsetLeft);
    setScrollLeft(blogContainerRef.current.scrollLeft);
    blogContainerRef.current.classList.add('grabbing');
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - blogContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    blogContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    blogContainerRef.current?.classList.remove('grabbing');
  };

  // Navigation arrows
  const scroll = (direction) => {
    if (blogContainerRef.current) {
      const scrollAmount = 400;
      blogContainerRef.current.scrollLeft += direction * scrollAmount;
    }
  };

  // Retry loading blogs
  const retryLoading = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="home">
        <section className="hero">
          <div className="container">
            <h1>Welcome to CYBARCSOFT</h1>
            <p>Discover insights, innovations, and ideas that matter</p>
          </div>
        </section>
        <section className="recent-section bg-light">
          <div className="container">
            <h2>Recent Blog Posts</h2>
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading blogs...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Welcome to CYBARCSOFT</h1>
          <p>Algorithmic Solutions for Modern Problems Based On Politics@Media Education and ICT Platforms</p>
          <div className="hero-buttons">
            <a href="#recent-blogs" className="btn btn-primary">Explore Blogs</a>
            <a href="/about" className="btn btn-secondary">Learn More</a>
          </div>
        </div>
      </section>

      {/* Enhanced Recent Blog Posts Section */}
      <section id="recent-blogs" className="recent-section bg-light">
        <div className="container">
          <h2>Recent Blog Posts</h2>
          
          {error ? (
            <div className="error-state">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Unable to Load Blogs</h3>
              <p>{error}</p>
              <div className="error-details">
                <p><strong>Backend URL:</strong> {process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com'}</p>
                <p><strong>Current Endpoint:</strong> /api/blogs</p>
                <p><strong>Admin Panel:</strong> {window.location.origin}/admin</p>
              </div>
              <div className="error-actions">
                <button onClick={retryLoading} className="btn btn-primary">
                  🔄 Try Again
                </button>
                <button onClick={() => window.location.reload()} className="btn btn-outline">
                  🔃 Refresh Page
                </button>
              </div>
            </div>
          ) : recentBlogs.length > 0 ? (
            <div className="blogs-container">
              <div className="drag-indicator">
                <i className="fas fa-arrows-alt-h"></i>
                Drag to explore more posts
              </div>
              
              <button className="nav-arrow prev" onClick={() => scroll(-1)} aria-label="Previous posts">
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div 
                ref={blogContainerRef}
                className="blogs-preview"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {recentBlogs.map(blog => (
                  <div key={blog._id} className="blog-preview-card">
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
                    
                    <div className="blog-card-content">
                      <h3>{blog.title || 'Untitled Blog'}</h3>
                      <p className="blog-excerpt">
                        {blog.excerpt || (blog.content && blog.content.substring(0, 120) + '...') || 'No content available'}
                      </p>
                      
                      {/* Blog Meta Information */}
                      <div className="blog-meta">
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
                      
                      <div className="blog-card-footer">
                        <Link 
                          to={`/blog/${blog._id}`} 
                          className="read-more"
                          state={{ fromHome: true }}
                        >
                          Read More <i className="fas fa-arrow-right"></i>
                        </Link>
                        <span className="blog-date">
                          <i className="fas fa-calendar"></i>
                          {blog.createdAt ? 
                            new Date(blog.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            'Unknown date'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="nav-arrow next" onClick={() => scroll(1)} aria-label="Next posts">
                <i className="fas fa-chevron-right"></i>
              </button>
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
              </div>
            </div>
          )}
          
          {recentBlogs.length > 0 && (
            <div className="section-footer">
              <Link to="/blogs" className="btn btn-outline">
                <i className="fas fa-list"></i>
                View All Blog Posts ({recentBlogs.length})
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Additional Sections can be added here */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose CYBARCSOFT?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-lightbulb"></i>
              <h3>Innovative Solutions</h3>
              <p>Cutting-edge algorithmic approaches to modern challenges</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-graduation-cap"></i>
              <h3>Education Focus</h3>
              <p>Bridging technology with politics, media, and education</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-rocket"></i>
              <h3>ICT Platforms</h3>
              <p>Modern technology platforms for impactful solutions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;