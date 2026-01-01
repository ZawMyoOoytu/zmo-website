// pages/blog/BlogListPage.js - CREATE THIS FILE
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogService } from '../../services/api/blogService';
import './BlogListPage.css';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching blogs...');
      const response = await blogService.getAllBlogs();
      
      console.log('✅ Blogs fetched:', response);
      
      if (response && Array.isArray(response.data)) {
        setBlogs(response.data);
      } else if (Array.isArray(response)) {
        setBlogs(response);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setBlogs([]);
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      setError(err.message || 'Failed to load blogs');
      setBlogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs based on search term and status
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle blog deletion
  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      await blogService.deleteBlog(id);
      alert('Blog deleted successfully!');
      fetchBlogs(); // Refresh the list
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog: ' + err.message);
    }
  };

  // Handle blog status change
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      await blogService.updateBlog(id, { status: newStatus });
      alert(`Blog marked as ${newStatus}!`);
      fetchBlogs(); // Refresh the list
    } catch (err) {
      console.error('Error updating blog status:', err);
      alert('Failed to update blog status: ' + err.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="blog-list-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Blog Posts</h1>
          <p className="page-subtitle">
            Manage all your blog posts ({filteredBlogs.length} posts)
          </p>
        </div>
        
        <Link to="/admin/blogs/create" className="btn-create">
          <span>+ Create New Blog</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="blog-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search blogs by title, content, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-group">
          <label>Status: </label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
          <button onClick={fetchBlogs} className="btn-retry">Retry</button>
        </div>
      )}

      {/* Blogs Table */}
      <div className="blogs-table-container">
        {filteredBlogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No blog posts found</h3>
            <p>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first blog post'}
            </p>
            <Link to="/admin/blogs/create" className="btn-create-empty">
              Create Your First Blog
            </Link>
          </div>
        ) : (
          <table className="blogs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id || blog._id}>
                  <td className="title-cell">
                    <div className="blog-title">
                      <strong>{blog.title || 'Untitled'}</strong>
                      {blog.featured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>
                    {blog.excerpt && (
                      <p className="blog-excerpt">{blog.excerpt}</p>
                    )}
                  </td>
                  
                  <td className="author-cell">
                    {blog.author || 'Admin User'}
                  </td>
                  
                  <td className="status-cell">
                    <span className={`status-badge status-${blog.status || 'draft'}`}>
                      {blog.status || 'draft'}
                    </span>
                    <button 
                      onClick={() => handleToggleStatus(blog.id || blog._id, blog.status)}
                      className="btn-status-toggle"
                      title={`Mark as ${blog.status === 'published' ? 'draft' : 'published'}`}
                    >
                      {blog.status === 'published' ? '🔄' : '🚀'}
                    </button>
                  </td>
                  
                  <td className="date-cell">
                    {formatDate(blog.createdAt || blog.created_date)}
                  </td>
                  
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/blogs/edit/${blog.id || blog._id}`)}
                        className="btn-action btn-edit"
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteBlog(blog.id || blog._id)}
                        className="btn-action btn-delete"
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                      
                      <button
                        onClick={() => navigate(`/admin/blogs/${blog.id || blog._id}`)}
                        className="btn-action btn-view"
                        title="View"
                      >
                        👁️ View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Debug Section (Remove in production) */}
      <div className="debug-section">
        <details>
          <summary>Debug Info</summary>
          <pre>
            {JSON.stringify({
              totalBlogs: blogs.length,
              filteredBlogs: filteredBlogs.length,
              searchTerm,
              filterStatus,
              sampleBlog: blogs[0]
            }, null, 2)}
          </pre>
          <button onClick={fetchBlogs} className="btn-refresh">
            🔄 Refresh Data
          </button>
        </details>
      </div>
    </div>
  );
};

export default BlogListPage;