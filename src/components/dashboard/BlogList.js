// Update src/components/dashboard/BlogList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching blogs from API...');
      const response = await fetch('/api/blogs');
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📡 API Response data:', data);
      
      // Handle different response formats
      let blogsData = [];
      
      if (Array.isArray(data)) {
        // If API returns array directly
        blogsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        // If API returns { data: [] }
        blogsData = data.data;
      } else if (data.blogs && Array.isArray(data.blogs)) {
        // If API returns { blogs: [] }
        blogsData = data.blogs;
      } else if (data.success && Array.isArray(data.data)) {
        // If API returns { success: true, data: [] }
        blogsData = data.data;
      }
      
      console.log(`✅ Loaded ${blogsData.length} blogs`);
      setBlogs(blogsData);
      
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      setError(err.message);
      
      // Fallback to mock data for testing
      console.log('🔄 Using mock data as fallback');
      setBlogs(getMockBlogs());
    } finally {
      setLoading(false);
    }
  };

  // Mock data function as fallback
  const getMockBlogs = () => [
    {
      _id: '1',
      title: 'Getting Started with React on Render',
      author: 'Admin User',
      status: 'published',
      createdAt: '2024-01-15T17:00:00.000Z',
      excerpt: 'Learn how to deploy React applications on Render',
      tags: ['react', 'render', 'deployment'],
      featured: true
    },
    {
      _id: '2',
      title: 'Building Admin Panels with React',
      author: 'Admin User',
      status: 'published',
      createdAt: '2024-01-16T10:30:00.000Z',
      excerpt: 'Complete guide to building modern admin panels',
      tags: ['react', 'admin', 'dashboard'],
      featured: false
    }
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleCreateBlog = () => {
    navigate('/admin/blogs/create');
  };

  const handleEditBlog = (id) => {
    navigate(`/admin/blogs/edit/${id}`);
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting blog:', id);
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('✅ Blog deleted successfully!');
        fetchBlogs(); // Refresh the list
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (err) {
      console.error('❌ Error deleting blog:', err);
      alert('❌ Failed to delete blog: ' + err.message);
    }
  };

  const handleViewBlog = (id) => {
    window.open(`/blog/${id}`, '_blank');
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    draft: blogs.filter(b => b.status === 'draft').length,
    featured: blogs.filter(b => b.featured).length
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-list-loading">
        <div className="spinner"></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      {/* Header Section */}
      <div className="blog-list-header">
        <div className="header-left">
          <h1>📝 Blog Posts</h1>
          <p className="subtitle">Manage your blog posts and content</p>
        </div>
        <div className="header-right">
          <button 
            className="btn-create-blog"
            onClick={handleCreateBlog}
          >
            <span className="btn-icon">+</span>
            Create New Blog
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" style={{
          padding: '16px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px',
          marginBottom: '20px',
          color: '#cf1322'
        }}>
          <strong>⚠️ Connection Error:</strong> {error}
          <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
            Using demo data. Make sure your backend is running at /api/blogs
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="blog-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.published}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.draft}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.featured}</div>
          <div className="stat-label">Featured</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="blog-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search blogs by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({blogs.length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => setStatusFilter('published')}
          >
            Published ({stats.published})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => setStatusFilter('draft')}
          >
            Drafts ({stats.draft})
          </button>
        </div>
      </div>

      {/* Blog Table */}
      <div className="blog-table-container">
        {filteredBlogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No blog posts found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first blog post to get started'
              }
            </p>
            <button 
              className="btn-create-empty"
              onClick={handleCreateBlog}
            >
              Create Your First Blog
            </button>
          </div>
        ) : (
          <table className="blog-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map(blog => (
                <tr key={blog._id || blog.id}>
                  <td className="title-cell">
                    <div className="blog-title-row">
                      <strong>{blog.title || 'Untitled'}</strong>
                      {blog.featured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>
                    <p className="blog-excerpt">{blog.excerpt || 'No description'}</p>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="blog-tags">
                        {blog.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="author-cell">
                    <span className="author-name">{blog.author || 'Unknown'}</span>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge status-${blog.status || 'draft'}`}>
                      {blog.status || 'draft'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatDate(blog.createdAt || blog.created_date)}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditBlog(blog._id || blog.id)}
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteBlog(blog._id || blog.id)}
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                      {blog.status === 'published' && (
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewBlog(blog._id || blog.id)}
                          title="View"
                        >
                          👁️ View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Debug Info */}
      <div className="debug-info">
        <details>
          <summary>Debug Information</summary>
          <div className="debug-content">
            <p><strong>API Status:</strong> {error ? '❌ ' + error : '✅ Connected'}</p>
            <p><strong>Total Blogs:</strong> {blogs.length}</p>
            <p><strong>Filtered:</strong> {filteredBlogs.length}</p>
            <p><strong>Search Term:</strong> "{searchTerm}"</p>
            <p><strong>Status Filter:</strong> {statusFilter}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                onClick={fetchBlogs}
                className="btn-refresh"
              >
                🔄 Refresh Data
              </button>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/blogs');
                    const data = await response.json();
                    console.log('Raw API Response:', data);
                    alert(`API returned: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
                  } catch (err) {
                    alert('API Error: ' + err.message);
                  }
                }}
                className="btn-refresh"
                style={{ background: '#722ed1' }}
              >
                🔍 Test API
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default BlogList;