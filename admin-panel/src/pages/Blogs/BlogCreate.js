// src/pages/Blogs/BlogCreate.js - COMPLETE VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../../components/forms/BlogForm';

const BlogCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleCreateBlog = async (formData) => {
    console.log('Creating blog:', formData);
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Get authentication token
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('You must be logged in to create blogs. Please login again.');
      }

      // Call your actual API
      const response = await fetch('https://zmo-backend.onrender.com/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          author: 'Admin', // Set default author
          views: 0,
          comments: 0,
          likes: 0
        })
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: '✅ Blog created successfully!' 
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin/blogs');
        }, 2000);
      } else {
        throw new Error(data.error || data.message || `Error: ${response.status}`);
      }
    } catch (err) {
      console.error('Error creating blog:', err);
      
      let errorMessage = err.message;
      
      // Handle specific errors
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (err.message.includes('401') || err.message.includes('not logged in')) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => navigate('/admin/login'), 2000);
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setMessage({ 
        type: 'error', 
        text: `❌ ${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/blogs');
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    title: {
      margin: '0 0 10px 0',
      fontSize: '28px',
      color: '#333',
      fontWeight: '600'
    },
    subtitle: {
      color: '#666',
      margin: 0,
      fontSize: '16px'
    },
    messageAlert: {
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    success: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    error: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    messageClose: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: 'inherit'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Create New Blog Post</h1>
        <p style={styles.subtitle}>Fill in the details to create a new blog post</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{ 
          ...styles.messageAlert, 
          ...styles[message.type]
        }}>
          <span>{message.text}</span>
          <button 
            style={styles.messageClose}
            onClick={() => setMessage({ type: '', text: '' })}
          >
            ×
          </button>
        </div>
      )}

      {/* Blog Form */}
      <BlogForm
        onSubmit={handleCreateBlog}
        onCancel={handleCancel}
        loading={loading}
      />

      {/* Help Text */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>💡 Tips:</p>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Title and Content are required fields</li>
          <li>Use tags to help categorize your blog posts</li>
          <li>Set status to "Draft" if you want to save without publishing</li>
          <li>Featured posts will be highlighted in the blog list</li>
        </ul>
      </div>
    </div>
  );
};

export default BlogCreate;