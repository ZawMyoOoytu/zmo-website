// src/components/dashboard/BlogList.js - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  const blogsPerPage = 10;

  // Mock data
  const mockBlogs = [
    {
      id: 1,
      title: 'Getting Started with React',
      excerpt: 'Learn how to build modern web applications with React...',
      category: 'technology',
      tags: ['react', 'javascript', 'webdev'],
      status: 'published',
      featured: true,
      author: 'John Doe',
      views: 1234,
      comments: 42,
      likes: 89,
      createdAt: '2023-10-15',
      updatedAt: '2023-10-20',
    },
    {
      id: 2,
      title: 'Advanced JavaScript Patterns',
      excerpt: 'Explore advanced JavaScript patterns and best practices...',
      category: 'tutorial',
      tags: ['javascript', 'patterns', 'programming'],
      status: 'draft',
      featured: false,
      author: 'Jane Smith',
      views: 0,
      comments: 0,
      likes: 0,
      createdAt: '2023-10-18',
      updatedAt: '2023-10-18',
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBlogs(mockBlogs);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle actions
  const handleEdit = (blogId) => {
    navigate(`/admin/blogs/edit/${blogId}`);
  };

  const handleCreate = () => {
    navigate('/admin/blogs/new');
  };

  const handleViewPublic = () => {
    window.open('/blog', '_blank');
  };

  const handlePublish = (blogId) => {
    setBlogs(blogs.map(blog => 
      blog.id === blogId 
        ? { ...blog, status: blog.status === 'published' ? 'draft' : 'published' }
        : blog
    ));
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading blogs...</p>
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
            style={styles.createButton}
            onClick={handleCreate}
          >
            + Create New Blog
          </button>
          <button 
            style={styles.viewButton}
            onClick={handleViewPublic}
          >
            👁 View Public Blog
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
          <div style={styles.statNumber}>{blogs.filter(b => b.status === 'published').length}</div>
          <div style={styles.statLabel}>Published</div>
        </div>
        <div style={{...styles.statCard, ...styles.statDraft}}>
          <div style={styles.statNumber}>{blogs.filter(b => b.status === 'draft').length}</div>
          <div style={styles.statLabel}>Drafts</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterTabs}>
          <button 
            style={{
              ...styles.filterTab,
              ...(statusFilter === 'all' && styles.filterTabActive)
            }}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button 
            style={{
              ...styles.filterTab,
              ...(statusFilter === 'published' && styles.filterTabActive)
            }}
            onClick={() => setStatusFilter('published')}
          >
            Published
          </button>
          <button 
            style={{
              ...styles.filterTab,
              ...(statusFilter === 'draft' && styles.filterTabActive)
            }}
            onClick={() => setStatusFilter('draft')}
          >
            Draft
          </button>
        </div>
      </div>

      {/* Blog List */}
      <div style={styles.blogList}>
        {currentBlogs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <h3>No Blog Posts Found</h3>
            <p>Try adjusting your filters or create a new blog post</p>
            <button 
              style={styles.createButton}
              onClick={handleCreate}
            >
              + Create Your First Post
            </button>
          </div>
        ) : (
          <>
            {currentBlogs.map(blog => (
              <div key={blog.id} style={styles.blogCard}>
                <div style={styles.blogContent}>
                  <div style={styles.blogHeader}>
                    <h3 style={styles.blogTitle}>{blog.title}</h3>
                    <span style={{
                      ...styles.status,
                      ...(blog.status === 'published' ? styles.statusPublished : styles.statusDraft)
                    }}>
                      {blog.status}
                    </span>
                  </div>
                  
                  <p style={styles.blogExcerpt}>{blog.excerpt}</p>
                  
                  <div style={styles.blogMeta}>
                    <div style={styles.blogTags}>
                      {blog.tags.map((tag, index) => (
                        <span key={index} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                    <div style={styles.blogInfo}>
                      <span style={styles.blogAuthor}>By {blog.author}</span>
                      <span style={styles.blogDate}>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div style={styles.blogActions}>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleEdit(blog.id)}
                    >
                      Edit
                    </button>
                    <button 
                      style={{
                        ...styles.actionButton,
                        ...styles.publishButton
                      }}
                      onClick={() => handlePublish(blog.id)}
                    >
                      {blog.status === 'draft' ? 'Publish' : 'Unpublish'}
                    </button>
                    <div style={styles.blogStats}>
                      <span style={styles.stat}>👁 {blog.views}</span>
                      <span style={styles.stat}>💬 {blog.comments}</span>
                      <span style={styles.stat}>❤️ {blog.likes}</span>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      style={{
                        ...styles.pageNumber,
                        ...(currentPage === page && styles.pageNumberActive)
                      }}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
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
    padding: '20px',
    background: '#f8f9fa',
    minHeight: '100vh'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    margin: '0',
    color: '#333',
    fontSize: '28px',
    fontWeight: '600'
  },
  subtitle: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  createButton: {
    padding: '10px 20px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  viewButton: {
    padding: '10px 20px',
    background: '#e9ecef',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  stats: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minWidth: '120px',
    textAlign: 'center',
    flex: '1'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666'
  },
  statPublished: {
    borderLeft: '4px solid #28a745'
  },
  statDraft: {
    borderLeft: '4px solid #ffc107'
  },
  filters: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  searchContainer: {
    flex: '1',
    minWidth: '200px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  filterTabs: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterTab: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  filterTabActive: {
    background: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  blogList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  blogCard: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  blogContent: {
    padding: '20px'
  },
  blogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  blogTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    flex: '1'
  },
  status: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '10px'
  },
  statusPublished: {
    background: '#d4edda',
    color: '#155724'
  },
  statusDraft: {
    background: '#fff3cd',
    color: '#856404'
  },
  blogExcerpt: {
    margin: '0 0 15px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  blogMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  blogTags: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap'
  },
  tag: {
    background: '#e9ecef',
    color: '#495057',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  blogInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '13px',
    color: '#666'
  },
  blogActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  actionButton: {
    padding: '6px 12px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.3s ease'
  },
  publishButton: {
    background: '#28a745'
  },
  blogStats: {
    display: 'flex',
    gap: '15px',
    fontSize: '13px',
    color: '#666'
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
  },
  pageButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  pageNumbers: {
    display: 'flex',
    gap: '5px'
  },
  pageNumber: {
    width: '36px',
    height: '36px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  pageNumberActive: {
    background: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  }
};

// Add spin animation
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinStyle);

export default BlogList;