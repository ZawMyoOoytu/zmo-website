// src/pages/Blogs/BlogEdit.js - UPDATED
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogForm from '../../components/forms/BlogForm'; // FIXED IMPORT

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');

  console.log('🔧 BlogEdit component loaded, ID:', id);

  useEffect(() => {
    // Simulate loading blog data
    const timer = setTimeout(() => {
      setBlog({
        _id: id,
        title: `Editing Blog Post ${id}`,
        excerpt: 'This is a sample excerpt for editing.',
        content: 'This is the content that you can edit. Make your changes here.',
        author: 'Admin User',
        readTime: 5,
        tags: ['editing', 'tutorial', 'react'],
        status: 'published',
        featured: false,
        imageUrl: ''
      });
      console.log('✅ Blog data loaded');
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleUpdateBlog = async (formData) => {
    console.log('💾 Saving blog edits:', formData);
    setLoading(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        console.log('✅ Blog updated successfully!');
        alert('✅ Blog updated successfully!');
        setLoading(false);
        navigate('/blogs'); // Go back to blog list
      }, 1000);
    } catch (err) {
      console.error('❌ Error updating blog:', err);
      setError('Failed to update blog. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure? Any unsaved changes will be lost.')) {
      navigate('/blogs');
    }
  };

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/blogs')}
          style={{
            padding: '10px 20px',
            background: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Blog List
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Edit Blog Post</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            Blog ID: <code>{id}</code>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate('/blogs')}
            style={{
              padding: '10px 20px',
              background: '#4361ee',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            View All Blogs
          </button>
        </div>
      </div>

      {!blog ? (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center', 
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4361ee',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading blog data...</p>
        </div>
      ) : (
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <BlogForm
            blog={blog}
            onSubmit={handleUpdateBlog}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      )}

      {/* Debug Section */}
      <div style={{ 
        marginTop: '40px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Debug Information:</strong>
        <div style={{ marginTop: '10px' }}>
          • Component: BlogEdit.js<br/>
          • Blog ID: {id}<br/>
          • Blog data: {blog ? '✅ Loaded' : '❌ Loading...'}<br/>
          • Check browser console for logs
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BlogEdit;