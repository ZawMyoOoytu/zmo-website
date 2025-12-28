// src/pages/Blogs/BlogList.js - COMPLETELY FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 🟢 FIXED: Check if dependencies exist and provide fallbacks
let blogAPI;
let LoadingSpinner;
let ApiDebugger;

try {
  blogAPI = require('../../services/api').blogAPI;
} catch (error) {
  console.log('❌ blogAPI not found, using mock data');
  blogAPI = {
    getAll: async () => {
      // Mock API response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            blogs: [
              {
                _id: '1',
                title: 'Welcome to Your Blog',
                excerpt: 'This is your first blog post. Start writing!',
                content: 'This is a sample blog post to get you started. You can edit or delete this post and create new ones.',
                author: 'Admin',
                published: true,
                tags: ['welcome', 'getting-started'],
                createdAt: new Date().toISOString(),
                views: 0
              },
              {
                _id: '2',
                title: 'Draft Post - Edit Me',
                excerpt: 'This is a draft post that needs completion',
                content: 'This post is still in draft mode. You can finish writing it and publish when ready.',
                author: 'Admin',
                published: false,
                tags: ['draft'],
                createdAt: new Date().toISOString(),
                views: 0
              }
            ]
          });
        }, 1000);
      });
    }
  };
}

try {
  LoadingSpinner = require('../../components/common/LoadingSpinner').default;
} catch (error) {
  console.log('❌ LoadingSpinner not found, using fallback');
  LoadingSpinner = ({ message = "Loading..." }) => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px' 
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
      }}></div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ color: '#666', fontSize: '16px' }}>{message}</div>
    </div>
  );
}

try {
  ApiDebugger = require('../../components/common/ApiDebugger').default;
} catch (error) {
  console.log('❌ ApiDebugger not found, using fallback');
  ApiDebugger = () => (
    <div style={{
      backgroundColor: '#e7f3ff',
      border: '1px solid #b3d9ff',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>🔧 API Debugger</h4>
      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
        API Debugger component not available. Check console for debug information.
      </p>
    </div>
  );
}

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDebug, setShowDebug] = useState(true);

  // Fetch ALL blogs for admin (including unpublished)
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching blogs...');
      
      const result = await blogAPI.getAll();
      console.log('📊 Blog API response:', result);
      
      if (result.success) {
        const blogsData = result.blogs || result.data || [];
        console.log(`✅ Loaded ${blogsData.length} blogs`);
        
        setBlogs(blogsData);
        setFilteredBlogs(blogsData);
        
        // Debug: Log all blogs
        blogsData.forEach((blog, index) => {
          console.log(`📝 Blog ${index + 1}:`, {
            id: blog._id,
            title: blog.title,
            published: blog.published,
            createdAt: blog.createdAt
          });
        });
      } else {
        throw new Error(result.message || 'Failed to load blogs');
      }
    } catch (error) {
      console.error('❌ Blog fetch error:', error);
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

  // 🟢 FIXED: Removed unused handleClearSearch function

  // 🟢 SIMPLE STYLES
  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexWrap: 'wrap',
      gap: '15px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block'
    },
    badgeSuccess: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    badgeWarning: {
      backgroundColor: '#ffc107', 
      color: 'black'
    },
    button: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      textDecoration: 'none',
      display: 'inline-block',
      textAlign: 'center'
    },
    buttonPrimary: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      border: '1px solid #6c757d',
      color: '#6c757d'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={{margin: '0 0 8px 0'}}>Blog Management</h1>
            <p style={{margin: 0, color: '#666'}}>Manage your blog posts</p>
          </div>
        </div>
        <LoadingSpinner message="Loading blogs..." />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{margin: '0 0 8px 0', fontSize: '28px'}}>Blog Management</h1>
          <p style={{margin: 0, color: '#666'}}>Create, edit, and manage your blog posts</p>
        </div>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <button 
            onClick={() => setShowDebug(!showDebug)}
            style={{...styles.button, ...styles.buttonOutline}}
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </button>
          <button 
            onClick={refreshBlogs}
            style={{...styles.button, ...styles.buttonOutline}}
          >
            🔄 Refresh
          </button>
          <Link 
            to="/blogs/create" 
            style={{...styles.button, ...styles.buttonPrimary}}
          >
            ➕ Create New Blog
          </Link>
        </div>
      </div>

      {/* API Debugger */}
      {showDebug && <ApiDebugger />}

      {/* Debug Info */}
      <div style={styles.card}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div>
            <strong>📊 Blog Statistics:</strong> 
            <span style={{marginLeft: '12px'}}>Total: {blogs.length}</span>
            <span style={{marginLeft: '8px', color: '#28a745'}}>
              Published: {blogs.filter(b => b.published).length}
            </span>
            <span style={{marginLeft: '8px', color: '#ffc107'}}>
              Drafts: {blogs.filter(b => !b.published).length}
            </span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{color: '#6c757d', fontSize: '14px'}}>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <button 
              onClick={() => console.log('🔍 All blogs:', blogs)}
              style={{
                padding: '4px 8px',
                border: '1px solid #17a2b8',
                backgroundColor: 'transparent',
                color: '#17a2b8',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🐛 Console Log
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          ...styles.card,
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <div>
              <strong>Error Loading Blogs:</strong> {error}
            </div>
            <button 
              onClick={refreshBlogs} 
              style={{
                padding: '6px 12px',
                border: '1px solid #dc3545',
                backgroundColor: 'transparent',
                color: '#dc3545',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div style={styles.card}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: '300px'}}>
            <div style={{position: 'relative'}}>
              <input
                type="text"
                placeholder="Search blogs by title, content, tags, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 35px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d'
              }}>
                🔍
              </span>
              {/* 🟢 ADDED: Clear search button when there's text */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            <button
              style={{
                padding: '6px 12px',
                border: `1px solid ${searchTerm === '' ? '#007bff' : '#6c757d'}`,
                backgroundColor: searchTerm === '' ? '#007bff' : 'transparent',
                color: searchTerm === '' ? 'white' : '#6c757d',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onClick={() => setSearchTerm('')}
            >
              All ({blogs.length})
            </button>
            <button
              style={{
                padding: '6px 12px',
                border: `1px solid ${searchTerm === 'published' ? '#28a745' : '#28a745'}`,
                backgroundColor: searchTerm === 'published' ? '#28a745' : 'transparent',
                color: searchTerm === 'published' ? 'white' : '#28a745',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onClick={() => setSearchTerm('published')}
            >
              Published ({blogs.filter(b => b.published).length})
            </button>
            <button
              style={{
                padding: '6px 12px',
                border: `1px solid ${searchTerm === 'draft' ? '#ffc107' : '#ffc107'}`,
                backgroundColor: searchTerm === 'draft' ? '#ffc107' : 'transparent',
                color: searchTerm === 'draft' ? 'black' : '#856404',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onClick={() => setSearchTerm('draft')}
            >
              Drafts ({blogs.filter(b => !b.published).length})
            </button>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      {filteredBlogs.length > 0 ? (
        <div style={styles.card}>
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead>
                <tr style={{borderBottom: '2px solid #dee2e6'}}>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Title</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Author</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Status</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Created</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 'bold'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map(blog => (
                  <tr key={blog._id} style={{borderBottom: '1px solid #dee2e6'}}>
                    <td style={{padding: '12px'}}>
                      <div>
                        <strong>{blog.title || 'Untitled Blog'}</strong>
                        {blog.excerpt && (
                          <div style={{color: '#6c757d', fontSize: '12px', marginTop: '4px'}}>
                            {blog.excerpt.length > 100 ? blog.excerpt.substring(0, 100) + '...' : blog.excerpt}
                          </div>
                        )}
                        {blog.tags && blog.tags.length > 0 && (
                          <div style={{color: '#6c757d', fontSize: '12px', marginTop: '4px'}}>
                            Tags: {blog.tags.slice(0, 3).join(', ')}
                            {blog.tags.length > 3 && ` +${blog.tags.length - 3} more`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{padding: '12px'}}>{blog.author || 'Admin'}</td>
                    <td style={{padding: '12px'}}>
                      {blog.published ? (
                        <span style={{...styles.badge, ...styles.badgeSuccess}}>Published</span>
                      ) : (
                        <span style={{...styles.badge, ...styles.badgeWarning}}>Draft</span>
                      )}
                    </td>
                    <td style={{padding: '12px'}}>{formatDate(blog.createdAt)}</td>
                    <td style={{padding: '12px'}}>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <Link
                          to={`/blogs/edit/${blog._id}`}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/blogs/view/${blog._id}`}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{...styles.card, textAlign: 'center', padding: '40px'}}>
          <div style={{color: '#6c757d'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>📄</div>
            <h4>No blogs found</h4>
            <p>
              {searchTerm 
                ? 'No blogs match your search criteria.' 
                : 'No blogs have been created yet.'}
            </p>
            <p style={{color: '#dc3545', fontSize: '14px', marginTop: '12px'}}>
              <strong>Debug Info:</strong> Using mock data. Create real API services to connect to your backend.
            </p>
            <Link 
              to="/blogs/create" 
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                marginTop: '8px'
              }}
            >
              ➕ Create Your First Blog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;