import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const blogContainerRef = useRef(null);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        setLoading(true);
        console.log('Fetching recent blogs...');
        
        // Use getBlogs() instead of getPublishedBlogs()
        const result = await blogAPI.getBlogs();
        console.log('Blogs API response:', result);
        
        // Handle different response structures
        let blogs = result;
        
        if (result && result.data) {
          blogs = result.data;
        }
        
        if (result && Array.isArray(result)) {
          blogs = result;
        }
        
        if (result && result.blogs) {
          blogs = result.blogs;
        }
        
        if (result && result.success && result.data) {
          blogs = result.data;
        }

        // Ensure we have an array and take first 3
        if (Array.isArray(blogs)) {
          const recent = blogs.slice(0, 3);
          console.log('Setting recent blogs:', recent);
          setRecentBlogs(recent);
        } else {
          console.error('Unexpected blogs format:', blogs);
          setRecentBlogs([]);
        }
        
      } catch (error) {
        console.error('Error fetching recent blogs:', error);
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
            <div className="loading">Loading blogs...</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Your existing hero section */}
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
          
          {recentBlogs.length > 0 ? (
            <div className="blogs-container">
              <div className="drag-indicator">
                <i className="fas fa-arrows-alt-h"></i>
                Drag to explore more posts
              </div>
              
              <button className="nav-arrow prev" onClick={() => scroll(-1)}>
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
                      {blog.image ? (
                        <img src={blog.image} alt={blog.title} />
                      ) : (
                        <div className="image-placeholder">
                          <i className="fas fa-newspaper"></i>
                        </div>
                      )}
                    </div>
                    
                    <div className="blog-card-content">
                      <h3>{blog.title || 'Untitled Blog'}</h3>
                      <p className="blog-excerpt">
                        {blog.excerpt || blog.content?.substring(0, 120) + '...' || 'No content available'}
                      </p>
                      <div className="blog-card-footer">
                        <Link 
                          to={`/blogs/${blog._id}`} 
                          className="read-more"
                        >
                          Read More <i className="fas fa-arrow-right"></i>
                        </Link>
                        <span className="blog-date">
                          {blog.createdAt ? 
                            new Date(blog.createdAt).toLocaleDateString() : 
                            'Unknown date'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="nav-arrow next" onClick={() => scroll(1)}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-newspaper"></i>
              <p>No blog posts available.</p>
              <p className="subtext">Check back soon for new content!</p>
            </div>
          )}
          
          <div className="section-footer">
            <Link to="/blogs" className="btn btn-outline">
              View All Blog Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;