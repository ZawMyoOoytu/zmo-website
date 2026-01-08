// src/components/dashboard/BlogList.js - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import './BlogList.css';

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [blogToToggle, setBlogToToggle] = useState(null);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    visible: 0,
    hidden: 0
  });

  // Load blogs from API
  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading blogs from API...');
      
      const response = await blogService.getBlogs();
      console.log('📦 API response:', response);
      
      if (response.success && response.data) {
        const blogsData = response.data.map(blog => {
          // Debug: Log the blog data structure
          console.log('📝 Blog data:', blog);
          
          // Check for published status in various possible fields
          const isPublished = 
            blog.isPublished === true || 
            blog.published === true || 
            blog.status === 'published' ||
            blog.status === 'Published';
          
          // Default to visible if published, otherwise hidden for drafts
          const isVisible = blog.isVisible !== undefined 
            ? blog.isVisible 
            : isPublished; // Auto-visible if published
          
          // Format date
          let formattedDate = 'No date';
          if (blog.createdAt) {
            try {
              const date = new Date(blog.createdAt);
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            } catch (dateError) {
              console.error('Date parsing error:', dateError);
            }
          }
          
          return {
            ...blog,
            _id: blog._id || blog.id, // Handle both _id and id
            isPublished: isPublished,
            isVisible: isVisible,
            formattedDate: formattedDate,
            // Add excerpt if missing
            excerpt: blog.excerpt || blog.description || blog.content?.substring(0, 150) + '...' || 'No description'
          };
        });
        
        console.log(`📥 Loaded ${blogsData.length} blogs`);
        console.log('📊 Processed blogs:', blogsData.map(b => ({
          title: b.title,
          isPublished: b.isPublished,
          isVisible: b.isVisible,
          _id: b._id
        })));
        
        setBlogs(blogsData);
        updateStats(blogsData);
      } else {
        console.error('❌ API returned error:', response);
        setBlogs([]);
      }
    } catch (error) {
      console.error('❌ Error loading blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update statistics
  const updateStats = (blogsData) => {
    const total = blogsData.length;
    const published = blogsData.filter(b => b.isPublished).length;
    const drafts = total - published;
    const visible = blogsData.filter(b => b.isVisible).length;
    const hidden = total - visible;
    
    console.log('📈 Stats calculated:', { total, published, drafts, visible, hidden });
    
    setStats({ total, published, drafts, visible, hidden });
  };

  // Filter blogs
  useEffect(() => {
    let filtered = [...blogs];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title?.toLowerCase().includes(term) ||
        blog.excerpt?.toLowerCase().includes(term) ||
        blog.category?.toLowerCase().includes(term) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(blog => {
        if (statusFilter === 'published') return blog.isPublished;
        if (statusFilter === 'drafts') return !blog.isPublished;
        if (statusFilter === 'visible') return blog.isVisible;
        if (statusFilter === 'hidden') return !blog.isVisible;
        return true;
      });
    }
    
    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, statusFilter]);

  // Load blogs on component mount
  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // DELETE BLOG
  const handleDelete = async (blogId) => {
    try {
      console.log(`🗑️ Deleting blog ${blogId}`);
      
      setLoading(true);
      
      const response = await blogService.deleteBlog(blogId);
      console.log('📊 Delete response:', response);
      
      if (response.success) {
        // Remove from local state
        setBlogs(prev => prev.filter(blog => blog._id !== blogId));
        setSelectedBlogs(prev => prev.filter(id => id !== blogId));
        
        alert('✅ Blog deleted successfully!');
        
        // Refresh the list
        await loadBlogs();
      } else {
        alert(`❌ ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error deleting blog:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setBlogToDelete(null);
    }
  };

  // Toggle visibility
  const toggleVisibility = async (blogId) => {
    const blog = blogs.find(b => b._id === blogId);
    if (!blog) return;

    try {
      setLoading(true);
      
      const updatedBlog = {
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        category: blog.category,
        tags: blog.tags || [],
        imageUrl: blog.imageUrl,
        isPublished: blog.isPublished,
        isVisible: !blog.isVisible
      };

      console.log(`🔄 Toggling visibility for ${blogId}:`, updatedBlog);
      
      const response = await blogService.updateBlog(blogId, updatedBlog);
      
      if (response) {
        // Update local state
        setBlogs(prev => prev.map(b => 
          b._id === blogId ? { ...b, isVisible: !b.isVisible } : b
        ));
        
        alert(`✅ Blog ${blog.isVisible ? 'hidden from' : 'made visible on'} the website!`);
        
        // Refresh stats
        await loadBlogs();
      }
    } catch (error) {
      console.error('❌ Error toggling visibility:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
      setShowVisibilityModal(false);
      setBlogToToggle(null);
    }
  };

  // Publish/Unpublish
  const handlePublish = async (blogId) => {
    const blog = blogs.find(b => b._id === blogId);
    if (!blog) return;

    try {
      setLoading(true);
      
      const newPublishedStatus = !blog.isPublished;
      const updatedBlog = {
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        category: blog.category,
        tags: blog.tags || [],
        imageUrl: blog.imageUrl,
        isPublished: newPublishedStatus,
        // Auto-show when publishing, hide when unpublishing
        isVisible: newPublishedStatus
      };

      console.log(`📢 Setting published to ${newPublishedStatus} for ${blogId}`);
      
      const response = await blogService.updateBlog(blogId, updatedBlog);
      
      if (response) {
        // Update local state
        setBlogs(prev => prev.map(b => 
          b._id === blogId ? { 
            ...b, 
            isPublished: newPublishedStatus,
            isVisible: newPublishedStatus
          } : b
        ));
        
        alert(`✅ Blog ${newPublishedStatus ? 'published' : 'unpublished'} successfully!`);
        
        // Refresh stats
        await loadBlogs();
      }
    } catch (error) {
      console.error('❌ Error updating publication status:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selectedBlogs.length === filteredBlogs.length) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(filteredBlogs.map(blog => blog._id));
    }
  };

  // Toggle individual selection
  const toggleBlogSelection = (blogId) => {
    setSelectedBlogs(prev => 
      prev.includes(blogId)
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId]
    );
  };

  // Fix data button (for testing)
  const fixBlogData = async (blog) => {
    try {
      setLoading(true);
      
      const updatedBlog = {
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        category: blog.category,
        tags: blog.tags || [],
        imageUrl: blog.imageUrl,
        // Set to published and visible
        isPublished: true,
        isVisible: true
      };

      const response = await blogService.updateBlog(blog._id, updatedBlog);
      
      if (response) {
        alert('✅ Blog data fixed! Now published and visible.');
        await loadBlogs();
      }
    } catch (error) {
      console.error('❌ Error fixing blog data:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test fix all blogs
  const fixAllBlogs = async () => {
    if (!window.confirm('Fix all blogs to be published and visible?')) return;
    
    try {
      setLoading(true);
      
      for (const blog of blogs) {
        if (!blog.isPublished) {
          const updatedBlog = {
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt,
            category: blog.category,
            tags: blog.tags || [],
            imageUrl: blog.imageUrl,
            isPublished: true,
            isVisible: true
          };
          
          await blogService.updateBlog(blog._id, updatedBlog);
        }
      }
      
      alert('✅ All blogs fixed!');
      await loadBlogs();
    } catch (error) {
      console.error('❌ Error fixing all blogs:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="blog-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-page">
      {/* Header */}
      <div className="blog-list-header">
        <div>
          <h1>Blog Posts</h1>
          <p>{stats.total} published • {stats.visible} on website</p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-warning"
              onClick={fixAllBlogs}
              disabled={loading}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              🔧 Fix All Blogs (Publish & Show)
            </button>
            <button 
              className="btn btn-info"
              onClick={() => console.log('Blogs data:', blogs)}
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              📊 Debug Data
            </button>
          </div>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/blogs/new')}
          disabled={loading}
        >
          + Create New Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        <div className="stat-card stat-published">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.published}</h3>
            <p>Published</p>
          </div>
        </div>
        <div className="stat-card stat-draft">
          <div className="stat-icon">✏️</div>
          <div className="stat-info">
            <h3>{stats.drafts}</h3>
            <p>Drafts</p>
          </div>
        </div>
        <div className="stat-card stat-visible">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <h3>{stats.visible}</h3>
            <p>Visible on Site</p>
          </div>
        </div>
        <div className="stat-card stat-hidden">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <h3>{stats.hidden}</h3>
            <p>Hidden</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={loading}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="drafts">Drafts</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Blog Table */}
      <div className="blog-table-container">
        <table className="blog-table">
          <thead>
            <tr>
              <th width="40">
                <input
                  type="checkbox"
                  checked={selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0}
                  onChange={toggleSelectAll}
                  className="select-all-checkbox"
                  disabled={loading}
                />
              </th>
              <th>Title</th>
              <th width="120">Status</th>
              <th width="120">Frontend</th>
              <th width="120">Created</th>
              <th width="220">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  📭 No blogs found. Create your first blog post!
                </td>
              </tr>
            ) : (
              filteredBlogs.slice((page - 1) * 10, page * 10).map(blog => (
                <tr key={blog._id} className={selectedBlogs.includes(blog._id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBlogs.includes(blog._id)}
                      onChange={() => toggleBlogSelection(blog._id)}
                      className="blog-checkbox"
                      disabled={loading}
                    />
                  </td>
                  <td>
                    <div className="blog-title-cell">
                      <h4>{blog.title || 'Untitled'}</h4>
                      <p className="blog-excerpt">
                        {blog.excerpt?.substring(0, 100) || 'No excerpt...'}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${blog.isPublished ? 'published' : 'draft'}`}>
                      {blog.isPublished ? 'published' : 'draft'}
                    </span>
                  </td>
                  <td>
                    <span className={`visibility-badge ${blog.isVisible ? 'visible' : 'hidden'}`}>
                      {blog.isVisible ? '✅ Visible' : '🚫 Hidden'}
                    </span>
                  </td>
                  <td>
                    <span className="blog-date">
                      {blog.formattedDate}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action view"
                        onClick={() => window.open(`/blog/${blog._id}`, '_blank')}
                        title="View on website"
                        disabled={loading}
                      >
                        👁️ View
                      </button>
                      <button
                        className="btn-action edit"
                        onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)}
                        title="Edit blog"
                        disabled={loading}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-action publish"
                        onClick={() => handlePublish(blog._id)}
                        title={blog.isPublished ? 'Unpublish' : 'Publish'}
                        disabled={loading}
                      >
                        {blog.isPublished ? '📕 Unpublish' : '📗 Publish'}
                      </button>
                      <button
                        className={`btn-action ${blog.isVisible ? 'hide' : 'show'}`}
                        onClick={() => {
                          setBlogToToggle(blog);
                          setShowVisibilityModal(true);
                        }}
                        title={blog.isVisible ? 'Hide from website' : 'Show on website'}
                        disabled={loading}
                      >
                        {blog.isVisible ? '🚫 Hide' : '✅ Show'}
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => {
                          setBlogToDelete(blog);
                          setShowDeleteModal(true);
                        }}
                        title="Delete blog"
                        disabled={loading}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredBlogs.length > 0 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary"
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {page} of {Math.ceil(filteredBlogs.length / 10)}
          </span>
          <button 
            className="btn btn-secondary"
            onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(filteredBlogs.length / 10)))}
            disabled={page === Math.ceil(filteredBlogs.length / 10) || loading}
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🗑️ Delete Blog</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this blog?</p>
              <div className="blog-to-delete">
                <strong>{blogToDelete.title}</strong>
                <p>ID: {blogToDelete._id}</p>
                <p>This action cannot be undone!</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(blogToDelete._id)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Toggle Modal */}
      {showVisibilityModal && blogToToggle && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{blogToToggle.isVisible ? '🚫 Hide Blog' : '✅ Show Blog'}</h3>
              <button className="modal-close" onClick={() => setShowVisibilityModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                {blogToToggle.isVisible
                  ? 'This blog will be hidden from the public website.'
                  : 'This blog will be visible on the public website.'}
              </p>
              <div className="blog-to-toggle">
                <strong>{blogToToggle.title}</strong>
                <p>Current: {blogToToggle.isVisible ? 'Visible' : 'Hidden'}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowVisibilityModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={`btn ${blogToToggle.isVisible ? 'btn-warning' : 'btn-success'}`}
                onClick={() => toggleVisibility(blogToToggle._id)}
                disabled={loading}
              >
                {loading ? 'Updating...' : blogToToggle.isVisible ? 'Hide from Website' : 'Show on Website'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;