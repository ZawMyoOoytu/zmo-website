// src/services/blogService.js - COMPLETE FIXED VERSION WITH AUTO-DRAFT PROTECTION
const API_BASE_URL = 'https://zmo-backend.onrender.com/api';

// ============================================
// 🛡️ AUTO-DRAFT PROTECTION SYSTEM
// ============================================

// Track recently created blogs to protect them
const protectedBlogs = new Set();

// Protect a blog from auto-draft
const protectBlog = (blogId, duration = 60000) => {
  protectedBlogs.add(blogId);
  console.log(`🛡️ Blog ${blogId} protected from auto-draft for ${duration/1000}s`);
  
  // Auto-remove protection
  setTimeout(() => {
    protectedBlogs.delete(blogId);
    console.log(`🛡️ Protection expired for ${blogId}`);
  }, duration);
};

// Check if update should be blocked
const shouldBlockUpdate = (blogId, updateData) => {
  if (!protectedBlogs.has(blogId)) return false;
  
  // Check if this is an auto-draft update
  const isAutoDraftUpdate = 
    (updateData.isVisible !== undefined && !updateData.published && !updateData.status) ||
    updateData.published === false ||
    updateData.status === 'draft';
  
  return isAutoDraftUpdate;
};

// Fix problematic update data
const fixUpdateData = (blogId, updateData) => {
  console.warn(`⚠️ Fixing auto-draft update for protected blog ${blogId}`);
  
  // Map isVisible to published/status
  if (updateData.isVisible !== undefined) {
    return {
      ...updateData,
      published: updateData.isVisible,
      status: updateData.isVisible ? 'published' : 'draft',
      _autoFixed: true
    };
  }
  
  // If no isVisible, default to published
  return {
    ...updateData,
    published: true,
    status: 'published',
    _autoFixed: true
  };
};

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

// Get headers with optional token
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ============================================
// 📦 BLOG SERVICE
// ============================================

export const blogService = {
  // 🛡️ Protection methods
  protectBlog,
  isProtected: (blogId) => protectedBlogs.has(blogId),
  clearProtection: () => {
    protectedBlogs.clear();
    console.log('🛡️ All protection cleared');
  },

  // Test backend connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      const data = await response.json();
      if (!response.ok) {
        return { 
          success: false, 
          message: `❌ Backend responded with status ${response.status}`, 
          status: response.status 
        };
      }
      return { 
        success: true, 
        message: '✅ Backend is connected!', 
        data 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Cannot connect to backend: ${error.message}`, 
        error: error.message 
      };
    }
  },

  // Create new blog - WITH PROTECTION
  createBlog: async (blogData) => {
    try {
      console.group('📝 Creating blog');
      
      // Ensure correct fields for backend
      const safeBlogData = {
        ...blogData,
        published: blogData.published !== undefined ? blogData.published : 
                  (blogData.status === 'published' || false),
        status: blogData.status || 'draft'
      };
      
      console.log('📦 Sending blog data:', safeBlogData);
      
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(safeBlogData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('❌ Create failed:', data);
        throw new Error(data.error || `HTTP ${response.status}: Failed to create blog`);
      }
      
      console.log('✅ Blog created:', data.data?._id);
      
      // AUTOMATICALLY PROTECT newly created blog from auto-draft
      if (data.data?._id) {
        protectBlog(data.data._id, 120000); // Protect for 2 minutes
        console.log(`🛡️ New blog ${data.data._id} automatically protected`);
        
        // Double-check after 10 seconds (when auto-update usually happens)
        setTimeout(async () => {
          try {
            const checkResponse = await fetch(`${API_BASE_URL}/blogs/${data.data._id}`);
            const checkData = await checkResponse.json();
            
            if (checkData.data && !checkData.data.published) {
              console.warn(`⚠️ Blog ${data.data._id} was auto-changed to draft at 10s! Fixing...`);
              
              await fetch(`${API_BASE_URL}/blogs/${data.data._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  published: true,
                  status: 'published',
                  _autoFixed: Date.now()
                })
              });
              
              console.log(`✅ Blog ${data.data._id} fixed back to published`);
            }
          } catch (err) {
            console.error('Protection check failed:', err);
          }
        }, 10000);
      }
      
      console.groupEnd();
      return data;
      
    } catch (error) {
      console.error('❌ Error creating blog:', error);
      console.groupEnd();
      throw error;
    }
  },

  // Fetch all blogs
  getBlogs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch blogs');
      
      // Handle different response structures
      if (data.success && data.data) {
        return { success: true, data: data.data }; // Structure: {success: true, data: [...]}
      } else if (data.blogs) {
        return { success: true, data: data.blogs }; // Structure: {blogs: [...]}
      } else if (Array.isArray(data)) {
        return { success: true, data: data }; // Structure: [...]
      } else {
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
      throw error;
    }
  },

  // Fetch single blog by ID
  getBlogById: async (id) => {
    try {
      console.log(`📥 Fetching blog ${id} from: ${API_BASE_URL}/blogs/${id}`);
      
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`📦 API Response for blog ${id}:`, result);
      
      // Handle different response structures
      let blogData;
      if (result.success && result.data) {
        blogData = result.data; // Structure: {success: true, data: {...}}
      } else if (result.success && result.blog) {
        blogData = result.blog; // Structure: {success: true, blog: {...}}
      } else if (result._id) {
        blogData = result; // Structure: {...blog data directly}
      } else {
        blogData = result; // Return whatever we get
      }
      
      console.log(`✅ Extracted blog data:`, blogData);
      return blogData;
      
    } catch (error) {
      console.error(`❌ Error fetching blog ${id}:`, error);
      throw error;
    }
  },

  // Update blog - WITH AUTO-DRAFT PROTECTION
  updateBlog: async (id, blogData) => {
    try {
      console.group(`🔄 updateBlog called for ${id}`);
      console.log('📦 Incoming blogData:', blogData);
      
      // Check if this is a problematic update (like from BlogList.js with only isVisible)
      const isProblematicUpdate = 
        blogData.isVisible !== undefined && 
        !blogData.published && 
        !blogData.status;
      
      let finalBlogData = { ...blogData };
      
      // Apply protection if blog is protected
      if (protectedBlogs.has(id) && shouldBlockUpdate(id, blogData)) {
        console.warn(`🚫 Blocking auto-draft update for protected blog ${id}`);
        finalBlogData = fixUpdateData(id, blogData);
        console.log('🔧 Fixed data:', finalBlogData);
      }
      // Fix problematic updates even if not protected
      else if (isProblematicUpdate) {
        console.warn(`⚠️ Fixing problematic update for blog ${id}`);
        finalBlogData = {
          ...blogData,
          published: blogData.isVisible,
          status: blogData.isVisible ? 'published' : 'draft'
        };
        console.log('🔧 Fixed data:', finalBlogData);
      }
      
      // Prepare the payload - CORRECTED for backend
      const payload = {
        title: finalBlogData.title || '',
        content: finalBlogData.content || '',
        excerpt: finalBlogData.excerpt || '',
        category: finalBlogData.category || '',
        tags: finalBlogData.tags || [],
        imageUrl: finalBlogData.imageUrl || finalBlogData.image || '',
        
        // CORRECT: Use published and status (not isPublished)
        published: finalBlogData.published !== undefined ? finalBlogData.published : 
                  (finalBlogData.status === 'published' || finalBlogData.isPublished || true),
        status: finalBlogData.status || (finalBlogData.published ? 'published' : 'draft')
      };
      
      console.log('📤 Sending payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error(`❌ Update failed:`, data);
        throw new Error(data.error || `HTTP ${response.status}: Failed to update blog`);
      }
      
      console.log(`✅ Blog ${id} updated successfully`);
      console.log('✅ Response:', { 
        published: data.data?.published, 
        status: data.data?.status 
      });
      console.groupEnd();
      
      return data;
    } catch (error) {
      console.error(`❌ Error updating blog ${id}:`, error);
      console.groupEnd();
      throw error;
    }
  },

  // Delete blog - ENHANCED VERSION WITH BETTER ERROR HANDLING
  deleteBlog: async (id) => {
    try {
      console.log(`🗑️ Attempting to delete blog ${id}`);
      
      // Check authentication
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }
      
      // Log what we're sending
      console.log(`🌐 DELETE request to: ${API_BASE_URL}/blogs/${id}`);
      console.log(`🔐 Token present: ${!!token}`);
      
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`📊 Delete response status: ${response.status}`);
      
      // Try to parse response as JSON
      let data;
      try {
        data = await response.json();
        console.log(`📦 Delete response data:`, data);
      } catch (jsonError) {
        console.error('❌ Error parsing delete response as JSON:', jsonError);
        // If it's not JSON, try to get text
        const text = await response.text();
        data = { message: text || 'Unknown error' };
      }
      
      // Handle different response structures
      if (!response.ok) {
        let errorMessage = `Delete failed with status ${response.status}`;
        
        // Try to extract meaningful error message
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        
        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = 'Unauthorized: Your session may have expired. Please login again.';
          // Clear invalid token
          localStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminToken');
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: You do not have permission to delete this blog.';
        } else if (response.status === 404) {
          errorMessage = 'Blog not found. It may have already been deleted.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Success response
      console.log(`✅ Blog ${id} deleted successfully`);
      
      // Remove from protection if it was protected
      if (protectedBlogs.has(id)) {
        protectedBlogs.delete(id);
        console.log(`🛡️ Removed blog ${id} from protection (deleted)`);
      }
      
      // Return consistent success structure
      return {
        success: true,
        message: data.message || 'Blog deleted successfully',
        data: data.data || data,
        blogId: id
      };
      
    } catch (error) {
      console.error(`❌ Error deleting blog ${id}:`, error);
      
      // Enhance error message for network issues
      let errorMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and ensure backend is running.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      throw new Error(errorMessage);
    }
  },

  // Upload image to backend
  uploadImage: async (file) => {
    try {
      console.log('📤 Starting image upload to backend:', {
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
      });
      
      const formData = new FormData();
      formData.append('image', file);
      
      // Get token for authorization (required for /api/admin/upload)
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }
      
      console.log('🌐 Uploading to:', `${API_BASE_URL.replace('/api', '')}/admin/upload`);
      
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
      });
      
      console.log('📊 Upload response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('❌ Upload error details:', errorData);
        } catch (jsonError) {
          // If response is not JSON
          const text = await response.text();
          console.error('❌ Upload error text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ Upload successful response:', result);
      
      if (!result.success) {
        throw new Error(result.message || result.error || 'Upload failed');
      }
      
      // Return with consistent structure
      return {
        success: true,
        imageUrl: result.data?.url || result.imageUrl,
        ...result
      };
      
    } catch (error) {
      console.error('❌ Image upload error:', error);
      
      // More specific error messages
      let userMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Cannot connect to upload server. Check if backend is running.';
      } else if (error.message.includes('413')) {
        userMessage = 'File too large. Maximum size is 5MB.';
      } else if (error.message.includes('401')) {
        userMessage = 'Authentication required. Please login again.';
        // Redirect to login if token is invalid
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else if (error.message.includes('Only image files')) {
        userMessage = 'Only image files (JPEG, PNG, GIF, WEBP) are allowed.';
      }
      
      throw new Error(userMessage);
    }
  },

  // Test upload endpoint
  testUploadEndpoint: async () => {
    try {
      console.log('🔍 Testing upload endpoint...');
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found. Please login first.'
        };
      }
      
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/upload`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: data.message || 'Upload endpoint is working',
          details: data,
          endpoint: `${API_BASE_URL.replace('/api', '')}/admin/upload`
        };
      } else {
        const errorText = await response.text();
        console.error('❌ Upload endpoint test failed:', response.status, errorText);
        
        return {
          success: false,
          message: `Endpoint returned ${response.status}: ${errorText.substring(0, 100)}`,
          status: response.status,
          endpoint: `${API_BASE_URL.replace('/api', '')}/admin/upload`
        };
      }
    } catch (error) {
      console.error('❌ Upload endpoint test failed:', error);
      return {
        success: false,
        message: `Cannot connect to upload endpoint: ${error.message}`,
        error: error.message,
        endpoint: `${API_BASE_URL.replace('/api', '')}/admin/upload`
      };
    }
  },

  // Quick test without authentication (for debugging)
  testUploadNoAuth: async () => {
    try {
      console.log('🔍 Testing upload endpoint without auth...');
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/upload/test`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Public upload test endpoint is working',
          details: data
        };
      }
      
      return {
        success: false,
        message: `Public test endpoint returned ${response.status}`,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        message: `Cannot connect to public test endpoint: ${error.message}`
      };
    }
  },

  // Test if delete endpoint is accessible (for debugging)
  testDeleteEndpoint: async (id = 'test') => {
    try {
      console.log(`🔍 Testing delete endpoint for blog ID: ${id}`);
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found. Please login first.',
          endpoint: `${API_BASE_URL}/blogs/${id}`
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`📊 Delete test response status: ${response.status}`);
      
      if (response.status === 404) {
        // 404 is okay for testing - it means the endpoint exists but blog doesn't
        return {
          success: true,
          message: 'Delete endpoint is accessible (404 means blog not found, but endpoint works)',
          status: response.status,
          endpoint: `${API_BASE_URL}/blogs/${id}`
        };
      }
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Delete endpoint is working',
          details: data,
          endpoint: `${API_BASE_URL}/blogs/${id}`
        };
      }
      
      const errorText = await response.text();
      return {
        success: false,
        message: `Delete endpoint returned ${response.status}: ${errorText.substring(0, 100)}`,
        status: response.status,
        endpoint: `${API_BASE_URL}/blogs/${id}`
      };
      
    } catch (error) {
      console.error('❌ Delete endpoint test failed:', error);
      return {
        success: false,
        message: `Cannot connect to delete endpoint: ${error.message}`,
        error: error.message,
        endpoint: `${API_BASE_URL}/blogs/${id}`
      };
    }
  }
};

// ============================================
// 🎯 DEBUGGING UTILITIES (Optional)
// ============================================

// Monitor a blog for auto-draft changes
window.monitorBlog = async (blogId, duration = 60000) => {
  console.log(`👀 Monitoring blog ${blogId} for ${duration/1000}s...`);
  
  const startTime = Date.now();
  let checkCount = 0;
  
  const checkStatus = async () => {
    checkCount++;
    const elapsed = Date.now() - startTime;
    
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`);
      const data = await response.json();
      
      console.log(`[${checkCount}] ${elapsed/1000}s:`, {
        published: data.data?.published,
        status: data.data?.status,
        updatedAt: data.data?.updatedAt,
        protected: protectedBlogs.has(blogId)
      });
      
      // Auto-fix if it becomes draft and is protected
      if (data.data && !data.data.published && protectedBlogs.has(blogId)) {
        console.log(`⚠️ Auto-fixing draft for protected blog ${blogId}`);
        await blogService.updateBlog(blogId, {
          published: true,
          status: 'published',
          _monitorFixed: Date.now()
        });
      }
    } catch (error) {
      console.error(`Check ${checkCount} failed:`, error);
    }
    
    if (elapsed < duration) {
      setTimeout(checkStatus, 5000);
    } else {
      console.log(`👀 Monitoring completed for blog ${blogId}`);
    }
  };
  
  checkStatus();
};

console.log('✅ blogService loaded with auto-draft protection system');