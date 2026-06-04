// admin-panel/src/pages/Blogs/BlogView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        console.log(`👀 Fetching blog ${id} for viewing...`);
        
        const result = await blogAPI.getById(id);
        
        if (result.success) {
          setBlog(result.data);
        } else {
          throw new Error(result.message || 'Blog not found');
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading blog..." />;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="admin-page-header">
            <div className="header-content">
              <div>
                <h1>View Blog</h1>
                <p>Preview blog post details</p>
              </div>
              <div className="header-actions">
                <button 
                  onClick={() => navigate('/blogs')}
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-arrow-left"></i> Back to Blogs
                </button>
                <Link 
                  to={`/blogs/edit/${id}`}
                  className="btn btn-primary"
                >
                  <i className="fas fa-edit"></i> Edit Blog
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {blog && (
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h2 className="mb-3">{blog.title}</h2>
                    
                    <div className="mb-4">
                      <div className="d-flex gap-3 mb-2">
                        <span className={`badge ${blog.published ? 'bg-success' : 'bg-warning'}`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-muted">
                          <i className="fas fa-user me-1"></i>
                          {blog.author || 'Admin'}
                        </span>
                        <span className="text-muted">
                          <i className="fas fa-calendar me-1"></i>
                          {formatDate(blog.createdAt)}
                        </span>
                        {blog.readTime && (
                          <span className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {blog.readTime} min read
                          </span>
                        )}
                      </div>
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="mb-4">
                        <strong>Tags: </strong>
                        {blog.tags.map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark me-1">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {blog.excerpt && (
                      <div className="mb-4">
                        <h5>Excerpt</h5>
                        <p className="text-muted">{blog.excerpt}</p>
                      </div>
                    )}

                    {blog.content && (
                      <div>
                        <h5>Content</h5>
                        <div 
                          className="blog-content-preview"
                          style={{ 
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            padding: '20px',
                            background: '#f8f9fa',
                            maxHeight: '400px',
                            overflowY: 'auto'
                          }}
                        >
                          {blog.content}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Blog Information</h6>
                      </div>
                      <div className="card-body">
                        <dl>
                          <dt>Blog ID</dt>
                          <dd className="text-muted">{blog._id}</dd>
                          
                          <dt>Status</dt>
                          <dd>
                            <span className={`badge ${blog.published ? 'bg-success' : 'bg-warning'}`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                          </dd>
                          
                          <dt>Created</dt>
                          <dd className="text-muted">{formatDate(blog.createdAt)}</dd>
                          
                          {blog.updatedAt && (
                            <>
                              <dt>Last Updated</dt>
                              <dd className="text-muted">{formatDate(blog.updatedAt)}</dd>
                            </>
                          )}
                          
                          {blog.readTime && (
                            <>
                              <dt>Read Time</dt>
                              <dd className="text-muted">{blog.readTime} minutes</dd>
                            </>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogView;