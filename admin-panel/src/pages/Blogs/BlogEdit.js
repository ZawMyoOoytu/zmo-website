// admin-panel/src/pages/Blogs/BlogEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogForm from '../../components/forms/BlogForm';
import { blogAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        console.log(`📖 Fetching blog ${id} for editing...`);
        
        const result = await blogAPI.getById(id);
        
        if (result.success) {
          setBlog(result.data);
        } else {
          throw new Error(result.message || 'Blog not found');
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setError(error.message || 'Failed to load blog. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    } else {
      // If no ID is provided, initialize an empty blog for creation
      setBlog({ title: '', content: '', tags: [] });
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (blogData) => {
    try {
      setSubmitting(true);
      setError('');
      
      if (id) {
        console.log(`✏️ Updating blog ${id}:`, blogData);
        const result = await blogAPI.update(id, blogData);
        
        if (result.success) {
          console.log('✅ Blog updated successfully!');
          alert('Blog updated successfully!');
          navigate('/blogs');
        } else {
          throw new Error(result.message || 'Failed to update blog');
        }
      } else {
        console.log('📝 Creating new blog:', blogData);
        const result = await blogAPI.create(blogData);
        
        if (result.success) {
          console.log('✅ Blog created successfully!');
          alert('Blog created successfully!');
          navigate('/blogs');
        } else {
          throw new Error(result.message || 'Failed to create blog');
        }
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      setError(error.message || 'Failed to submit blog. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
                <h1>{id ? 'Edit Blog' : 'Create Blog'}</h1>
                <p>{id ? `Update blog post: ${blog?.title || 'Untitled'}` : 'Create a new blog post'}</p>
              </div>
              <div className="header-actions">
                <button 
                  onClick={() => navigate('/blogs')}
                  className="btn btn-outline-secondary"
                  disabled={submitting}
                >
                  <i className="fas fa-arrow-left"></i> Back to Blogs
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="card">
            <div className="card-body">
              {blog && (
                <BlogForm 
                  blog={blog}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEdit;