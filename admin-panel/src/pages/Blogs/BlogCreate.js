// admin-panel/src/pages/Blogs/BlogCreate.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../../components/forms/BlogForm';
import { blogService } from '../../services/blogService';
import './BlogCreate.css';

const BlogCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (blogData) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📝 Creating blog post:', blogData);
      
      const result = await blogService.createBlog(blogData);
      
      console.log('📝 API Response:', result);
      
      if (result.success) {
        alert('✅ Blog created successfully!');
        
        // Navigate back to blog management
        navigate('/blogs');
      } else {
        // Show specific error message
        setError(result.error || result.message || 'Failed to create blog post');
        alert(`❌ Error: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error('💥 Error in blog creation:', error);
      setError(error.message || 'An unexpected error occurred');
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/blogs');
    }
  };

  return (
    <div className="blog-create">
      {/* Header Section */}
      <div className="blog-create-header">
        <div>
          <h1>Create New Blog Post</h1>
          <p>Fill in the details below to create a new blog post</p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError('')}
            className="btn-dismiss"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Test Button - Remove in production */}
      <div className="debug-section">
        <button 
          onClick={async () => {
            console.log('🧪 Testing blog creation...');
            const testData = {
              title: 'Test Blog ' + new Date().toLocaleTimeString(),
              excerpt: 'This is a test blog post',
              content: 'This is test content for the blog post.',
              author: 'Test Author',
              readTime: 5,
              tags: ['test', 'demo'],
              status: 'draft',
              featured: false,
              imageUrl: ''
            };
            
            try {
              const result = await blogService.createBlog(testData);
              console.log('Test result:', result);
              alert(result.success ? '✅ Test successful!' : '❌ Test failed');
            } catch (error) {
              console.error('Test error:', error);
              alert('❌ Test failed: ' + error.message);
            }
          }}
          className="btn-test"
        >
          🧪 Test Blog Creation
        </button>
      </div>

      {/* BlogForm Container */}
      <div className="blog-form-container">
        {/* UPDATED: Pass initialData instead of expecting it to handle undefined */}
        <BlogForm
          initialData={{}} // Pass empty object for new blog
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default BlogCreate;