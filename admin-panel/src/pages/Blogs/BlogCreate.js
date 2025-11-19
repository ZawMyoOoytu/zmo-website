import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../../components/forms/BlogForm';
import { blogService } from '../../services/blogService';
import { ROUTES } from '../../App';

const BlogCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Comprehensive debugging
  useEffect(() => {
    console.log('🔍 BlogCreate component MOUNTED');
    console.log('📍 Current URL:', window.location.href);
    console.log('📁 BlogForm import:', BlogForm);
    console.log('📁 blogService import:', blogService);
    
    setDebugInfo('Component mounted successfully');
    
    // Check if BlogForm is a valid component
    if (!BlogForm) {
      console.error('❌ BlogForm import is NULL or UNDEFINED');
      setDebugInfo('BlogForm import failed - check file path');
    } else {
      console.log('✅ BlogForm import successful');
      setDebugInfo('BlogForm loaded successfully');
    }
  }, []);

  const handleSubmit = async (blogData) => {
    console.log('🚀 Form submitted with data:', blogData);
    setLoading(true);
    setError('');
    
    try {
      const result = await blogService.createBlog(blogData);
      console.log('✅ Create blog result:', result);
      
      if (result.success) {
        console.log('📝 Blog created successfully, redirecting...');
        navigate(ROUTES.BLOGS, { 
          state: { message: 'Blog post created successfully!' } 
        });
      } else {
        console.log('❌ Blog creation failed:', result.error);
        setError(result.error || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('💥 Error creating blog:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('🔙 Cancel button clicked');
    navigate(ROUTES.BLOGS);
  };

  return (
    <div className="blog-create-page" style={{ padding: '20px' }}>
      {/* DEBUG INFO - Very visible */}
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '2px solid #2196f3',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🐛 DEBUG PANEL</h3>
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          <div><strong>Status:</strong> {debugInfo}</div>
          <div><strong>BlogForm:</strong> {BlogForm ? '✅ Loaded' : '❌ Missing'}</div>
          <div><strong>blogService:</strong> {blogService ? '✅ Loaded' : '❌ Missing'}</div>
          <div><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</div>
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#333' }}>
            Create New Blog Post
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
            Fill in the details to create a new blog post
          </p>
        </div>
      </div>
      
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          <strong>Error: </strong>{error}
        </div>
      )}
      
      {/* SIMPLE FALLBACK FORM - Test if this appears */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e1e5e9'
      }}>
        {BlogForm ? (
          <BlogForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        ) : (
          // Fallback form if BlogForm fails to load
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            border: '2px dashed #ff4444',
            borderRadius: '8px',
            backgroundColor: '#fff0f0'
          }}>
            <h2 style={{ color: '#ff4444' }}>❌ BlogForm Failed to Load</h2>
            <p>BlogForm component could not be loaded. Check:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>File path: src/components/forms/BlogForm.js</li>
              <li>Syntax errors in BlogForm.js</li>
              <li>Browser console for errors</li>
            </ul>
            
            {/* Simple test form */}
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
              <h3>Simple Test Form</h3>
              <input 
                type="text" 
                placeholder="Test input" 
                style={{ padding: '8px', margin: '5px', width: '200px' }}
              />
              <br />
              <button 
                onClick={() => alert('Test form works!')}
                style={{ padding: '8px 16px', margin: '5px' }}
              >
                Test Button
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Test button to check service */}
      <button
        onClick={async () => {
          console.log('🧪 Testing blogService.createBlog...');
          if (blogService && blogService.createBlog) {
            const testData = {
              title: 'Test Blog ' + Date.now(),
              excerpt: 'Test excerpt for debugging',
              content: 'This is test content to verify the blog creation service is working properly.',
              author: 'Test Author',
              readTime: 5,
              tags: ['test', 'debug'],
              status: 'draft',
              featured: false,
              imageUrl: ''
            };
            
            try {
              const result = await blogService.createBlog(testData);
              console.log('🧪 Service test result:', result);
              alert(result.success ? '✅ Service works!' : '❌ Service failed: ' + result.error);
            } catch (error) {
              console.error('🧪 Service test error:', error);
              alert('❌ Service error: ' + error.message);
            }
          } else {
            alert('❌ blogService.createBlog not found!');
          }
        }}
        style={{
          marginTop: '20px',
          padding: '10px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        🧪 Test Blog Service
      </button>
    </div>
  );
};

export default BlogCreate;