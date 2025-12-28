// src/components/dashboard/BlogManager.js
import React, { useState, useEffect } from 'react';
import BlogForm from '../../Components/forms/BlogForm'; // Adjust path if needed
import { blogService } from '../../services/blogService';
import './BlogManager.css';

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs();
      
      if (response.success) {
        setBlogs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ CRITICAL: HOW TO CALL BLOGFORM ============

  // 1. CREATE NEW BLOG FUNCTION - This is passed to BlogForm's onSubmit
  const handleCreateBlog = async (formData) => {
    console.log('🚀 handleCreateBlog called with:', formData);
    
    try {
      setLoading(true);
      setFormError('');
      
      // Format the data for your API
      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        readTime: formData.readTime,
        tags: formData.tags,
        status: formData.status,
        featured: formData.featured,
        imageUrl: formData.imageUrl || formData.imagePreview || '',
        // Add any other required fields
        publishedAt: formData.status === 'published' ? new Date().toISOString() : null
      };
      
      console.log('📤 Sending to API:', blogData);
      
      // Call your API service
      const response = await blogService.createBlog(blogData);
      console.log('📝 API Response:', response);
      
      if (response && response.success) {
        // Add new blog to state
        setBlogs(prev => [response.data, ...prev]);
        
        // Close the form
        setShowForm(false);
        
        // Show success message
        setSuccessMessage('✅ Blog created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh the list
        await fetchBlogs();
      } else {
        throw new Error(response?.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('❌ Error creating blog:', error);
      setFormError(error.message || 'Failed to create blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. EDIT EXISTING BLOG FUNCTION
  const handleEditBlog = async (formData) => {
    console.log('✏️ handleEditBlog called for:', editingBlog?._id);
    
    try {
      setLoading(true);
      setFormError('');
      
      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        readTime: formData.readTime,
        tags: formData.tags,
        status: formData.status,
        featured: formData.featured,
        imageUrl: formData.imageUrl || formData.imagePreview || '',
        updatedAt: new Date().toISOString()
      };
      
      const response = await blogService.updateBlog(editingBlog._id, blogData);
      
      if (response && response.success) {
        // Update blog in state
        setBlogs(prev => prev.map(blog => 
          blog._id === editingBlog._id ? response.data : blog
        ));
        
        // Close the form
        setShowForm(false);
        setEditingBlog(null);
        
        // Show success message
        setSuccessMessage('✅ Blog updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response?.error || 'Failed to update blog');
      }
    } catch (error) {
      console.error('❌ Error updating blog:', error);
      setFormError(error.message || 'Failed to update blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. OPEN CREATE FORM
  const handleCreateClick = () => {
    console.log('➕ Opening create form...');
    
    // Clear any previous editing data
    setEditingBlog(null);
    
    // Show the form
    setShowForm(true);
    
    // Clear any previous errors/messages
    setFormError('');
    setSuccessMessage('');
  };

  // 4. OPEN EDIT FORM
  const handleEditClick = (blog) => {
    console.log('✏️ Opening edit form for:', blog._id);
    
    // Set the blog to edit
    setEditingBlog(blog);
    
    // Show the form
    setShowForm(true);
    
    // Clear messages
    setFormError('');
    setSuccessMessage('');
  };

  // 5. CLOSE/CANCEL FORM
  const handleCancelForm = () => {
    console.log('❌ Closing form...');
    
    // Check if there are unsaved changes
    if (editingBlog && window.confirm('Are you sure? Unsaved changes will be lost.')) {
      setShowForm(false);
      setEditingBlog(null);
    } else if (!editingBlog) {
      // For create mode
      setShowForm(false);
    }
  };

  // 6. DELETE BLOG
  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        setLoading(true);
        const response = await blogService.deleteBlog(blogId);
        
        if (response.success) {
          setBlogs(prev => prev.filter(blog => blog._id !== blogId));
          setSuccessMessage('✅ Blog deleted successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
        setFormError('Failed to delete blog: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // ============ RENDERING ============

  return (
    <div className="blog-manager">
      {/* Header */}
      <div className="blog-header">
        <h1>📝 Blog Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateClick}
            disabled={loading}
          >
            + Create New Blog
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      {formError && (
        <div className="alert alert-error">
          {formError}
        </div>
      )}

      {/* BLOGFORM MODAL - CRITICAL PART */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div 
            className="modal-backdrop"
            onClick={handleCancelForm}
          />
          
          {/* Modal Container */}
          <div className="modal-container">
            <button 
              className="modal-close-btn"
              onClick={handleCancelForm}
            >
              ×
            </button>
            
            {/* RENDER BLOGFORM COMPONENT HERE */}
            <BlogForm
              key={editingBlog?._id || 'create'} // Important for re-rendering
              blog={editingBlog} // Pass blog for edit mode, null for create
              onSubmit={editingBlog ? handleEditBlog : handleCreateBlog} // Pass correct handler
              onCancel={handleCancelForm} // Pass cancel handler
              loading={loading} // Pass loading state
              // You can also pass initialData for create mode if needed:
              initialData={{
                title: '',
                content: '',
                author: 'Admin',
                status: 'draft',
                featured: false,
                // ... other default values
              }}
            />
          </div>
        </>
      )}

      {/* Blog List Table */}
      <div className="blog-list">
        {loading && blogs.length === 0 ? (
          <div className="loading">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <p>No blogs found.</p>
            <button onClick={handleCreateClick} className="btn btn-primary">
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
              {blogs.map(blog => (
                <tr key={blog._id}>
                  <td>
                    <strong>{blog.title}</strong>
                    <div className="blog-excerpt">
                      {blog.excerpt?.substring(0, 100)}...
                    </div>
                  </td>
                  <td>{blog.author}</td>
                  <td>
                    <span className={`status-badge status-${blog.status}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td>
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEditClick(blog)}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteBlog(blog._id)}
                      title="Delete"
                    >
                      Delete
                    </button>
                    {blog.status === 'published' && (
                      <button 
                        className="btn-action btn-view"
                        onClick={() => window.open(`/blog/${blog._id}`, '_blank')}
                        title="View"
                      >
                        View
                      </button>
                    )}
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

export default BlogManager;