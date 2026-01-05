// src/components/dashboard/BlogList.js - ENHANCED VERSION
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  
  const blogsPerPage = 10;

  // Enhanced mock data with more realistic content
  const mockBlogs = [
    {
      id: 1,
      title: 'Getting Started with React',
      excerpt: 'Learn how to build modern web applications with React, including hooks, state management, and component architecture...',
      category: 'technology',
      tags: ['react', 'javascript', 'webdev', 'frontend'],
      status: 'published',
      featured: true,
      author: 'John Doe',
      views: 1234,
      comments: 42,
      likes: 89,
      createdAt: '2023-10-15',
      updatedAt: '2023-10-20',
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'Advanced JavaScript Patterns',
      excerpt: 'Explore advanced JavaScript patterns and best practices for writing clean, maintainable code...',
      category: 'tutorial',
      tags: ['javascript', 'patterns', 'programming', 'es6'],
      status: 'draft',
      featured: false,
      author: 'Jane Smith',
      views: 0,
      comments: 0,
      likes: 0,
      createdAt: '2023-10-18',
      updatedAt: '2023-10-18',
      readTime: '8 min'
    },
    {
      id: 3,
      title: 'CSS Grid vs Flexbox',
      excerpt: 'A comprehensive comparison of CSS Grid and Flexbox layout systems with practical examples...',
      category: 'design',
      tags: ['css', 'grid', 'flexbox', 'layout'],
      status: 'published',
      featured: true,
      author: 'Alex Johnson',
      views: 845,
      comments: 23,
      likes: 56,
      createdAt: '2023-10-10',
      updatedAt: '2023-10-12',
      readTime: '6 min'
    },
    {
      id: 4,
      title: 'Introduction to Next.js',
      excerpt: 'Discover the power of Next.js for server-side rendering, static generation, and API routes...',
      category: 'framework',
      tags: ['nextjs', 'react', 'ssr', 'seo'],
      status: 'published',
      featured: false,
      author: 'Sarah Wilson',
      views: 1567,
      comments: 67,
      likes: 124,
      createdAt: '2023-10-05',
      updatedAt: '2023-10-08',
      readTime: '10 min'
    },
    {
      id: 5,
      title: 'State Management with Redux Toolkit',
      excerpt: 'Modern state management techniques using Redux Toolkit for scalable applications...',
      category: 'tutorial',
      tags: ['redux', 'state-management', 'react', 'toolkit'],
      status: 'draft',
      featured: false,
      author: 'Mike Chen',
      views: 0,
      comments: 0,
      likes: 0,
      createdAt: '2023-10-22',
      updatedAt: '2023-10-22',
      readTime: '12 min'
    }
  ];

  // Fetch blogs with error handling
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In real app, fetch from API:
        // const response = await fetch('/api/blogs');
        // const data = await response.json();
        // setBlogs(data);
        
        setBlogs(mockBlogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1); // Reset to first page on search
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Filter and sort blogs with useMemo for performance
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter(blog => {
        const matchesSearch = 
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          blog.author.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [blogs, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination calculations
  const paginatedBlogs = useMemo(() => {
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    return filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  }, [filteredBlogs, currentPage]);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Format date with better error handling
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Navigation handlers
  const handleEdit = (blogId) => {
    navigate(`/admin/blogs/edit/${blogId}`);
  };

  const handleView = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleCreate = () => {
    navigate('/admin/blogs/new');
  };

  const handleViewPublic = () => {
    window.open('/blog', '_blank');
  };

  const handlePublish = async (blogId) => {
    try {
      // In real app, make API call:
      // await fetch(`/api/blogs/${blogId}/publish`, { method: 'PUT' });
      
      setBlogs(blogs.map(blog => 
        blog.id === blogId 
          ? { 
              ...blog, 
              status: blog.status === 'published' ? 'draft' : 'published',
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : blog
      ));
    } catch (err) {
      console.error('Error updating blog status:', err);
    }
  };

  const handleDelete = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setBlogs(blogs.filter(blog => blog.id !== blogId));
      // Reset to first page if no blogs on current page
      if (paginatedBlogs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Loading and error states
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3>Error Loading Blogs</h3>
        <p>{error}</p>
        <button 
          style={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Blog Posts</h1>
          <p style={styles.subtitle}>Manage your blog posts and content</p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={styles.viewButton}
            onClick={handleViewPublic}
            title="View public blog"
          >
            👁 View Public Blog
          </button>
          <button 
            style={styles.createButton}
            onClick={handleCreate}
          >
            + Create New Blog
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{blogs.length}</div>
          <div style={styles.statLabel}>Total Posts</div>
        </div>
        <div style={{...styles.statCard, ...styles.statPublished}}>
          <div style={styles.statNumber}>
            {blogs.filter(b => b.status === 'published').length}
          </div>
          <div style={styles.statLabel}>Published</div>
        </div>
        <div style={{...styles.statCard, ...styles.statDraft}}>
          <div style={styles.statNumber}>
            {blogs.filter(b => b.status === 'draft').length}
          </div>
          <div style={styles.statLabel}>Drafts</div>
        </div>
        <div style={{...styles.statCard, ...styles.statFeatured}}>
          <div style={styles.statNumber}>
            {blogs.filter(b => b.featured).length}
          </div>
          <div style={styles.statLabel}>Featured</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by title, content, tags, or author..."
            defaultValue={searchTerm}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button
              style={styles.clearSearch}
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div style={styles.filterControls}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status:</label>
            <div style={styles.filterTabs}>
              {['all', 'published', 'draft'].map(status => (
                <button
                  key={status}
                  style={{
                    ...styles.filterTab,
                    ...(statusFilter === status && styles.filterTabActive)
                  }}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Sort by:</label>
            <div style={styles.sortButtons}>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortBy === 'createdAt' && styles.sortButtonActive)
                }}
                onClick={() => handleSort('createdAt')}
              >
                Date {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortBy === 'views' && styles.sortButtonActive)
                }}
                onClick={() => handleSort('views')}
              >
                Views {sortBy === 'views' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortBy === 'title' && styles.sortButtonActive)
                }}
                onClick={() => handleSort('title')}
              >
                Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
          
          {(searchTerm || statusFilter !== 'all' || sortBy !== 'createdAt') && (
            <button
              style={styles.resetButton}
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div style={styles.resultsInfo}>
        <span>
          Showing {paginatedBlogs.length} of {filteredBlogs.length} blog posts
          {searchTerm && ` for "${searchTerm}"`}
        </span>
        <span style={styles.pageInfo}>
          Page {currentPage} of {totalPages || 1}
        </span>
      </div>

      {/* Blog List */}
      <div style={styles.blogList}>
        {paginatedBlogs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <h3>No Blog Posts Found</h3>
            <p>Try adjusting your filters or create a new blog post</p>
            <div style={styles.emptyActions}>
              <button 
                style={styles.resetButton}
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
              <button 
                style={styles.createButton}
                onClick={handleCreate}
              >
                + Create New Post
              </button>
            </div>
          </div>
        ) : (
          <>
            {paginatedBlogs.map(blog => (
              <div key={blog.id} style={styles.blogCard}>
                <div style={styles.blogContent}>
                  <div style={styles.blogHeader}>
                    <div style={styles.blogTitleSection}>
                      <h3 style={styles.blogTitle}>{blog.title}</h3>
                      <div style={styles.blogBadges}>
                        {blog.featured && (
                          <span style={styles.featuredBadge}>Featured</span>
                        )}
                        <span style={{
                          ...styles.status,
                          ...(blog.status === 'published' ? styles.statusPublished : styles.statusDraft)
                        }}>
                          {blog.status}
                        </span>
                      </div>
                    </div>
                    <div style={styles.blogActionsMenu}>
                      <button
                        style={styles.viewAction}
                        onClick={() => handleView(blog.id)}
                        title="View post"
                      >
                        👁
                      </button>
                    </div>
                  </div>
                  
                  <p style={styles.blogExcerpt}>{blog.excerpt}</p>
                  
                  <div style={styles.blogMeta}>
                    <div style={styles.blogTags}>
                      <span style={styles.metaLabel}>Tags:</span>
                      {blog.tags.map((tag, index) => (
                        <span key={index} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                    <div style={styles.blogInfo}>
                      <span style={styles.blogAuthor}>By {blog.author}</span>
                      <span style={styles.blogDate}>{formatDate(blog.createdAt)}</span>
                      {blog.readTime && (
                        <span style={styles.readTime}>⏱️ {blog.readTime}</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.blogActions}>
                    <div style={styles.blogStats}>
                      <span style={styles.stat}>👁 {blog.views.toLocaleString()}</span>
                      <span style={styles.stat}>💬 {blog.comments}</span>
                      <span style={styles.stat}>❤️ {blog.likes}</span>
                    </div>
                    
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleEdit(blog.id)}
                      >
                        Edit
                      </button>
                      <button 
                        style={{
                          ...styles.actionButton,
                          ...(blog.status === 'draft' ? styles.publishButton : styles.unpublishButton)
                        }}
                        onClick={() => handlePublish(blog.id)}
                      >
                        {blog.status === 'draft' ? 'Publish' : 'Unpublish'}
                      </button>
                      <button 
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        onClick={() => handleDelete(blog.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button 
                  style={styles.pageButton}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div style={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > totalPages || pageNum < 1) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        style={{
                          ...styles.pageNumber,
                          ...(currentPage === pageNum && styles.pageNumberActive)
                        }}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span style={styles.pageEllipsis}>...</span>
                      <button
                        style={styles.pageNumber}
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button 
                  style={styles.pageButton}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    background: '#f8f9fa',
    minHeight: '100vh',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: '#666'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(0, 123, 255, 0.1)',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '100px auto'
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  retryButton: {
    padding: '10px 24px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '20px',
    transition: 'background 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    margin: '0',
    color: '#1a1a1a',
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#666',
    fontSize: '15px',
    fontWeight: '400'
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)'
    }
  },
  viewButton: {
    padding: '12px 20px',
    background: 'white',
    color: '#333',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#f8f9fa',
      borderColor: '#007bff'
    }
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)'
    }
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  statPublished: {
    borderBottom: '4px solid #28a745'
  },
  statDraft: {
    borderBottom: '4px solid #ffc107'
  },
  statFeatured: {
    borderBottom: '4px solid #6f42c1'
  },
  filters: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px',
    paddingRight: '40px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'border-color 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#007bff',
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)'
    }
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    color: '#666',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      color: '#dc3545'
    }
  },
  filterControls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    alignItems: 'center'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    whiteSpace: 'nowrap'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterTab: {
    padding: '8px 16px',
    border: '2px solid #e9ecef',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    minWidth: '80px',
    textAlign: 'center'
  },
  filterTabActive: {
    background: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  sortButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  sortButton: {
    padding: '8px 16px',
    border: '2px solid #e9ecef',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    minWidth: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px'
  },
  sortButtonActive: {
    background: '#e7f3ff',
    color: '#007bff',
    borderColor: '#007bff'
  },
  resetButton: {
    padding: '8px 16px',
    border: '2px solid #e9ecef',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.3s ease',
    marginLeft: 'auto',
    '&:hover': {
      background: '#f8f9fa',
      borderColor: '#dc3545',
      color: '#dc3545'
    }
  },
  resultsInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    marginBottom: '16px',
    color: '#666',
    fontSize: '14px'
  },
  pageInfo: {
    fontWeight: '600',
    color: '#333'
  },
  blogList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  blogCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid transparent',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      borderLeftColor: '#007bff'
    }
  },
  blogContent: {
    padding: '24px'
  },
  blogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px'
  },
  blogTitleSection: {
    flex: '1',
    minWidth: '0'
  },
  blogTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: '1.4'
  },
  blogBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  featuredBadge: {
    padding: '4px 10px',
    background: 'linear-gradient(135deg, #6f42c1 0%, #4a1fa3 100%)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  status: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusPublished: {
    background: '#d4edda',
    color: '#155724'
  },
  statusDraft: {
    background: '#fff3cd',
    color: '#856404'
  },
  blogActionsMenu: {
    display: 'flex',
    gap: '8px'
  },
  viewAction: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#f8f9fa'
    }
  },
  blogExcerpt: {
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '15px',
    lineHeight: '1.6'
  },
  blogMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  blogTags: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  metaLabel: {
    fontSize: '13px',
    color: '#666',
    fontWeight: '500'
  },
  tag: {
    background: '#e7f3ff',
    color: '#007bff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#cfe2ff'
    }
  },
  blogInfo: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#666',
    alignItems: 'center'
  },
  blogAuthor: {
    fontWeight: '600',
    color: '#333'
  },
  blogDate: {
    color: '#666'
  },
  readTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  blogActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef'
  },
  blogStats: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#666'
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  actionButton: {
    padding: '8px 16px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    minWidth: '80px'
  },
  publishButton: {
    background: '#28a745',
    '&:hover': {
      background: '#218838'
    }
  },
  unpublishButton: {
    background: '#ffc107',
    color: '#212529',
    '&:hover': {
      background: '#e0a800'
    }
  },
  deleteButton: {
    background: '#dc3545',
    '&:hover': {
      background: '#c82333'
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '24px',
    opacity: '0.5'
  },
  emptyActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '24px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e9ecef'
  },
  pageButton: {
    padding: '10px 20px',
    border: '2px solid #e9ecef',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    minWidth: '100px',
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      background: '#f8f9fa',
      borderColor: '#007bff'
    }
  },
  pageNumbers: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  pageNumber: {
    width: '40px',
    height: '40px',
    border: '2px solid #e9ecef',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#f8f9fa',
      borderColor: '#007bff'
    }
  },
  pageNumberActive: {
    background: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  pageEllipsis: {
    padding: '0 8px',
    color: '#666'
  }
};

// Add CSS animations
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  ${Object.keys(styles).map(key => {
    if (styles[key] && typeof styles[key] === 'object') {
      return `.${key} { animation: fadeIn 0.3s ease-out; }`;
    }
    return '';
  }).join('')}
`;
document.head.appendChild(styleElement);

export default BlogList;