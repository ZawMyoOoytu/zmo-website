import React, { useState } from 'react';
import BlogForm from '../../Components/forms/BlogForm';
import { blogService } from '../../services/blogService';
import './Dashboard.css';

const Dashboard = () => {
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // FIXED: Proper function to show modal
  const handleCreateBlogClick = () => {
    console.log('🎯 CREATE BLOG BUTTON CLICKED');
    setShowBlogForm(true);
    setFormError('');
    setFormSuccess('');
  };

  // FIXED: Proper function to close modal
  const handleCloseForm = () => {
    console.log('❌ Closing form modal');
    if (window.confirm('Are you sure? Any unsaved changes will be lost.')) {
      setShowBlogForm(false);
      setFormError('');
      setFormSuccess('');
    }
  };

  // FIXED: Handle form submission
  const handleCreateBlog = async (formData) => {
    console.log('🚀 Form submitted with data:', formData);
    
    try {
      setFormLoading(true);
      setFormError('');
      
      // Prepare data for API
      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        readTime: formData.readTime,
        tags: formData.tags,
        status: formData.status,
        featured: formData.featured,
        imageUrl: formData.imageUrl || '',
        publishedAt: formData.status === 'published' ? new Date().toISOString() : null
      };
      
      console.log('📤 Sending to API:', blogData);
      
      // Call API
      const response = await blogService.createBlog(blogData);
      console.log('📝 API Response:', response);
      
      if (response && response.success) {
        console.log('✅ Blog created successfully');
        setFormSuccess('✅ Blog created successfully!');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowBlogForm(false);
          setFormSuccess('');
        }, 2000);
      } else {
        throw new Error(response?.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('❌ Error creating blog:', error);
      setFormError(error.message || 'Failed to create blog. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Top Bar */}
      <div className="top-bar">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your blog.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* FIXED: Button that actually opens modal */}
          <button 
            className="create-blog-btn"
            onClick={handleCreateBlogClick}
            style={{
              backgroundColor: '#4361ee',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              boxShadow: '0 4px 6px rgba(67, 97, 238, 0.2)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3f37c9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4361ee'}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Create New Blog
          </button>
          
          <div className="user-info">
            <div className="user-avatar">A</div>
            <div>
              <strong>Admin User</strong>
              <p>Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Button - Can see if clicking works */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => {
            console.log('🐛 DEBUG: Current state - showBlogForm:', showBlogForm);
            setShowBlogForm(true); // Force open
          }}
          style={{
            background: '#ff6b6b',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🐛 Force Open Modal
        </button>
        
        <button 
          onClick={() => console.log('Current state:', { showBlogForm, formLoading })}
          style={{
            background: '#4cc9f0',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔍 Check State
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {/* Your stat cards */}
      </div>

      {/* ============ CRITICAL PART: MODAL RENDERING ============ */}
      
      {/* Backdrop - Only shows when showBlogForm is true */}
      {showBlogForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleCloseForm}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              animation: 'slideIn 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0 }}>Create New Blog Post</h2>
              <button 
                onClick={handleCloseForm}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                ×
              </button>
            </div>
            
            {/* Messages */}
            {formError && (
              <div style={{
                margin: '20px 30px',
                padding: '12px 20px',
                background: '#ffeaea',
                color: '#d32f2f',
                borderRadius: '8px',
                border: '1px solid #ffcdd2'
              }}>
                ❌ {formError}
              </div>
            )}
            
            {formSuccess && (
              <div style={{
                margin: '20px 30px',
                padding: '12px 20px',
                background: '#e8f5e9',
                color: '#2e7d32',
                borderRadius: '8px',
                border: '1px solid #c8e6c9'
              }}>
                ✅ {formSuccess}
              </div>
            )}
            
            {/* BlogForm Component */}
            <div style={{ padding: '0 30px 30px' }}>
              <BlogForm
                key="create-blog-form"
                blog={null}
                onSubmit={handleCreateBlog}
                onCancel={handleCloseForm}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rest of your dashboard content */}
      <div className="content-section">
        <div className="section-header">
          <div className="section-title">
            <i className="fas fa-clock"></i> Recent Activity
          </div>
        </div>
        
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            {showBlogForm ? '✅ Blog Form is OPEN!' : '❌ Blog Form is CLOSED'}
          </p>
          
          <button 
            onClick={handleCreateBlogClick}
            style={{
              background: '#4361ee',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Test Create Blog Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;