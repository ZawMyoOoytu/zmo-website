// src/pages/blog/BlogManagementPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogManagementPage.css';

const BlogManagementPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      
      const data = await response.json();
      
      // Handle different response formats
      let blogsData = [];
      if (data.status === 'success' && data.data && data.data.blogs) {
        blogsData = data.data.blogs;
      } else if (Array.isArray(data)) {
        blogsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        blogsData = data.data;
      }
      
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Use mock data as fallback
      setBlogs(getMockBlogs());
    } finally {
      setLoading(false);
    }
  };

  const getMockBlogs = () => [
    {
      _id: '1',
      title: 'Getting Started with React on Render',
      author: 'Admin User',
      status: 'published',
      createdAt: '2024-01-15T17:00:00.000Z',
      excerpt: 'Learn how to deploy React applications on Render',
      featured: true
    },
    {
      _id: '2',
      title: 'Building Admin Panels',
      author: 'Admin User',
      status: 'draft',
      createdAt: '2024-01-16T10:30:00.000Z',
      excerpt: 'Complete guide to admin panel development',
      featured: false
    }
  ];

  const handleStatusToggle = async (blogId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    if (!window.confirm(`Change status from ${currentStatus} to ${newStatus}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setBlogs(prev => prev.map(blog =>
          blog._id === blogId ? { ...blog, status: newStatus } : blog
        ));
        alert(`Status changed to ${newStatus}!`);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBlogs(prev => prev.filter(blog => blog._id !== blogId));
        alert('Blog deleted successfully!');
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog: ' + error.message);
    }
  };

  const handleEdit = (blogId) => {
    navigate(`/admin/blogs/edit/${blogId}`);
  };

  const handleCreate = () => {
    navigate('/admin/blogs/create');
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="blog-management-page">
      <div className="page-header">
        <h1>📝 Blog Management</h1>
        <button 
          className="btn-create"
          onClick={handleCreate}
        >
          + Create New Blog
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>
        
        <div className="status-filters">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'published' ? 'active' : ''}`}
            onClick={() => setFilterStatus('published')}
          >
            Published
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'draft' ? 'active' : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Drafts
          </button>
        </div>
      </div>

      <div className="blogs-table">
        {filteredBlogs.length === 0 ? (
          <div className="empty-state">
            <p>No blogs found</p>
            <button onClick={handleCreate} className="btn-create">
              Create Your First Blog
            </button>
          </div>
        ) : (
          <table>
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
                    <div className="blog-title">{blog.title}</div>
                    <div className="blog-excerpt">{blog.excerpt}</div>
                  </td>
                  <td>{blog.author}</td>
                  <td>
                    <button
                      onClick={() => handleStatusToggle(blog._id, blog.status)}
                      className={`status-btn status-${blog.status}`}
                    >
                      {blog.status === 'published' ? '✅ Published' : '📝 Draft'}
                    </button>
                  </td>
                  <td>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(blog._id)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BlogManagementPage;