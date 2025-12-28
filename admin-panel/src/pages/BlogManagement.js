import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../components/forms/BlogForm';
import Table from '../components/common/Table';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { blogService } from '../../services/blogService';
import './BlogManagement.css';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const navigate = useNavigate();

  // Enhanced debug logging
  useEffect(() => {
    console.log('🔍 BLOG MANAGEMENT DEBUG:');
    console.log('   showForm:', showForm);
    console.log('   editingBlog:', editingBlog ? editingBlog._id : 'null');
    console.log('   blogs count:', blogs.length);
  }, [showForm, editingBlog, blogs.length]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs();
      console.log('📡 Fetch Blogs Response:', response);
      
      if (response.success) {
        setBlogs(response.data || []);
        console.log(`✅ Loaded ${response.data?.length || 0} blogs`);
      } else {
        console.error('❌ Failed to fetch blogs:', response.error);
        setBlogs([]);
      }
    } catch (error) {
      console.error('💥 Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async (blogData) => {
    try {
      console.log('📝 Creating blog:', blogData);
      const response = await blogService.createBlog(blogData);
      
      console.log('📝 Create Response:', response);
      
      if (response.success) {
        setBlogs(prev => [response.data, ...prev]);
        setShowForm(false);
        alert('✅ Blog created successfully!');
      } else {
        alert('❌ Error creating blog: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Error creating blog:', error);
      alert('❌ Error creating blog: ' + error.message);
    }
  };

  const handleEditBlog = async (blogData) => {
    try {
      console.log('✏️ Updating blog:', editingBlog._id, blogData);
      const response = await blogService.updateBlog(editingBlog._id, blogData);
      
      console.log('✏️ Update Response:', response);
      
      if (response.success) {
        setBlogs(prev => prev.map(blog => 
          blog._id === editingBlog._id ? response.data : blog
        ));
        setShowForm(false);
        setEditingBlog(null);
        alert('✅ Blog updated successfully!');
      } else {
        alert('❌ Error updating blog: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Error updating blog:', error);
      alert('❌ Error updating blog: ' + error.message);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await blogService.deleteBlog(blogId);
        if (response.success) {
          setBlogs(prev => prev.filter(blog => blog._id !== blogId));
          alert('✅ Blog deleted successfully!');
        } else {
          alert('❌ Error deleting blog: ' + (response.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Error deleting blog: ' + error.message);
      }
    }
  };

  const handleEditClick = (blog) => {
    console.log('✏️ Edit button clicked for blog:', blog._id);
    setEditingBlog(blog);
    setShowForm(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCreateClick = () => {
    console.log('➕ Create button clicked');
    setEditingBlog(null); // Clear any existing edit data
    setShowForm(true);
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  };

  const handleCancelForm = () => {
    console.log('❌ Cancelling form');
    const confirmCancel = window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.');
    if (confirmCancel) {
      setShowForm(false);
      setEditingBlog(null);
      document.body.style.overflow = 'auto'; // Restore body scroll
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      console.log('🔙 Backdrop clicked');
      handleCancelForm();
    }
  };

  const navigateToCreatePage = () => {
    console.log('🚀 Navigating to create page');
    navigate('/admin/blogs/create');
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const tableColumns = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = filteredBlogs.map(blog => ({
    ...blog,
    title: (
      <div className="blog-title-cell">
        <div className="blog-title">{blog.title || 'Untitled'}</div>
        {blog.tags && blog.tags.length > 0 && (
          <div className="blog-tags">
            {blog.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {blog.tags.length > 3 && (
              <span className="tag-more">+{blog.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    ),
    status: (
      <span className={`status status-${blog.status || 'draft'}`}>
        {blog.status ? blog.status.charAt(0).toUpperCase() + blog.status.slice(1) : 'Draft'}
      </span>
    ),
    createdAt: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Unknown',
    actions: (
      <div className="action-buttons">
        <button 
          className="action-btn edit" 
          onClick={() => handleEditClick(blog)}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
        </button>
        <button 
          className="action-btn delete" 
          onClick={() => handleDeleteBlog(blog._id)}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
        {blog.status === 'published' && (
          <button 
            className="action-btn view" 
            onClick={() => window.open(`/blog/${blog._id}`, '_blank')}
            title="View"
          >
            <i className="fas fa-external-link-alt"></i>
          </button>
        )}
      </div>
    )
  }));

  if (loading && blogs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="blog-management">
      <div className="page-header">
        <h1>📝 Blog Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateClick}
          >
            <i className="fas fa-plus"></i> Create New Blog Post
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={navigateToCreatePage}
          >
            <i className="fas fa-external-link-alt"></i> Open in New Page
          </button>
          
          <button 
            onClick={() => {
              console.log('🐛 DEBUG:', {
                showForm,
                editingBlog: editingBlog?._id || 'null',
                blogsCount: blogs.length,
                filteredCount: filteredBlogs.length
              });
            }}
            className="btn btn-debug"
          >
            🐛 Debug Info
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="filters">
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search blogs by title, content, or tags..."
          />
          
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({blogs.length})
            </button>
            <button 
              className={`filter-tab ${statusFilter === 'published' ? 'active' : ''}`}
              onClick={() => setStatusFilter('published')}
            >
              Published ({blogs.filter(b => b.status === 'published').length})
            </button>
            <button 
              className={`filter-tab ${statusFilter === 'draft' ? 'active' : ''}`}
              onClick={() => setStatusFilter('draft')}
            >
              Drafts ({blogs.filter(b => b.status === 'draft').length})
            </button>
            <button 
              className={`filter-tab ${statusFilter === 'archived' ? 'active' : ''}`}
              onClick={() => setStatusFilter('archived')}
            >
              Archived ({blogs.filter(b => b.status === 'archived').length})
            </button>
          </div>
        </div>

        <Table 
          columns={tableColumns}
          data={tableData}
          emptyMessage={
            <div className="empty-state">
              <p>No blog posts found.</p>
              {searchTerm ? (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateClick}
                >
                  Create Your First Blog
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* Blog Form Modal - FIXED VERSION */}
      {showForm && (
        <>
          <div 
            className="modal-backdrop"
            onClick={handleBackdropClick}
          />
          
          <div className="modal-container" role="dialog" aria-modal="true">
            <button 
              className="modal-close-btn"
              onClick={handleCancelForm}
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div className="modal-header">
              <h2>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
              <p className="modal-subtitle">
                {editingBlog ? 'Update your blog post details' : 'Fill in the details to create a new blog post'}
              </p>
            </div>
            
            <div className="modal-content">
              <BlogForm
                key={editingBlog?._id || 'create'} // Force re-render when switching between create/edit
                blog={editingBlog}
                onSubmit={editingBlog ? handleEditBlog : handleCreateBlog}
                onCancel={handleCancelForm}
                loading={false}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogManagement;