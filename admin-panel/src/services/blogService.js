// blogService.js - COMPLETE FIXED VERSION
import axios from 'axios';

// Use environment variable or fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                     process.env.REACT_APP_API_URL || 
                     'http://localhost:5000/api';

console.log('🌐 Blog Service Configuration:', {
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  hasCustomURL: !!process.env.REACT_APP_API_BASE_URL
});

// Create axios instance with better defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // Increase timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies
});

// Enhanced request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Try multiple token locations
    const token = localStorage.getItem('adminToken') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('adminToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = Date.now();
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    };
    
    console.error('❌ API Error Details:', errorDetails);
    
    // Handle specific errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('🔒 Authentication expired');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Don't redirect automatically - let component handle it
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error - Check if backend is running');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - Server might be slow');
    }
    
    // Return a structured error
    return Promise.reject({
      ...error,
      serviceError: true,
      userMessage: error.response?.data?.message || 
                  error.response?.data?.error || 
                  'Network error. Please check your connection.',
      originalError: error
    });
  }
);

// Helper function to extract data from response
const extractData = (response) => {
  // Handle different response structures
  if (response.data && response.data.data !== undefined) {
    return response.data.data;
  }
  if (response.data) {
    return response.data;
  }
  return response;
};

export const blogService = {
  // Test backend connection
  async testConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      
      // Try health endpoint
      const healthUrl = API_BASE_URL.replace('/api', '') + '/api/health';
      console.log('Testing health endpoint:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);
      
      if (response && response.ok) {
        const data = await response.json();
        return {
          success: true,
          connected: true,
          message: 'Backend is connected and responding',
          data
        };
      }
      
      // Try blogs endpoint as fallback
      const blogsResponse = await apiClient.get('/blogs').catch(() => null);
      if (blogsResponse) {
        return {
          success: true,
          connected: true,
          message: 'Blogs API is accessible'
        };
      }
      
      return {
        success: false,
        connected: false,
        message: 'Cannot connect to backend server'
      };
      
    } catch (error) {
      console.error('Connection test error:', error);
      return {
        success: false,
        connected: false,
        message: error.message || 'Connection test failed'
      };
    }
  },

  // Create new blog
  async createBlog(blogData) {
    try {
      console.log('🚀 SERVICE: Creating blog post', blogData);
      
      // Validate required fields
      const requiredFields = ['title', 'content', 'author'];
      const missingFields = requiredFields.filter(field => !blogData[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Ensure tags is an array
      const processedData = {
        ...blogData,
        tags: Array.isArray(blogData.tags) ? blogData.tags : 
              (typeof blogData.tags === 'string' ? blogData.tags.split(',').map(t => t.trim()).filter(t => t) : [])
      };
      
      console.log('📤 Processed data for API:', processedData);
      
      const response = await apiClient.post('/blogs', processedData);
      
      const result = {
        success: true,
        data: extractData(response),
        message: response.data?.message || 'Blog created successfully',
        response: response.data
      };
      
      console.log('✅ SERVICE: Blog creation successful', result);
      return result;
      
    } catch (error) {
      console.error('💥 SERVICE: Blog creation failed', error);
      
      // Check if it's a CORS error
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Possible CORS issue. Backend might not be configured for this origin.');
      }
      
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to create blog',
        message: error.userMessage || error.message || 'Failed to create blog',
        details: error.response?.data,
        isNetworkError: error.code === 'ERR_NETWORK'
      };
    }
  },

  // Get all blogs
  async getAll() {
    try {
      console.log('📡 SERVICE: Fetching all blogs');
      
      const response = await apiClient.get('/blogs');
      
      const blogs = extractData(response);
      
      console.log(`✅ SERVICE: Retrieved ${Array.isArray(blogs) ? blogs.length : 0} blogs`);
      
      return {
        success: true,
        blogs: Array.isArray(blogs) ? blogs : [],
        data: blogs,
        message: response.data?.message || 'Blogs fetched successfully',
        total: Array.isArray(blogs) ? blogs.length : 0
      };
      
    } catch (error) {
      console.error('💥 SERVICE: Error fetching blogs:', error);
      
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to fetch blogs',
        message: error.userMessage || error.message || 'Failed to fetch blogs',
        blogs: [], // Always return empty array on error
        total: 0
      };
    }
  },

  // Get single blog
  async getBlogById(id) {
    try {
      console.log(`📡 SERVICE: Fetching blog ${id}`);
      
      const response = await apiClient.get(`/blogs/${id}`);
      
      console.log('✅ SERVICE: Blog retrieved successfully');
      
      return {
        success: true,
        data: extractData(response),
        blog: extractData(response),
        message: response.data?.message || 'Blog fetched successfully'
      };
      
    } catch (error) {
      console.error(`💥 SERVICE: Error fetching blog ${id}:`, error);
      
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to fetch blog',
        message: error.userMessage || error.message || 'Failed to fetch blog',
        statusCode: error.response?.status
      };
    }
  },

  // Update blog
  async updateBlog(id, blogData) {
    try {
      console.log(`📡 SERVICE: Updating blog ${id}`, blogData);
      
      const response = await apiClient.put(`/blogs/${id}`, blogData);
      
      console.log('✅ SERVICE: Blog updated successfully');
      
      return {
        success: true,
        data: extractData(response),
        message: response.data?.message || 'Blog updated successfully'
      };
      
    } catch (error) {
      console.error(`💥 SERVICE: Error updating blog ${id}:`, error);
      
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to update blog',
        message: error.userMessage || error.message || 'Failed to update blog'
      };
    }
  },

  // Delete blog
  async deleteBlog(id) {
    try {
      console.log(`📡 SERVICE: Deleting blog ${id}`);
      
      const response = await apiClient.delete(`/blogs/${id}`);
      
      console.log('✅ SERVICE: Blog deleted successfully');
      
      return {
        success: true,
        message: response.data?.message || 'Blog deleted successfully'
      };
      
    } catch (error) {
      console.error(`💥 SERVICE: Error deleting blog ${id}:`, error);
      
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to delete blog',
        message: error.userMessage || error.message || 'Failed to delete blog'
      };
    }
  },

  // Get statistics
  async getBlogStats() {
    try {
      console.log('📡 SERVICE: Fetching blog statistics');
      
      const response = await apiClient.get('/blogs/stats');
      
      console.log('✅ SERVICE: Statistics retrieved');
      
      return {
        success: true,
        data: extractData(response),
        stats: extractData(response),
        message: response.data?.message || 'Statistics fetched successfully'
      };
      
    } catch (error) {
      console.error('💥 SERVICE: Error fetching stats:', error);
      
      // Return mock stats if API fails
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to fetch statistics',
        message: error.userMessage || error.message || 'Failed to fetch statistics',
        data: { total: 0, published: 0, drafts: 0 }, // Mock data
        stats: { total: 0, published: 0, drafts: 0 }
      };
    }
  },

  // Quick test function
  async quickTest() {
    console.log('🧪 Running quick service test...');
    
    const tests = [
      { name: 'Connection Test', func: () => this.testConnection() },
      { name: 'Get Blogs Test', func: () => this.getAll() },
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`🧪 Running ${test.name}...`);
        const result = await test.func();
        results.push({
          test: test.name,
          success: result.success,
          message: result.message || 'No message',
          data: result.data ? 'Has data' : 'No data'
        });
      } catch (error) {
        results.push({
          test: test.name,
          success: false,
          error: error.message,
          message: 'Test failed'
        });
      }
    }
    
    console.log('🧪 Test Results:', results);
    return results;
  }
};

export default blogService;