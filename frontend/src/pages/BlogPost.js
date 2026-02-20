// frontend/src/pages/BlogPost.js - FIXED IMAGE VERSION
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [imageError, setImageError] = useState(false);

  // Backend URL - MUST be the same as BlogList.js
  const BACKEND_URL = 'https://zmo-backend.onrender.com';

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError('');
        setImageError(false);
        console.log(`📖 Fetching blog with ID: ${id}`);
        
        if (!id || id === 'undefined') {
          throw new Error('Invalid blog ID');
        }

        const response = await publicAPI.getBlogById(id);
        console.log('📊 Blog API Response:', response);
        
        // Handle different response formats
        let blogData = null;
        if (response && response.success === true) {
          if (response.data) {
            blogData = response.data;
          } else if (response.blog) {
            blogData = response.blog;
          }
        } else if (response) {
          blogData = response;
        }
        
        if (!blogData) {
          throw new Error('Blog data not available');
        }
        
        console.log('✅ Blog loaded successfully:', blogData.title);
        console.log('🔍 Blog image data:', {
          image: blogData.image,
          featuredImage: blogData.featuredImage,
          thumbnail: blogData.thumbnail,
          coverImage: blogData.coverImage
        });
        
        setBlog(blogData);
        
        // Fetch related blogs based on tags
        await fetchRelatedBlogs(blogData.tags, id);
      } catch (error) {
        console.error('❌ Error fetching blog:', error);
        setError(error.message || 'Failed to load blog post.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedBlogs = async (tags = [], currentBlogId) => {
      try {
        if (!tags || !tags.length) return;
        
        const response = await publicAPI.getBlogs();
        if (response.success && response.data) {
          const related = response.data
            .filter(blog => blog._id !== currentBlogId)
            .filter(blog => 
              blog.tags && Array.isArray(blog.tags) && 
              blog.tags.some(tag => tags.includes(tag))
            )
            .slice(0, 3);
          
          setRelatedBlogs(related);
        }
      } catch (error) {
        console.warn('Could not load related blogs:', error.message);
      }
    };

    if (id) {
      fetchBlog();
    } else {
      setError('No blog ID provided');
      setLoading(false);
    }
  }, [id]);

  // 🔥 CRITICAL FIX: Use the SAME getImageUrl function as BlogList.js
  const getImageUrl = (blog) => {
    if (!blog) return null;
    
    console.log('🖼️ Processing image for blog:', blog.title);
    
    // Try all possible image field names - MUST match BlogList.js
    const possibleImageFields = [
      'image',
      'featuredImage', 
      'thumbnail',
      'coverImage',
      'imageUrl',
      'banner'
    ];
    
    let imagePath = null;
    
    // Find the first non-empty image field
    for (const field of possibleImageFields) {
      if (blog[field] && typeof blog[field] === 'string' && blog[field].trim()) {
        imagePath = blog[field];
        console.log(`✅ Found image in field "${field}":`, imagePath);
        break;
      }
    }
    
    if (!imagePath) {
      console.log('❌ No image found for blog:', blog.title);
      return null;
    }
    
    // Clean up the image path
    imagePath = imagePath.trim();
    
    // CASE 1: Already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('✅ Image is already a full URL');
      return imagePath;
    }
    
    // CASE 2: Data URL
    if (imagePath.startsWith('data:image/')) {
      console.log('✅ Image is data URL');
      return imagePath;
    }
    
    // CASE 3: Starts with /uploads
    if (imagePath.startsWith('/uploads/')) {
      const fullUrl = `${BACKEND_URL}${imagePath}`;
      console.log('✅ Constructed uploads URL:', fullUrl);
      return fullUrl;
    }
    
    // CASE 4: Starts with / (but not /uploads)
    if (imagePath.startsWith('/')) {
      const fullUrl = `${BACKEND_URL}${imagePath}`;
      console.log('✅ Constructed root path URL:', fullUrl);
      return fullUrl;
    }
    
    // CASE 5: Just a filename
    const fullUrl = `${BACKEND_URL}/uploads/${imagePath}`;
    console.log('✅ Constructed uploads filename URL:', fullUrl);
    return fullUrl;
  };

  const handleImageError = (e) => {
    console.error('❌ Featured image failed to load:', e.target.src);
    setImageError(true);
    e.target.style.display = 'none';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return 'Invalid date';
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBackToBlogs = () => {
    navigate('/blogs');
  };

  const renderContent = () => {
    if (!blog) return null;

    if (blog.content) {
      return (
        <div 
          className="content-html"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      );
    } else if (blog.excerpt) {
      return (
        <div className="content-text">
          <p className="excerpt">{blog.excerpt}</p>
        </div>
      );
    } else {
      return (
        <div className="content-unavailable">
          <i className="fas fa-exclamation-circle"></i>
          <p>No content available for this blog post.</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h2>Loading Blog Post...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="error-state">
            <h2>Unable to Load Blog Post</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="btn btn-primary">
                <i className="fas fa-redo"></i> Try Again
              </button>
              <button onClick={handleBackToBlogs} className="btn btn-outline">
                <i className="fas fa-arrow-left"></i> Back to Blogs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="not-found-state">
            <h2>Blog Post Not Available</h2>
            <button onClick={handleBackToBlogs} className="btn btn-primary">
              <i className="fas fa-arrow-left"></i> Back to All Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 Get image URL using the SAME function
  const imageUrl = getImageUrl(blog);

  return (
    <div className="blog-post-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-item">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/blogs" className="breadcrumb-item">Blog</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">
            {blog.title.length > 30 ? blog.title.substring(0, 30) + '...' : blog.title}
          </span>
        </nav>

        <article className="blog-article">
          <header className="blog-header">
            <h1 className="blog-title">{blog.title}</h1>
            
            <div className="blog-meta">
              <div className="meta-left">
                <span className="blog-author">
                  <i className="fas fa-user"></i>
                  By {blog.author || 'Admin'}
                </span>
                <span className="blog-date">
                  <i className="fas fa-calendar"></i>
                  Published on {formatDate(blog.createdAt || blog.date)}
                </span>
              </div>
              
              {blog.readTime && (
                <div className="meta-right">
                  <span className="blog-read-time">
                    <i className="fas fa-clock"></i>
                    {blog.readTime} min read
                  </span>
                </div>
              )}
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="blog-tags-main">
                <i className="fas fa-tags"></i>
                {blog.tags.map((tag, index) => (
                  <span key={index} className="blog-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 🔥 Featured Image with proper error handling */}
          <div className="featured-image-section">
            {imageUrl && !imageError ? (
              <div className="blog-featured-image">
                <img 
                  src={imageUrl}
                  alt={blog.title}
                  onError={handleImageError}
                  loading="lazy"
                  className="featured-img"
                />
                {/* Debug info for development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="image-debug">
                    <small>URL: {imageUrl.length > 50 ? '...' + imageUrl.slice(-50) : imageUrl}</small>
                  </div>
                )}
              </div>
            ) : (
              <div className="image-placeholder">
                <i className="fas fa-image"></i>
                <p>Image not available</p>
              </div>
            )}
          </div>

          <div className="blog-content">
            {renderContent()}
          </div>

          <footer className="blog-footer">
            <div className="blog-actions">
              <button onClick={handleBackToBlogs} className="btn btn-primary">
                <i className="fas fa-arrow-left"></i> Back to Blogs
              </button>
            </div>
            
            <div className="share-section">
              <h4>Share this post</h4>
              <div className="share-buttons">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn twitter"
                >
                  <i className="fab fa-twitter"></i> Twitter
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn linkedin"
                >
                  <i className="fab fa-linkedin"></i> LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </article>

        {relatedBlogs.length > 0 && (
          <section className="related-posts">
            <h3>Related Posts</h3>
            <div className="related-grid">
              {relatedBlogs.map(relatedBlog => {
                const relatedBlogId = relatedBlog._id || relatedBlog.id;
                return (
                  <div key={relatedBlogId} className="related-post-card">
                    <h4>
                      <Link to={`/blogs/${relatedBlogId}`}>
                        {relatedBlog.title}
                      </Link>
                    </h4>
                    <p>{relatedBlog.excerpt || relatedBlog.content?.substring(0, 100)}...</p>
                    <div className="related-meta">
                      <span>{formatDate(relatedBlog.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="blog-cta">
          <h3>Enjoyed this article?</h3>
          <button onClick={handleBackToBlogs} className="btn btn-primary">
            <i className="fas fa-newspaper"></i> View All Blog Posts
          </button>
        </section>
      </div>
    </div>
  );
};

export default BlogPost;