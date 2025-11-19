// admin-panel/src/pages/Blogs/BlogList.js - DEBUG VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ApiDebugger from '../../components/common/ApiDebugger';
import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDebug, setShowDebug] = useState(true); // Always show debug initially

  // Fetch ALL blogs for admin (including unpublished)
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Admin: Fetching ALL blogs...');
      
      const result = await blogAPI.getAll();
      console.log('📊 Admin Blog API response:', result);
      
      if (result.success) {
        const blogsData = result.blogs || result.data || [];
        console.log(`✅ Admin: Loaded ${blogsData.length} blogs (including drafts)`);
        
        setBlogs(blogsData);
        setFilteredBlogs(blogsData);
        
        // Debug: Log all blogs
        blogsData.forEach((blog, index) => {
          console.log(`📝 Admin Blog ${index + 1}:`, {
            id: blog._id,
            title: blog.title,
            published: blog.published,
            createdAt: blog.createdAt,
            author: blog.author
          });
        });
      } else {
        throw new Error(result.message || 'Failed to load blogs');
      }
    } catch (error) {
      console.error('❌ Admin Blog fetch error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      setError(error.message || 'Failed to load blog posts');
      setBlogs([]);
      setFilteredBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function
  const refreshBlogs = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchBlogs();
  }, [refreshTrigger]);

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
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="admin-blog-list">
        <div className="container-fluid">
          <div className="admin-page-header">
            <h1>Blog Management</h1>
            <p>Manage your blog posts</p>
          </div>
          <LoadingSpinner message="Loading blogs..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-blog-list">
      <div className="container-fluid">
        {/* Page Header */}
        <div className="admin-page-header">
          <div className="header-content">
            <div>
              <h1>Blog Management</h1>
              <p>Create, edit, and manage your blog posts</p>
            </div>
            <div className="header-actions">
              <button 
                onClick={() => setShowDebug(!showDebug)}
                className="btn btn-outline-warning btn-sm"
              >
                {showDebug ? 'Hide' : 'Show'} Debug
              </button>
              <button 
                onClick={refreshBlogs}
                className="btn btn-outline-secondary btn-sm"
                title="Refresh blog list"
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
              <Link to="/blogs/create" className="btn btn-primary">
                <i className="fas fa-plus"></i> Create New Blog
              </Link>
            </div>
          </div>
        </div>

        {/* API Debugger */}
        {showDebug && <ApiDebugger />}

        {/* Debug Info */}
        <div className="debug-info">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>📊 Blog Statistics:</strong> 
              <span className="ms-3">Total: {blogs.length}</span>
              <span className="ms-2 text-success">Published: {blogs.filter(b => b.published).length}</span>
              <span className="ms-2 text-warning">Drafts: {blogs.filter(b => !b.published).length}</span>
            </div>
            <div>
              <span className="text-muted me-3">Last updated: {new Date().toLocaleTimeString()}</span>
              <button 
                onClick={() => console.log('🔍 All blogs:', blogs)}
                className="btn btn-sm btn-outline-info"
              >
                <i className="fas fa-bug"></i> Console Log
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Error Loading Blogs:</strong> {error}
              </div>
              <button onClick={refreshBlogs} className="btn btn-sm btn-outline-danger">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="search-box-admin">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search blogs by title, content, tags, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                  />
                  {searchTerm && (
                    <button 
                      onClick={handleClearSearch}
                      className="btn btn-sm btn-outline-secondary ms-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-4 text-end">
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${filteredBlogs.length === blogs.length ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSearchTerm('')}
                  >
                    All ({blogs.length})
                  </button>
                  <button
                    className={`btn btn-sm ${searchTerm === 'published' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setSearchTerm('published')}
                  >
                    Published ({blogs.filter(b => b.published).length})
                  </button>
                  <button
                    className={`btn btn-sm ${searchTerm === 'draft' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setSearchTerm('draft')}
                  >
                    Drafts ({blogs.filter(b => !b.published).length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Table */}
        {filteredBlogs.length > 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
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
                    {filteredBlogs.map(blog => (
                      <tr key={blog._id}>
                        <td>
                          <div>
                            <strong>{blog.title || 'Untitled Blog'}</strong>
                            {blog.tags && blog.tags.length > 0 && (
                              <div className="text-muted small mt-1">
                                Tags: {blog.tags.slice(0, 3).join(', ')}
                                {blog.tags.length > 3 && ` +${blog.tags.length - 3} more`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{blog.author || 'Admin'}</td>
                        <td>
                          {blog.published ? (
                            <span className="badge bg-success">Published</span>
                          ) : (
                            <span className="badge bg-warning">Draft</span>
                          )}
                        </td>
                        <td>{formatDate(blog.createdAt)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/blogs/edit/${blog._id}`}
                              className="btn btn-primary"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <Link
                              to={`/blogs/view/${blog._id}`}
                              className="btn btn-info"
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="text-muted">
                <i className="fas fa-newspaper fa-3x mb-3"></i>
                <h4>No blogs found</h4>
                <p>
                  {searchTerm 
                    ? 'No blogs match your search criteria.' 
                    : 'No blogs have been created yet.'}
                </p>
                <p className="text-danger small mt-3">
                  <strong>Debug Info:</strong> Check the API Debugger above to see what's happening with the API calls.
                </p>
                <Link to="/blogs/create" className="btn btn-primary mt-2">
                  <i className="fas fa-plus"></i> Create Your First Blog
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;