// src/components/dashboard/BlogManagement.js
import React, { useState, useEffect } from 'react';
import './BlogManagement.css';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [newBlogData, setNewBlogData] = useState({
    title: '',
    content: '',
    category: 'technology',
    tags: [],
    status: 'draft'
  });
  
  const blogsPerPage = 10;

  // Mock data
  const mockBlogs = [
    {
      id: 1,
      title: 'Getting Started with React',
      content: 'Learn how to build modern web applications with React...',
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
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      title: 'Advanced JavaScript Patterns',
      content: 'Explore advanced JavaScript patterns and best practices...',
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
      image: null
    },
    {
      id: 3,
      title: 'Business Growth Strategies',
      content: 'Discover effective strategies for business growth in 2024...',
      excerpt: 'Discover effective strategies for business growth in 2024...',
      category: 'business',
      tags: ['business', 'growth', 'strategy'],
      status: 'published',
      featured: true,
      author: 'Robert Johnson',
      views: 2345,
      comments: 67,
      likes: 156,
      createdAt: '2023-10-10',
      updatedAt: '2023-10-15',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 4,
      title: 'Healthy Lifestyle Tips',
      content: 'Simple tips for maintaining a healthy lifestyle...',
      excerpt: 'Simple tips for maintaining a healthy lifestyle...',
      category: 'lifestyle',
      tags: ['health', 'lifestyle', 'wellness'],
      status: 'published',
      featured: false,
      author: 'Sarah Williams',
      views: 987,
      comments: 23,
      likes: 45,
      createdAt: '2023-10-05',
      updatedAt: '2023-10-12',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 5,
      title: 'Latest Technology News',
      content: 'Stay updated with the latest technology trends...',
      excerpt: 'Stay updated with the latest technology trends...',
      category: 'news',
      tags: ['tech', 'news', 'innovation'],
      status: 'published',
      featured: true,
      author: 'Michael Brown',
      views: 3456,
      comments: 89,
      likes: 234,
      createdAt: '2023-10-01',
      updatedAt: '2023-10-08',
      image: 'https://via.placeholder.com/150'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setBlogs(mockBlogs);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to load blogs:', err);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
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

  // Get category class
  const getCategoryClass = (category) => {
    switch(category) {
      case 'technology': return 'category-technology';
      case 'business': return 'category-business';
      case 'lifestyle': return 'category-lifestyle';
      case 'tutorial': return 'category-tutorial';
      case 'news': return 'category-news';
      default: return 'category-other';
    }
  };

  // Get status class
  const getStatusClass = (status) => {
    switch(status) {
      case 'published': return 'status-published';
      case 'draft': return 'status-draft';
      case 'archived': return 'status-archived';
      default: return '';
    }
  };

  // Handle actions
  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setNewBlogData({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      tags: [...blog.tags],
      status: blog.status
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (selectedBlog) {
      setBlogs(blogs.map(blog => 
        blog.id === selectedBlog.id 
          ? { ...blog, ...newBlogData, updatedAt: new Date().toISOString().split('T')[0] }
          : blog
      ));
    } else {
      // Create new blog
      const newBlog = {
        id: blogs.length + 1,
        ...newBlogData,
        excerpt: newBlogData.content.substring(0, 100) + '...',
        author: 'Current User',
        views: 0,
        comments: 0,
        likes: 0,
        featured: false,
        image: null,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setBlogs([newBlog, ...blogs]);
    }
    setShowEditModal(false);
    setSelectedBlog(null);
    setNewBlogData({
      title: '',
      content: '',
      category: 'technology',
      tags: [],
      status: 'draft'
    });
  };

  const handleDelete = (blogId) => {
    setSelectedBlog(blogs.find(blog => blog.id === blogId));
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedBlog) {
      setBlogs(blogs.filter(blog => blog.id !== selectedBlog.id));
      setShowDeleteModal(false);
      setSelectedBlog(null);
    }
  };

  const handlePublish = (blogId) => {
    setBlogs(blogs.map(blog => 
      blog.id === blogId 
        ? { ...blog, status: blog.status === 'published' ? 'draft' : 'published' }
        : blog
    ));
  };

  const handleCreateNew = () => {
    setSelectedBlog(null);
    setNewBlogData({
      title: '',
      content: '',
      category: 'technology',
      tags: [],
      status: 'draft'
    });
    setShowEditModal(true);
  };

  // Add tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setNewBlogData({
        ...newBlogData,
        tags: [...newBlogData.tags, e.target.value.trim()]
      });
      e.target.value = '';
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setNewBlogData({
      ...newBlogData,
      tags: newBlogData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (loading) {
    return (
      <div className="blog-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-management">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Blog Management</h1>
          <p className="subtitle">Advanced blog management with all features</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreateNew}>
            + Create New Blog
          </button>
          <button className="btn btn-secondary" onClick={() => window.open('/blog', '_blank')}>
            👁 View Public Blog
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="content-section stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{blogs.length}</div>
            <div className="stat-label">Total Posts</div>
          </div>
          <div className="stat-card stat-published">
            <div className="stat-number">{blogs.filter(b => b.status === 'published').length}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-card stat-draft">
            <div className="stat-number">{blogs.filter(b => b.status === 'draft').length}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-card stat-featured">
            <div className="stat-number">{blogs.filter(b => b.featured).length}</div>
            <div className="stat-label">Featured</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="content-section filters-section">
        <div className="filters">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Status:</label>
              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-tab ${statusFilter === 'published' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('published')}
                >
                  Published
                </button>
                <button 
                  className={`filter-tab ${statusFilter === 'draft' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('draft')}
                >
                  Draft
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select 
                className="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="tutorial">Tutorial</option>
                <option value="news">News</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className="content-section blogs-section">
        {currentBlogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Blog Posts Found</h3>
            <p>Try adjusting your filters or create a new blog post</p>
            <button className="btn btn-primary" onClick={handleCreateNew}>
              + Create Your First Post
            </button>
          </div>
        ) : (
          <>
            <div className="blogs-table">
              <div className="table-header">
                <div className="header-cell">Blog Post</div>
                <div className="header-cell">Category & Tags</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Date</div>
                <div className="header-cell">Actions</div>
              </div>
              
              {currentBlogs.map(blog => (
                <div key={blog.id} className="table-row">
                  <div className="table-cell">
                    <div className="blog-title-row">
                      <h3 className="blog-title">{blog.title}</h3>
                      {blog.featured && <span className="featured-badge">Featured</span>}
                    </div>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    <div className="blog-meta">
                      <span className="blog-author">By {blog.author}</span>
                      <span className="blog-stats">
                        <span className="stat">👁 {blog.views}</span>
                        <span className="stat">💬 {blog.comments}</span>
                        <span className="stat">❤️ {blog.likes}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <span className={`category-badge ${getCategoryClass(blog.category)}`}>
                      {blog.category}
                    </span>
                    <div className="blog-tags">
                      {blog.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                      {blog.tags.length > 2 && (
                        <span className="tag-more">+{blog.tags.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <span className={`status ${getStatusClass(blog.status)}`}>
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="table-cell date-cell">
                    <div className="date-main">{formatDate(blog.createdAt)}</div>
                    <div className="date-updated">Updated: {formatDate(blog.updatedAt)}</div>
                  </div>
                  
                  <div className="table-cell">
                    <div className="actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(blog)}
                      >
                        Edit
                      </button>
                      
                      <button 
                        className="action-btn toggle-publish"
                        onClick={() => handlePublish(blog.id)}
                      >
                        {blog.status === 'draft' ? 'Publish' : 'Unpublish'}
                      </button>
                      
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(blog.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="pagination-btn"
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

      {/* Edit/Create Modal */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ width: '600px' }}>
            <div className="modal-header">
              <h2>{selectedBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newBlogData.title}
                  onChange={(e) => setNewBlogData({...newBlogData, title: e.target.value})}
                  placeholder="Enter blog title"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={newBlogData.content}
                  onChange={(e) => setNewBlogData({...newBlogData, content: e.target.value})}
                  placeholder="Write your blog content here..."
                  className="form-textarea"
                  rows="6"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newBlogData.category}
                    onChange={(e) => setNewBlogData({...newBlogData, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="news">News</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newBlogData.status}
                    onChange={(e) => setNewBlogData({...newBlogData, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  {newBlogData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button 
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    onKeyPress={handleAddTag}
                    className="tag-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={!newBlogData.title || !newBlogData.content}
              >
                {selectedBlog ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBlog && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <h2>Delete Blog Post</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete the blog post:</p>
              <p className="delete-confirm-title">"{selectedBlog.title}"</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;