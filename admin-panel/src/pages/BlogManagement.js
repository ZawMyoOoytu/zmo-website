import React, { useState, useEffect } from 'react';
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

  // Debug state changes
  useEffect(() => {
    console.log('🔍 BLOG MANAGEMENT DEBUG:');
    console.log('   showForm:', showForm);
    console.log('   editingBlog:', editingBlog);
  }, [showForm, editingBlog]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs();
      if (response.success) {
        setBlogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async (blogData) => {
    try {
      console.log('📝 Creating blog:', blogData);
      const response = await blogService.createBlog(blogData);
      
      if (response.success) {
        setBlogs(prev => [response.data, ...prev]);
        setShowForm(false);
        alert('Blog created successfully!');
      } else {
        alert('Error creating blog: ' + response.error);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Error creating blog: ' + error.message);
    }
  };

  const handleEditBlog = async (blogData) => {
    try {
      const response = await blogService.updateBlog(editingBlog._id, blogData);
      
      if (response.success) {
        setBlogs(prev => prev.map(blog => 
          blog._id === editingBlog._id ? response.data : blog
        ));
        setShowForm(false);
        setEditingBlog(null);
        alert('Blog updated successfully!');
      } else {
        alert('Error updating blog: ' + response.error);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Error updating blog: ' + error.message);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await blogService.deleteBlog(blogId);
        if (response.success) {
          setBlogs(prev => prev.filter(blog => blog._id !== blogId));
          alert('Blog deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Error deleting blog: ' + error.message);
      }
    }
  };

  const handleEditClick = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div>
        <div className="blog-title">{blog.title}</div>
        <div className="blog-tags">
          {blog.tags && blog.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    ),
    status: (
      <span className={`status ${blog.status}`}>
        {blog.status ? blog.status.charAt(0).toUpperCase() + blog.status.slice(1) : 'Draft'}
      </span>
    ),
    createdAt: new Date(blog.createdAt).toLocaleDateString(),
    actions: (
      <div className="actions">
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
      </div>
    )
  }));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="blog-management">
      <div className="page-header">
        <h1>Blog Management</h1>
        <div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              console.log('🔄 Create button clicked - setting showForm to true');
              setShowForm(true);
            }}
          >
            <i className="fas fa-plus"></i> Create New Blog Post
          </button>
          
          {/* Debug Button */}
          <button 
            onClick={() => {
              console.log('🐛 DEBUG: Current showForm =', showForm);
              console.log('🐛 DEBUG: Setting showForm to true');
              setShowForm(true);
            }}
            style={{
              marginLeft: '10px',
              padding: '10px',
              background: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            🐛 Debug ShowForm
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
          </div>
        </div>

        <Table 
          columns={tableColumns}
          data={tableData}
          emptyMessage="No blog posts found. Create your first blog post!"
        />
      </div>

      {/* Blog Form Modal - WORKING VERSION */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999
            }}
            onClick={() => {
              console.log('🔙 Backdrop clicked - closing form');
              setShowForm(false);
              setEditingBlog(null);
            }}
          />
          
          {/* Form */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 10000,
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <BlogForm
              blog={editingBlog}
              onSubmit={editingBlog ? handleEditBlog : handleCreateBlog}
              onCancel={() => {
                console.log('❌ Cancel button clicked');
                setShowForm(false);
                setEditingBlog(null);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BlogManagement;