import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const blogContainerRef = useRef(null);

  // ========== FIXED IMAGE URL FUNCTION ==========
  const getDefaultImageUrl = useCallback((index) => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return defaultImages[index % defaultImages.length];
  }, []);

  const getImageUrl = useCallback((blog) => {
    if (!blog) return getDefaultImageUrl(0);
    
    console.log('Blog object for image check:', blog);
    
    // Common image field names
    const imageFields = [
      'featuredImage', 'image', 'imageUrl', 'coverImage', 
      'thumbnail', 'featuredImageUrl', 'image_url', 'photo',
      'cover_image', 'featured_image', 'bannerImage'
    ];
    
    let foundImage = '';
    
    // First, check if blog has any image field with a value
    for (const field of imageFields) {
      if (blog[field] && typeof blog[field] === 'string' && blog[field].trim() !== '') {
        const imageValue = blog[field].trim();
        
        // Check if it's null/undefined string
        if (imageValue.toLowerCase() === 'null' || imageValue.toLowerCase() === 'undefined') {
          continue;
        }
        
        foundImage = imageValue;
        console.log(`Found image in field "${field}":`, foundImage);
        break;
      }
    }
    
    // If no image found, use default
    if (!foundImage) {
      console.log('No image found in blog, using default');
      return getDefaultImageUrl(0);
    }
    
    // If it's already a full URL, return it
    if (foundImage.startsWith('http://') || foundImage.startsWith('https://')) {
      console.log('Image is already full URL:', foundImage);
      return foundImage;
    }
    
    // Handle different backend URL formats
    const BACKEND_URL = 'https://zmo-backend.onrender.com';
    
    // Clean the path
    let cleanPath = foundImage;
    
    // Remove leading slash if exists
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Check if path already contains uploads
    if (cleanPath.includes('uploads/')) {
      // Remove duplicate uploads if present
      cleanPath = cleanPath.replace(/^uploads\//, '');
      const finalUrl = `${BACKEND_URL}/uploads/${cleanPath}`;
      console.log('Constructed upload URL:', finalUrl);
      return finalUrl;
    }
    
    // For filenames without path
    const finalUrl = `${BACKEND_URL}/uploads/${cleanPath}`;
    console.log('Constructed URL from filename:', finalUrl);
    return finalUrl;
  }, [getDefaultImageUrl]);

  const getFallbackBlogs = useCallback(() => {
    return [
      {
        _id: 'fallback-1',
        title: 'Welcome to CYBARCSOFT Blog',
        excerpt: 'Discover algorithmic solutions for modern problems in politics, media, education, and ICT platforms.',
        author: 'Admin',
        readTime: '5',
        createdAt: new Date().toISOString(),
        featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        _id: 'fallback-2',
        title: 'Latest Updates & Announcements',
        excerpt: 'Stay informed with our latest developments and upcoming projects.',
        author: 'Admin',
        readTime: '3',
        createdAt: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        _id: 'fallback-3',
        title: 'Technology in Education',
        excerpt: 'Exploring how modern technology is transforming education.',
        author: 'Admin',
        readTime: '7',
        createdAt: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ];
  }, []);

  // ========== FETCH RECENT BLOGS ==========
  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        
        let blogsData = [];
        
        try {
          console.log('Fetching blogs from API...');
          const response = await publicAPI.getBlogs();
          console.log('Raw API response:', response);
          
          // Different API response structures
          if (response && response.success === true) {
            if (Array.isArray(response.data)) {
              blogsData = response.data;
            } else if (response.data && Array.isArray(response.data.blogs)) {
              blogsData = response.data.blogs;
            } else if (response.data && Array.isArray(response.data.data)) {
              blogsData = response.data.data;
            }
          } else if (Array.isArray(response)) {
            blogsData = response;
          } else if (response && Array.isArray(response.data)) {
            blogsData = response.data;
          } else if (response && Array.isArray(response.blogs)) {
            blogsData = response.blogs;
          }
          
          console.log('Extracted blogs data:', blogsData);
          
        } catch (apiError) {
          console.error('Error with getBlogs():', apiError);
          try {
            const altResponse = await publicAPI.getAllBlogs();
            console.log('Alternative API response:', altResponse);
            if (altResponse && Array.isArray(altResponse)) {
              blogsData = altResponse;
            }
          } catch (secondError) {
            console.error('Error with getAllBlogs():', secondError);
          }
        }
        
        // If no data, use fallback
        if (!blogsData || blogsData.length === 0) {
          console.log('No blog data received, using fallback');
          setRecentBlogs(getFallbackBlogs());
          setError('No blogs found. Showing sample content.');
          return;
        }
        
        // Filter published blogs
        const publishedBlogs = blogsData.filter(blog => {
          if (!blog || typeof blog !== 'object') return false;
          
          // Check various published fields
          const isPublished = 
            blog.published === true ||
            blog.published === 'true' ||
            blog.status === 'published' ||
            blog.isPublished === true ||
            blog.publishStatus === 'published' ||
            blog.published === undefined; // Assume published if field doesn't exist
          
          console.log(`Blog "${blog.title || 'Untitled'}": published=${isPublished}`);
          return isPublished;
        });
        
        console.log('Published blogs:', publishedBlogs);
        
        // Sort by date and take latest 3
        const sortedBlogs = publishedBlogs.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.createdDate || a.date || 0);
          const dateB = new Date(b.createdAt || b.createdDate || b.date || 0);
          return dateB - dateA;
        }).slice(0, 3);
        
        console.log('Final recent blogs:', sortedBlogs);
        setRecentBlogs(sortedBlogs);
        
      } catch (error) {
        console.error('Home: Error fetching recent blogs:', error);
        setError('Unable to load recent blogs. Please try again later.');
        setRecentBlogs(getFallbackBlogs());
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBlogs();
  }, [getFallbackBlogs]);

  // ========== IMAGE LOAD HANDLERS ==========
  const handleImageLoad = (blogId) => {
    console.log(`Image loaded for blog ${blogId}`);
    setImageLoadStates(prev => ({ ...prev, [blogId]: 'loaded' }));
  };

  const handleImageError = (blogId, e, blog, index) => {
    console.error(`Image failed to load for blog ${blogId}`);
    console.error('Failed image URL:', e.target.src);
    
    // Try to get more info about the image
    const blogObj = recentBlogs.find(b => (b._id || b.id) === blogId);
    console.log('Blog image info:', {
      featuredImage: blogObj?.featuredImage,
      image: blogObj?.image,
      imageUrl: blogObj?.imageUrl,
      allFields: Object.keys(blogObj || {}).filter(key => key.toLowerCase().includes('image'))
    });
    
    // Set fallback image
    const fallbackUrl = getDefaultImageUrl(index);
    e.target.src = fallbackUrl;
    setImageLoadStates(prev => ({ ...prev, [blogId]: 'error' }));
    
    // Try alternative image URL construction
    setTimeout(() => {
      console.log('Trying alternative image construction...');
      const BACKEND_URL = 'https://zmo-backend.onrender.com';
      const blogObj = recentBlogs.find(b => (b._id || b.id) === blogId);
      
      if (blogObj) {
        // Try direct uploads path
        const imageFields = ['featuredImage', 'image', 'imageUrl', 'coverImage'];
        for (const field of imageFields) {
          if (blogObj[field]) {
            const altUrl = `${BACKEND_URL}/uploads/${blogObj[field]}`;
            console.log(`Trying alternative URL: ${altUrl}`);
            break;
          }
        }
      }
    }, 1000);
  };

  // ========== DRAG FUNCTIONALITY ==========
  const handleMouseDown = (e) => {
    if (e.target.closest('.read-more') || e.target.tagName === 'A') return;
    setIsDragging(true);
    if (blogContainerRef.current) {
      setStartX(e.pageX - blogContainerRef.current.offsetLeft);
      setScrollLeft(blogContainerRef.current.scrollLeft);
      blogContainerRef.current.classList.add('grabbing');
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (blogContainerRef.current) {
      blogContainerRef.current.classList.remove('grabbing');
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (blogContainerRef.current) {
      blogContainerRef.current.classList.remove('grabbing');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !blogContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - blogContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    blogContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.read-more') || e.target.tagName === 'A') return;
    setIsDragging(true);
    if (blogContainerRef.current) {
      setStartX(e.touches[0].pageX - blogContainerRef.current.offsetLeft);
      setScrollLeft(blogContainerRef.current.scrollLeft);
      blogContainerRef.current.classList.add('grabbing');
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !blogContainerRef.current) return;
    const x = e.touches[0].pageX - blogContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    blogContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (blogContainerRef.current) {
      blogContainerRef.current.classList.remove('grabbing');
    }
  };

  const scroll = (direction) => {
    if (blogContainerRef.current) {
      const scrollAmount = 400;
      blogContainerRef.current.scrollLeft += direction * scrollAmount;
    }
  };

  const showSampleBlogs = () => {
    setRecentBlogs(getFallbackBlogs());
    setError('');
  };

  const retryFetch = () => {
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (loading) {
    return (
      <div className="home">
        <section className="hero">
          <div className="container">
            <h1>Welcome to CYBARCSOFT</h1>
            <p>Algorithmic Solutions for Modern Problems Based On Politics@Media Education and ICT Platforms</p>
            <div className="hero-buttons">
              <a href="#recent-blogs" className="btn btn-primary">Explore Blogs</a>
              <Link to="/about" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
        </section>
        <section className="recent-section bg-light">
          <div className="container">
            <h2>Recent Blog Posts</h2>
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading recent blogs...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Welcome to CYBARCSOFT</h1>
          <p>Algorithmic Solutions for Modern Problems Based On Politics@Media Education and ICT Platforms</p>
          <div className="hero-buttons">
            <a href="#recent-blogs" className="btn btn-primary">Explore Blogs</a>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      <section id="recent-blogs" className="recent-section bg-light">
        <div className="container">
          <h2>Recent Blog Posts</h2>
          
          {error && (
            <div className="error-notice">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
              <div className="error-actions">
                <button onClick={showSampleBlogs} className="btn-small">
                  Show Sample
                </button>
                <button onClick={retryFetch} className="btn-small btn-outline">
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {recentBlogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-newspaper"></i>
              </div>
              <h3>No Recent Posts</h3>
              <p>There are no published blog posts at the moment.</p>
              <div className="empty-actions">
                <button onClick={showSampleBlogs} className="btn btn-primary">
                  Show Sample Blogs
                </button>
                <Link to="/blogs" className="btn btn-outline">
                  View All Blogs
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="drag-indicator">
                <i className="fas fa-arrows-alt-h"></i>
                <span>Drag or use arrows to explore</span>
              </div>
              
              <div className="blogs-container">
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
                  {recentBlogs.map((blog, index) => {
                    const blogId = blog._id || blog.id || `blog-${index}`;
                    const imageUrl = getImageUrl(blog);
                    const imageState = imageLoadStates[blogId] || 'loading';
                    
                    console.log(`Rendering blog ${index}:`, {
                      title: blog.title,
                      id: blogId,
                      imageUrl: imageUrl,
                      imageState: imageState
                    });
                    
                    return (
                      <div key={blogId} className="blog-preview-card">
                        <div className={`blog-card-image ${imageState === 'loading' ? 'loading' : ''}`}>
                          <img 
                            src={imageUrl} 
                            alt={blog.title || 'Blog Post'} 
                            loading="lazy"
                            className={imageState}
                            onLoad={() => handleImageLoad(blogId)}
                            onError={(e) => handleImageError(blogId, e, blog, index)}
                            crossOrigin="anonymous"
                          />
                          {imageState === 'loading' && (
                            <div className="image-loading-overlay">
                              <i className="fas fa-spinner fa-spin"></i>
                              <span>Loading image...</span>
                            </div>
                          )}
                          {imageState === 'error' && (
                            <div className="image-error-overlay">
                              <i className="fas fa-exclamation-triangle"></i>
                              <span>Image failed to load</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="blog-card-content">
                          <h3>{blog.title || `Blog Post ${index + 1}`}</h3>
                          <p className="blog-excerpt">
                            {blog.excerpt || 
                             blog.description || 
                             (blog.content && blog.content.substring(0, 120) + '...') || 
                             'Read more about this topic...'}
                          </p>
                          
                          <div className="blog-meta">
                            <span className="blog-author">
                              <i className="fas fa-user"></i>
                              {blog.author || blog.authorName || 'Admin'}
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
                              to={`/blogs/${blogId}`}
                              className="read-more"
                              onClick={(e) => e.stopPropagation()}
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
                                'Recent'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button className="nav-arrow next" onClick={() => scroll(1)} aria-label="Next posts">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div className="section-footer">
                <Link to="/blogs" className="btn btn-outline">
                  <i className="fas fa-list"></i>
                  View All Blog Posts
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

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