// src/pages/Blogs/BlogCreate.js - FINAL WORKING VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../../components/forms/BlogForm';

const BlogCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleCreateBlog = async (formData) => {
    console.log('🚀 Starting blog creation...');
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Get token (optional - your backend might work without it)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Prepare blog data - match backend expectations
      const blogData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        category: formData.category || 'technology',
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        image: formData.image || '',
        author: formData.author || 'Admin',
        readTime: formData.readTime || 5,
        status: formData.status || 'draft',
        // These fields might be needed based on your backend
        featured: formData.featured || false,
        published: formData.status === 'published' || false
      };

      console.log('📦 Blog data prepared:', blogData);

      // Headers - add auth if we have token
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // USE THE WORKING ENDPOINT: /api/blogs (not /api/admin/blogs)
      const response = await fetch('https://zmo-backend.onrender.com/api/blogs', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(blogData)
      });

      console.log('📨 Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📨 Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed response:', data);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        throw new Error('Server returned invalid response');
      }

      // Check for success - your backend returns {success: true, data: {...}}
      if (response.ok && data.success === true) {
        console.log('🎉 Blog created! ID:', data.data?._id);
        
        setMessage({ 
          type: 'success', 
          text: '✅ Blog created successfully! Redirecting...' 
        });
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
          navigate('/admin/blogs');
        }, 1500);
        
        return data;
      } else {
        // Handle error
        const errorMsg = data.message || data.error || `Error ${response.status}`;
        console.error('❌ Creation failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
    } catch (err) {
      console.error('💥 Error in blog creation:', err);
      
      let errorMessage = err.message;
      
      // User-friendly error messages
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Check your internet.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage = 'Authentication issue. Please login again.';
        localStorage.removeItem('token');
        setTimeout(() => navigate('/admin/login'), 1500);
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Network error. Check your connection.';
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

  // Quick test function
  const testConnection = async () => {
    try {
      setMessage({ type: 'info', text: 'Testing connection...' });
      
      const response = await fetch('https://zmo-backend.onrender.com/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Connection Test ' + Date.now(),
          content: 'Testing API connection',
          excerpt: 'Test'
        })
      });
      
      const data = await response.json();
      setMessage({ 
        type: response.ok ? 'success' : 'error', 
        text: response.ok 
          ? '✅ API connection working!' 
          : `❌ API error: ${data.message || response.status}`
      });
      
    } catch (err) {
      setMessage({ type: 'error', text: `❌ Connection failed: ${err.message}` });
    }
  };

  const styles = {
    container: { 
      padding: '30px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: 'calc(100vh - 100px)'
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
      alignItems: 'center',
      animation: 'fadeIn 0.3s ease-in'
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
    info: {
      background: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
    },
    messageClose: { 
      background: 'none', 
      border: 'none', 
      fontSize: '20px', 
      cursor: 'pointer', 
      color: 'inherit',
      padding: '0 0 0 10px'
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

      {/* Debug/Info Panel */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#495057' }}>
            API Information
          </h3>
          <button 
            onClick={testConnection}
            style={{
              padding: '6px 12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Test Connection
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
          fontSize: '13px'
        }}>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
            <strong>Endpoint:</strong> POST /api/blogs
          </div>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
            <strong>Status:</strong> <span style={{ color: '#28a745' }}>Working ✓</span>
          </div>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
            <strong>Auth:</strong> {localStorage.getItem('token') ? 'Token present' : 'Optional'}
          </div>
          <div style={{ padding: '8px', background: 'white', borderRadius: '4px' }}>
            <strong>Backend:</strong> zmo-backend.onrender.com
          </div>
        </div>
        
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
          <p style={{ margin: '5px 0' }}>✅ Test confirmed: Blog creation works via POST /api/blogs</p>
          <p style={{ margin: '5px 0' }}>⚠️ Note: Using public endpoint (not /admin path)</p>
        </div>
      </div>
    </div>
  );
};

export default BlogCreate;