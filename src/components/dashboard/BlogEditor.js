// src/components/dashboard/BlogEditor.js - COMPLETE FIXED VERSION WITH DELETE BUTTON
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import './BlogEditor.css';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    imageUrl: '',
    isPublished: false
  });

  // Show message with timeout
  const showMessageWithTimeout = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setSuccess('');
      setError('');
    }, 5000);
  };

  // Test backend connection on mount
  useEffect(() => {
    const testBackend = async () => {
      const result = await blogService.testConnection();
      if (!result.success) {
        showMessageWithTimeout(`⚠️ ${result.message}`, 'error');
      }
    };
    testBackend();
  }, []);

  // Utility function to extract content from various field names
  const extractBlogContent = (blogData) => {
    console.log('🔍 Extracting content from:', blogData);
    
    const contentFields = [
      'content',
      'body',
      'description',
      'htmlContent',
      'text',
      'article',
      'postContent',
      'blogContent',
      'contentHTML',
      'contentText',
      'details',
      'fullContent'
    ];
    
    for (const field of contentFields) {
      if (blogData[field] && typeof blogData[field] === 'string' && blogData[field].trim()) {
        console.log(`✅ Found content in field: "${field}"`);
        return blogData[field];
      }
    }
    
    if (blogData.data && blogData.data.content) {
      console.log('✅ Found content in data.content');
      return blogData.data.content;
    }
    
    if (typeof blogData === 'string') {
      return blogData;
    }
    
    console.log('❌ No content found in blog data');
    return '';
  };

  // Utility to extract excerpt
  const extractExcerpt = (blogData, content) => {
    if (blogData.excerpt && typeof blogData.excerpt === 'string') {
      return blogData.excerpt;
    }
    if (blogData.summary && typeof blogData.summary === 'string') {
      return blogData.summary;
    }
    if (blogData.data && blogData.data.excerpt) {
      return blogData.data.excerpt;
    }
    if (content && content.length > 0) {
      return content.substring(0, 150) + (content.length > 150 ? '...' : '');
    }
    return '';
  };

  // Load blog data if editing
  const loadBlogData = useCallback(async () => {
    if (!id) {
      console.log('🆕 Creating new blog - no ID provided');
      setDebugInfo('Creating new blog');
      return;
    }

    try {
      setLoading(true);
      setDebugInfo(`Loading blog ${id}...`);
      console.log(`🚀 Loading blog data for ID: "${id}"`);
      
      const cachedBlog = localStorage.getItem(`blog_cache_${id}`);
      if (cachedBlog) {
        try {
          const parsedBlog = JSON.parse(cachedBlog);
          console.log('📦 Found cached blog data:', parsedBlog);
          
          if (parsedBlog._id === id) {
            console.log('✅ Using cached blog data');
            const content = extractBlogContent(parsedBlog);
            const excerpt = extractExcerpt(parsedBlog, content);
            
            setFormData({
              title: parsedBlog.title || '',
              content: content,
              excerpt: excerpt,
              category: parsedBlog.category || '',
              tags: Array.isArray(parsedBlog.tags) ? parsedBlog.tags : [],
              imageUrl: parsedBlog.imageUrl || parsedBlog.featuredImage || '',
              isPublished: !!parsedBlog.isPublished
            });
            
            setDebugInfo(`✅ Loaded from cache: ${parsedBlog.title}`);
            showMessageWithTimeout('✅ Blog data loaded from cache', 'success');
            
            localStorage.removeItem(`blog_cache_${id}`);
            return;
          }
        } catch (cacheError) {
          console.error('❌ Error parsing cached data:', cacheError);
        }
      }

      console.log('🌐 Making API call to fetch blog...');
      setDebugInfo('Fetching from API...');
      
      const blogData = await blogService.getBlogById(id);
      console.log('📦 API Response received:', blogData);
      
      if (!blogData) {
        throw new Error('No data returned from API');
      }
      
      console.log('🔍 Available fields in response:', Object.keys(blogData));
      console.log('📊 Response type:', typeof blogData);
      
      const content = extractBlogContent(blogData);
      const excerpt = extractExcerpt(blogData, content);
      
      console.log(`📝 Extracted content length: ${content.length} characters`);
      console.log(`📝 Extracted excerpt: ${excerpt.substring(0, 50)}...`);
      
      const formDataToSet = {
        title: blogData.title || blogData.data?.title || 'Untitled Blog',
        content: content,
        excerpt: excerpt,
        category: blogData.category || blogData.data?.category || '',
        tags: Array.isArray(blogData.tags) ? blogData.tags : 
              (blogData.data && Array.isArray(blogData.data.tags)) ? blogData.data.tags : [],
        imageUrl: blogData.imageUrl || blogData.featuredImage || blogData.data?.imageUrl || '',
        isPublished: !!blogData.isPublished || !!(blogData.data && blogData.data.isPublished)
      };
      
      console.log('✅ Form data prepared:', formDataToSet);
      setFormData(formDataToSet);
      
      setDebugInfo(`✅ Loaded: ${formDataToSet.title} (${content.length} chars)`);
      showMessageWithTimeout('✅ Blog data loaded successfully!', 'success');
      
    } catch (error) {
      console.error('❌ Error loading blog:', error);
      setDebugInfo(`❌ Error: ${error.message}`);
      
      let errorMessage = error.message;
      
      if (error.message.includes('500') || error.message.includes('Failed')) {
        console.log('🔄 Trying fallback: fetching all blogs...');
        setDebugInfo('Trying fallback method...');
        
        try {
          const allBlogsResponse = await blogService.getBlogs();
          if (allBlogsResponse.success && allBlogsResponse.data) {
            const blogFromList = allBlogsResponse.data.find(b => b._id === id);
            
            if (blogFromList) {
              console.log('✅ Found blog in all blogs list:', blogFromList);
              const content = extractBlogContent(blogFromList);
              const excerpt = extractExcerpt(blogFromList, content);
              
              setFormData({
                title: blogFromList.title || '',
                content: content,
                excerpt: excerpt,
                category: blogFromList.category || '',
                tags: blogFromList.tags || [],
                imageUrl: blogFromList.imageUrl || '',
                isPublished: !!blogFromList.isPublished
              });
              
              setDebugInfo(`✅ Loaded from list: ${blogFromList.title}`);
              showMessageWithTimeout('✅ Blog loaded from list (fallback)', 'success');
              return;
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
      
      if (errorMessage.includes('404')) {
        errorMessage = 'Blog not found. It may have been deleted.';
        setTimeout(() => navigate('/admin/blogs'), 3000);
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showMessageWithTimeout(`❌ Failed to load blog: ${errorMessage}`, 'error');
      
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      loadBlogData();
    }
  }, [id, loadBlogData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'tags') {
      const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({ ...prev, [name]: tagsArray }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo('Saving blog...');

    try {
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.content.trim()) throw new Error('Content is required');

      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) throw new Error('You must be logged in to save blogs. Please login again.');

      let response;
      if (id) {
        console.log(`🔄 Updating blog ${id}`);
        setDebugInfo('Updating blog...');
        response = await blogService.updateBlog(id, formData);
      } else {
        console.log('🆕 Creating new blog');
        setDebugInfo('Creating new blog...');
        response = await blogService.createBlog(formData);
      }

      console.log('✅ API Response:', response);

      if (response) {
        const message = id ? '✅ Blog updated successfully!' : '✅ Blog created successfully!';
        setDebugInfo(message);
        showMessageWithTimeout(message, 'success');
        setTimeout(() => navigate('/admin/blogs'), 1500);
      } else {
        throw new Error('Failed to save blog');
      }
    } catch (error) {
      console.error('❌ Error saving blog:', error);
      setDebugInfo(`❌ Save failed: ${error.message}`);
      
      let errorMessage = error.message;

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection and ensure the backend is running.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => navigate('/admin/login'), 2000);
      }

      showMessageWithTimeout(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // DELETE BLOG POST FUNCTION
  const handleDelete = async () => {
    if (!id) {
      showMessageWithTimeout('No blog post to delete', 'error');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete this blog post?\n\nThis action cannot be undone!'
    );
    
    if (!confirmed) return;

    try {
      setLoading(true);
      setDebugInfo('Deleting blog post...');
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) throw new Error('Authentication required');
      
      const response = await blogService.deleteBlog(id);
      
      if (response.success) {
        showMessageWithTimeout('✅ Blog post deleted successfully!', 'success');
        setDebugInfo('✅ Blog deleted');
        
        setTimeout(() => navigate('/admin/blogs'), 1500);
      } else {
        throw new Error(response.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('❌ Error deleting blog:', error);
      setDebugInfo(`❌ Delete failed: ${error.message}`);
      
      let errorMessage = error.message;
      if (error.message.includes('401')) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => navigate('/admin/login'), 2000);
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      showMessageWithTimeout(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop
  const handleDragOver = (e) => { 
    e.preventDefault(); 
    setIsDragging(true); 
  };
  
  const handleDragLeave = (e) => { 
    e.preventDefault(); 
    setIsDragging(false); 
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Image upload to backend
  const handleImageUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      showMessageWithTimeout('❌ Please select an image file (JPG, PNG, GIF, WEBP)', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showMessageWithTimeout('❌ Image size must be less than 5MB', 'error');
      return;
    }
    
    try {
      setUploading(true);
      setDebugInfo(`Uploading ${file.name}...`);
      showMessageWithTimeout('📤 Uploading image to server...', 'info');
      
      console.log('📁 Starting upload:', {
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        lastModified: new Date(file.lastModified).toLocaleString()
      });
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('You are not logged in. Please login and try again.');
      }
      
      const uploadResult = await blogService.uploadImage(file);
      
      if (uploadResult.success && uploadResult.imageUrl) {
        console.log('✅ Upload successful! Image URL:', uploadResult.imageUrl);
        setFormData(prev => ({ ...prev, imageUrl: uploadResult.imageUrl }));
        setDebugInfo(`✅ Uploaded: ${file.name}`);
        showMessageWithTimeout('✅ Image uploaded successfully!', 'success');
      } else {
        console.error('❌ Upload failed:', uploadResult);
        throw new Error(uploadResult.message || uploadResult.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      setDebugInfo(`❌ Upload failed: ${error.message}`);
      
      let errorMessage = error.message;
      
      if (error.message.includes('Authentication required') || error.message.includes('not logged in')) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => navigate('/admin/login'), 2000);
      } else if (error.message.includes('Cannot connect')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('File too large')) {
        errorMessage = 'File too large. Maximum size is 5MB.';
      } else if (error.message.includes('Only image files')) {
        errorMessage = 'Only image files (JPEG, PNG, GIF, WEBP) are allowed.';
      }
      
      try {
        console.log('🔄 Trying local fallback...');
        const reader = new FileReader();
        
        const dataUrl = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        showMessageWithTimeout(`⚠️ Using local preview (${errorMessage})`, 'warning');
        setDebugInfo('⚠️ Using local preview');
        
      } catch (fallbackError) {
        console.error('❌ Local fallback also failed:', fallbackError);
        
        const safeFileName = encodeURIComponent(file.name.substring(0, 20));
        const placeholderUrl = `https://via.placeholder.com/600x400/667eea/ffffff?text=${safeFileName}`;
        setFormData(prev => ({ ...prev, imageUrl: placeholderUrl }));
        
        showMessageWithTimeout(`❌ ${errorMessage} (using placeholder)`, 'error');
        setDebugInfo('❌ Using placeholder');
      }
      
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImageLoadError(false);
    showMessageWithTimeout('✅ Image removed', 'success');
  };

  const handleTestBackend = async () => {
    setLoading(true);
    setDebugInfo('Testing backend connection...');
    try {
      const result = await blogService.testConnection();
      showMessageWithTimeout(result.message, result.success ? 'success' : 'error');
      setDebugInfo(result.success ? '✅ Backend connected' : '❌ Backend error');
    } catch (error) {
      showMessageWithTimeout('Test failed: ' + error.message, 'error');
      setDebugInfo('❌ Test failed');
    } finally {
      setLoading(false);
    }
  };

  // Test upload endpoint
  const testUploadEndpoint = async () => {
    try {
      setDebugInfo('Testing upload endpoint...');
      const result = await blogService.testUploadEndpoint();
      
      console.log('📊 Upload endpoint test:', result);
      
      if (result.success) {
        alert(`✅ Upload Endpoint Test Successful!\n\n${result.message}\n\nEndpoint: ${result.endpoint}\n\nMake sure you're logged in to use POST /api/admin/upload`);
        setDebugInfo('✅ Upload endpoint working');
      } else {
        alert(`❌ Upload Endpoint Test Failed\n\n${result.message}\n\nEndpoint: ${result.endpoint}\n\nNote: GET /api/admin/upload requires authentication`);
        setDebugInfo('❌ Upload endpoint test failed');
      }
    } catch (error) {
      console.error('Upload test error:', error);
      alert('Test failed: ' + error.message);
    }
  };

  // Test direct API call for debugging
  const testDirectAPICall = async () => {
    try {
      console.log('🔍 Testing direct API call for blog:', id);
      setDebugInfo('Testing API...');
      
      const response = await fetch(`https://zmo-backend.onrender.com/api/blogs/${id}`);
      console.log('📊 Direct API status:', response.status);
      
      const data = await response.json();
      console.log('📦 Direct API response:', data);
      
      alert(`API Status: ${response.status}\n\nResponse:\n${JSON.stringify(data, null, 2)}`);
      
      setDebugInfo(`API Status: ${response.status}`);
      
    } catch (error) {
      console.error('❌ Direct API test failed:', error);
      setDebugInfo('❌ API test failed');
      alert('API Test Failed: ' + error.message);
    }
  };

  // Add sample content for testing
  const addSampleContent = () => {
    setFormData(prev => ({
      ...prev,
      content: prev.content || `# ${prev.title || 'Sample Blog'}\n\n## Introduction\n\nThis is sample content because no content was found in the database.\n\n## Main Content\n\nYou can edit this content freely.\n\n- Point 1\n- Point 2\n- Point 3\n\n## Conclusion\n\nEdit and save your changes.`
    }));
    showMessageWithTimeout('✅ Sample content added', 'success');
  };

  // Handle image load error
  const handleImageError = () => {
    console.error('❌ Image failed to load:', formData.imageUrl);
    setImageLoadError(true);
  };

  if (loading && id) {
    return (
      <div className="blog-editor-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blog data...</p>
          {debugInfo && <p className="debug-info">{debugInfo}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="blog-editor-page">
      {showMessage && success && (
        <div className="message-alert message-success">
          <span>{success}</span>
          <button className="message-close" onClick={() => setShowMessage(false)}>×</button>
        </div>
      )}
      {showMessage && error && (
        <div className="message-alert message-error">
          <span>{error}</span>
          <button className="message-close" onClick={() => setShowMessage(false)}>×</button>
        </div>
      )}

      <div className="editor-container">
        <div className="editor-header">
          <h1>{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
          <p>{id ? 'Update your existing blog post' : 'Write and publish a new blog post'}</p>
          {debugInfo && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: '#e9ecef',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              📊 Status: {debugInfo}
            </div>
          )}
          <button onClick={handleTestBackend} className="btn btn-secondary" style={{ marginTop: '10px', fontSize: '12px', padding: '5px 10px' }} disabled={loading}>
            Test Backend Connection
          </button>
        </div>

        {/* Debug Panel */}
        {id && (
          <div className="debug-panel" style={{
            margin: '20px 0',
            padding: '15px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                🐛 Debug Panel: Editing Blog ID: <code>{id}</code>
              </summary>
              <div style={{ marginTop: '15px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <div>
                    <strong>Title:</strong> {formData.title || 'Not set'}
                  </div>
                  <div>
                    <strong>Content Length:</strong> 
                    <span style={{ color: formData.content?.length ? '#28a745' : '#dc3545', marginLeft: '5px' }}>
                      {formData.content?.length || 0} chars
                    </span>
                  </div>
                  <div>
                    <strong>Category:</strong> {formData.category || 'Not set'}
                  </div>
                  <div>
                    <strong>Status:</strong> {formData.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Content Preview:</strong>
                  <div style={{
                    background: '#e9ecef',
                    padding: '10px',
                    borderRadius: '4px',
                    marginTop: '5px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: '100px',
                    overflow: 'auto',
                    border: formData.content ? '1px solid #28a745' : '2px solid #dc3545'
                  }}>
                    {formData.content 
                      ? (formData.content.length > 200 
                          ? formData.content.substring(0, 200) + '...' 
                          : formData.content)
                      : '❌ NO CONTENT - The blog may not have a "content" field in the database'
                    }
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={testDirectAPICall}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Test Direct API Call
                  </button>
                  
                  <button 
                    onClick={testUploadEndpoint}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Test Upload Endpoint
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('📊 Current Form Data:', formData);
                      console.log('🆔 Blog ID:', id);
                      alert('Check browser console for form data');
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Log Form Data
                  </button>
                  
                  <button 
                    onClick={loadBlogData}
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    🔄 Reload Data
                  </button>
                  
                  {!formData.content && (
                    <button 
                      onClick={addSampleContent}
                      className="btn btn-warning"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Add Sample Content
                    </button>
                  )}
                </div>
              </div>
            </details>
          </div>
        )}

        <form className="blog-form" onSubmit={handleSubmit}>
          {/* Title & Excerpt */}
          <div className="form-section">
            <h3>Title & Excerpt</h3>
            <div className="form-group">
              <label className="required">Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="Enter blog title" 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Excerpt</label>
              <textarea 
                name="excerpt" 
                value={formData.excerpt} 
                onChange={handleChange} 
                className="form-textarea" 
                rows="3" 
                placeholder="Brief description" 
                disabled={loading}
              />
            </div>
          </div>

          {/* Featured Image Section */}
          <div className="form-section">
            <h3>Featured Image</h3>
            
            <div style={{
              marginBottom: '15px',
              padding: '12px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>📤</span>
                <strong>Upload Instructions:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                <li>Max file size: <strong>5MB</strong></li>
                <li>Allowed formats: <strong>JPG, PNG, GIF, WEBP</strong></li>
                <li>Requires authentication (must be logged in)</li>
                <li>Endpoint: <code>/api/admin/upload</code></li>
              </ul>
            </div>
            
            {uploading && (
              <div style={{
                padding: '15px',
                background: '#e7f3ff',
                border: '1px solid #b3d7ff',
                borderRadius: '8px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div className="uploading-spinner" style={{ width: '24px', height: '24px' }}></div>
                <div>
                  <strong>Uploading image to server...</strong>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                    Please wait while your image is being uploaded to the backend.
                  </div>
                </div>
              </div>
            )}
            
            <div className={`image-upload-area ${isDragging ? 'dragging' : ''}`} 
                 onDragOver={handleDragOver} 
                 onDragLeave={handleDragLeave} 
                 onDrop={handleDrop}>
              
              {!formData.imageUrl ? (
                <label className="image-upload-label" style={{ cursor: uploading || loading ? 'not-allowed' : 'pointer' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="image-upload-input" 
                    onChange={handleFileInputChange} 
                    disabled={uploading || loading}
                  />
                  <div className="image-upload-placeholder">
                    <div style={{ fontSize: '60px', marginBottom: '20px', opacity: uploading || loading ? 0.5 : 1 }}>📷</div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {isDragging ? '🎉 Drop image here!' : 'Drag & drop image here'}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                      or click to browse files
                    </p>
                    <div style={{
                      padding: '8px 16px',
                      background: uploading || loading ? '#ccc' : '#667eea',
                      color: 'white',
                      borderRadius: '6px',
                      display: 'inline-block',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {uploading ? 'Uploading...' : 'Select Image'}
                    </div>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
                      Supports: JPG, PNG, GIF, WEBP • Max: 5MB
                    </p>
                  </div>
                </label>
              ) : (
                <div className="image-preview-container">
                  <div style={{ position: 'relative', marginBottom: '15px' }}>
                    {!imageLoadError ? (
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="image-preview"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          borderRadius: '8px',
                          border: '1px solid #dee2e6'
                        }}
                        onError={handleImageError}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '2px dashed #dee2e6',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                      }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
                        <p style={{ color: '#666', marginBottom: '5px' }}>Image failed to load</p>
                        <p style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
                          URL: {formData.imageUrl.substring(0, 50)}...
                        </p>
                      </div>
                    )}
                    
                    {formData.imageUrl.startsWith('data:image/') && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255, 193, 7, 0.9)',
                        color: '#856404',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backdropFilter: 'blur(4px)'
                      }}>
                        ⚠️ LOCAL PREVIEW
                      </div>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginBottom: '15px',
                    flexWrap: 'wrap' 
                  }}>
                    <button 
                      type="button" 
                      className="btn-action"
                      onClick={handleRemoveImage} 
                      disabled={uploading || loading}
                      style={{
                        padding: '8px 16px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: uploading || loading ? 'not-allowed' : 'pointer',
                        opacity: uploading || loading ? 0.6 : 1
                      }}
                    >
                      ✕ Remove
                    </button>
                    
                    <label className="btn-action" style={{
                      padding: '8px 16px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: uploading || loading ? 'not-allowed' : 'pointer',
                      opacity: uploading || loading ? 0.6 : 1,
                      display: 'inline-block'
                    }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileInputChange} 
                        disabled={uploading || loading}
                        style={{ display: 'none' }}
                      />
                      🔄 Replace
                    </label>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.imageUrl)
                          .then(() => showMessageWithTimeout('✅ Image URL copied to clipboard', 'success'))
                          .catch(() => showMessageWithTimeout('❌ Failed to copy URL', 'error'));
                      }}
                      className="btn-action"
                      style={{
                        padding: '8px 16px',
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Copy URL
                    </button>
                  </div>
                  
                  <div style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Image Source:</span>
                      <span style={{
                        padding: '2px 8px',
                        background: formData.imageUrl.startsWith('data:image/') ? '#fff3cd' : '#d4edda',
                        color: formData.imageUrl.startsWith('data:image/') ? '#856404' : '#155724',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {formData.imageUrl.startsWith('data:image/') ? 'Local Preview' : 'Server Upload'}
                      </span>
                    </div>
                    <div>
                      <strong>URL:</strong>
                      <div style={{
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        marginTop: '5px',
                        padding: '8px',
                        background: '#e9ecef',
                        borderRadius: '4px',
                        maxHeight: '60px',
                        overflowY: 'auto'
                      }}>
                        {formData.imageUrl}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="image-url-input mt-4">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Or enter image URL manually:
              </label>
              <input 
                type="text" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="https://images.unsplash.com/photo-..."
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                Paste a direct image URL or use the uploader above
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="form-section">
            <h3>
              Content <span className="required">*</span>
              {formData.content && (
                <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px', fontWeight: 'normal' }}>
                  ({formData.content.length} characters)
                </span>
              )}
            </h3>
            
            {!formData.content && id && (
              <div style={{
                padding: '10px',
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                marginBottom: '10px',
                color: '#856404'
              }}>
                ⚠️ <strong>No content found!</strong> This blog may not have a "content" field in the database.
                Click "Add Sample Content" in the debug panel above, or enter your content below.
              </div>
            )}
            
            <textarea 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              className="content-editor" 
              rows="15" 
              placeholder="Write your blog content here..." 
              required 
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                border: formData.content ? '1px solid #ced4da' : '2px solid #dc3545',
                borderRadius: '8px',
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '300px'
              }}
            />
          </div>

          {/* Meta */}
          <div className="form-section">
            <h3>Meta Information</h3>
            <div className="form-group">
              <label>Category</label>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="Category" 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input 
                type="text" 
                name="tags" 
                value={formData.tags.join(', ')} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="Tags, separated by commas" 
                disabled={loading}
              />
            </div>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="isPublished" 
                name="isPublished" 
                checked={formData.isPublished} 
                onChange={handleChange} 
                disabled={loading}
              />
              <label htmlFor="isPublished">Publish immediately</label>
            </div>
          </div>

          {/* Actions with Delete Button */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/admin/blogs')} 
              disabled={loading}
            >
              Cancel
            </button>
            
            {/* Show Delete button only when editing an existing post */}
            {id && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={loading}
                style={{
                  background: '#dc3545',
                  borderColor: '#dc3545',
                  marginLeft: '10px'
                }}
              >
                {loading ? 'Deleting...' : 'Delete Post'}
              </button>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ marginLeft: 'auto' }}
            >
              {loading ? 'Saving...' : id ? 'Update Blog' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;