// src/components/dashboard/BlogsManager.js
import React, { useState, useEffect } from 'react';
import BlogForm from '../forms/BlogForm';
import { blogAPI } from '../../services/api';
import './BlogsManager.css'; // Optional: for styling

const BlogsManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching blogs from API...');
      
      const response = await blogAPI.getAll();
      console.log('📦 API Response:', response);
      
      // Handle different response formats
      if (response && response.success) {
        // Format 1: { success: true, data: { blogs: [] } }
        const blogsData = response.data?.blogs || response.blogs || response.data;
        if (Array.isArray(blogsData)) {
          setBlogs(blogsData);
          console.log(`✅ Loaded ${blogsData.length} blogs`);
        } else {
          console.error('❌ Expected array but got:', typeof blogsData, blogsData);
          setBlogs([]);
          setError('Invalid data format received from server');
        }
      } else if (Array.isArray(response)) {
        // Format 2: Direct array response
        setBlogs(response);
        console.log(`✅ Loaded ${response.length} blogs (direct array)`);
      } else {
        console.error('❌ Unexpected response format:', response);
        setBlogs([]);
        setError('Unexpected response format from server');
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      setError(err.message || 'Failed to load blogs. Please check your connection.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAdd = () => {
    setEditingBlog(null);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting blog:', id);
      
      await blogAPI.delete(id);
      
      // Update local state
      setBlogs(prevBlogs => prevBlogs.filter(b => b._id !== id && b.id !== id));
      setSuccess('Blog deleted successfully');
      
      console.log('✅ Blog deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting blog:', err);
      setError(err.message || 'Failed to delete blog');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('💾 Saving blog:', editingBlog ? 'Editing' : 'Creating', formData);

      let result;
      if (editingBlog) {
        const id = editingBlog._id || editingBlog.id;
        result = await blogAPI.update(id, formData);
      } else {
        result = await blogAPI.create(formData);
      }

      console.log('✅ Save result:', result);

      if (result && result.success) {
        setSuccess(editingBlog ? 'Blog updated successfully' : 'Blog created successfully');
        setShowForm(false);
        setEditingBlog(null);
        
        // Refresh the list
        await fetchBlogs();
      } else {
        throw new Error(result?.message || 'Failed to save blog');
      }
    } catch (err) {
      console.error('❌ Error saving blog:', err);
      setError(err.message || 'Failed to save blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBlog(null);
    setError(null);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading && blogs.length === 0) {
    return (
      <div className="blogs-manager loading">
        <div className="loading-spinner">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="blogs-manager">
      <div className="blogs-header">
        <h2>Blog Management</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleAdd}
          disabled={loading}
        >
          + Add New Blog
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {/* Blog Form Modal */}
      {showForm && (
        <BlogForm
          blog={editingBlog}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      {/* Blogs List */}
      <div className="blogs-content">
        <div className="blogs-stats">
          <h3>Blog Posts ({blogs.length})</h3>
          {loading && <div className="loading-small">Refreshing...</div>}
        </div>

        {blogs.length === 0 ? (
          <div className="empty-state">
            <p>No blog posts found.</p>
            <button onClick={handleAdd} className="btn btn-primary">
              Create Your First Blog
            </button>
          </div>
        ) : (
          <div className="blogs-list">
            {blogs.map(blog => (
              <div key={blog._id || blog.id} className="blog-card">
                <div className="blog-header">
                  <h4 className="blog-title">{blog.title || 'Untitled'}</h4>
                  <span className={`blog-status ${blog.status || 'draft'}`}>
                    {blog.status || 'draft'}
                  </span>
                </div>
                
                <p className="blog-excerpt">
                  {blog.excerpt || blog.content?.substring(0, 100) || 'No content'}...
                </p>
                
                <div className="blog-meta">
                  <span className="blog-author">
                    By: {blog.author || 'Unknown'}
                  </span>
                  <span className="blog-date">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                  {blog.views !== undefined && (
                    <span className="blog-views">
                      👁️ {blog.views} views
                    </span>
                  )}
                </div>

                <div className="blog-actions">
                  <button 
                    onClick={() => handleEdit(blog)}
                    className="btn btn-edit"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(blog._id || blog.id)}
                    className="btn btn-delete"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsManager;