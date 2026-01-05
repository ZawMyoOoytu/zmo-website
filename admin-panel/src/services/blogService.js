// src/services/blogService.js - COMPLETE FIXED VERSION
const API_BASE_URL = 'https://zmo-backend.onrender.com/api';

// Get headers with optional token
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const blogService = {
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

  // Create new blog
  createBlog: async (blogData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}: Failed to create blog`);
      return data;
    } catch (error) {
      console.error('❌ Error creating blog:', error);
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

  // Fetch single blog by ID - FIXED VERSION
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

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      // Prepare the payload
      const payload = {
        title: blogData.title || '',
        content: blogData.content || '',
        excerpt: blogData.excerpt || '',
        category: blogData.category || '',
        tags: blogData.tags || [],
        imageUrl: blogData.imageUrl || '',
        isPublished: !!blogData.isPublished
      };
      
      console.log(`📤 Updating blog ${id} with:`, payload);
      
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}: Failed to update blog`);
      
      console.log(`✅ Blog ${id} updated successfully`);
      return data;
    } catch (error) {
      console.error(`❌ Error updating blog ${id}:`, error);
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete blog');
      return data;
    } catch (error) {
      console.error(`❌ Error deleting blog ${id}:`, error);
      throw error;
    }
  },

  // Upload image to backend - FIXED VERSION
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

  // Test upload endpoint - FIXED VERSION
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
  }
};