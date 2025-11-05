// src/services/api.js - OPTIMIZED FOR RENDER BACKEND
import axios from 'axios';

// ==========================================
// 🚀 ENVIRONMENT CONFIGURATION
// ==========================================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com';
const API_BASE_PATH = process.env.REACT_APP_API_BASE_URL || `${API_BASE_URL}/api`;
const ADMIN_URL = process.env.REACT_APP_ADMIN_URL || 'https://zmo-admin.vercel.app';
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'https://zmo-frontend.vercel.app';
const ENVIRONMENT = process.env.REACT_APP_ENV || 'production';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 15000;

console.log('🔧 Frontend API Configuration:', {
  apiBaseURL: API_BASE_URL,
  apiBasePath: API_BASE_PATH,
  adminUrl: ADMIN_URL,
  frontendUrl: FRONTEND_URL,
  environment: ENVIRONMENT,
  timeout: API_TIMEOUT,
  nodeEnv: process.env.NODE_ENV
});

// ==========================================
// 🛠️ AXIOS INSTANCE CONFIGURATION
// ==========================================
const api = axios.create({
  baseURL: API_BASE_PATH,
  timeout: API_TIMEOUT,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client': 'zmo-admin-panel',
    'X-Client-Version': process.env.REACT_APP_VERSION || '2.0.0',
    'X-Environment': ENVIRONMENT,
    'X-Platform': 'vercel',
    'X-Backend-Platform': 'render'
  },
  withCredentials: false, // Set to true if using cookies
});

// ==========================================
// 🔄 REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      timeout: config.timeout
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ==========================================
// 📡 RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
      data: response.data?.success !== undefined ? response.data : 'Response received'
    });
    
    return response;
  },
  (error) => {
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      code: error.code,
      requestId: error.config?.headers?.['X-Request-ID']
    };
    
    console.error('❌ API Error:', errorInfo);
    
    // Enhanced error handling
    handleApiError(error);
    
    return Promise.reject(error);
  }
);

// ==========================================
// 🛡️ ERROR HANDLER
// ==========================================
const handleApiError = (error) => {
  const status = error.response?.status;
  
  switch (status) {
    case 401:
      console.log('🔐 Unauthorized - Invalid or expired token');
      clearAuthData();
      redirectToLogin();
      break;
      
    case 403:
      console.log('🚫 Forbidden - Insufficient permissions');
      showToast('You do not have permission to perform this action', 'error');
      break;
      
    case 404:
      console.log('🔍 Not Found - API endpoint does not exist');
      break;
      
    case 429:
      console.log('🚦 Rate Limited - Too many requests');
      showToast('Too many requests, please try again later', 'warning');
      break;
      
    case 500:
      console.log('💥 Server Error - Backend issue');
      showToast('Server error, please try again later', 'error');
      break;
      
    case 502:
    case 503:
    case 504:
      console.log('🌐 Backend Unavailable - Render backend might be starting');
      showToast('Backend service is temporarily unavailable', 'error');
      break;
      
    default:
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        console.log('🌐 Network Error - Cannot connect to backend');
        showToast('Cannot connect to server. Please check your connection.', 'error');
      } else if (error.code === 'TIMEOUT') {
        console.log('⏰ Timeout - Request took too long');
        showToast('Request timeout. Please try again.', 'warning');
      }
      break;
  }
};

// ==========================================
// 🔐 AUTHENTICATION UTILITIES
// ==========================================
const getToken = () => {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
};

const setToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('adminToken', token);
  } else {
    sessionStorage.setItem('adminToken', token);
  }
};

const clearAuthData = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
  console.log('🧹 Auth data cleared');
};

const redirectToLogin = () => {
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    console.log('🔄 Redirecting to login...');
    setTimeout(() => {
      window.location.href = '/login?session=expired';
    }, 1500);
  }
};

// ==========================================
// 🛠️ UTILITY FUNCTIONS
// ==========================================
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const showToast = (message, type = 'info') => {
  // You can integrate with your toast notification system
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  // Example with browser alert (replace with your toast system)
  if (type === 'error' && ENVIRONMENT === 'development') {
    // alert(`[${type}] ${message}`); // Uncomment for quick debugging
  }
};

// ==========================================
// 🔐 AUTHENTICATION API
// ==========================================
const authAPI = {
  login: async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Attempting login...', { 
        email: email.substring(0, 5) + '...', // Log partial email for privacy
        rememberMe 
      });
      
      const response = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password: password.trim() 
      });
      
      const { success, token, user, message } = response.data;
      
      if (success && token) {
        setToken(token, rememberMe);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        console.log('✅ Login successful', {
          user: user.name,
          role: user.role,
          tokenPreview: token.substring(0, 20) + '...'
        });
        
        return { success: true, user, token, message };
      } else {
        throw new Error(message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.'
      );
    }
  },
  
  logout: async () => {
    try {
      console.log('👋 Logging out...');
      
      // Call backend logout if needed
      await api.post('/auth/logout').catch(() => {
        console.log('⚠️ Backend logout failed, proceeding with frontend logout');
      });
      
      clearAuthData();
      console.log('✅ Logout successful');
      
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      clearAuthData(); // Always clear auth data on logout attempt
      throw error;
    }
  },
  
  verify: async () => {
    try {
      console.log('🔍 Verifying authentication token...');
      const response = await api.get('/auth/verify');
      
      if (response.data.success) {
        console.log('✅ Token verification successful', {
          user: response.data.user?.name
        });
        return response.data;
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification failed:', error.response?.data?.message || error.message);
      clearAuthData();
      throw error;
    }
  },
  
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('adminUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  },
  
  isAuthenticated: () => {
    return !!getToken();
  }
};

// ==========================================
// 📊 DASHBOARD API
// ==========================================
const dashboardAPI = {
  getStats: async () => {
    try {
      console.log('📊 Fetching dashboard statistics...');
      const response = await api.get('/admin/dashboard/stats');
      
      if (response.data.success) {
        console.log('✅ Dashboard stats fetched successfully');
        return response.data;
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  
  getAnalytics: async (period = 'monthly') => {
    try {
      const response = await api.get(`/admin/dashboard/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }
};

// ==========================================
// 📝 BLOG MANAGEMENT API
// ==========================================
const blogAPI = {
  getAll: async (params = {}) => {
    try {
      console.log('📚 Fetching blogs...', { params });
      const response = await api.get('/admin/blogs', { params });
      
      let blogs = [];
      if (response.data.success) {
        // Handle different response structures
        if (Array.isArray(response.data.data?.blogs)) {
          blogs = response.data.data.blogs;
        } else if (Array.isArray(response.data.blogs)) {
          blogs = response.data.blogs;
        } else if (Array.isArray(response.data.data)) {
          blogs = response.data.data;
        }
      }
      
      console.log(`✅ Found ${blogs.length} blogs`);
      return {
        success: true,
        blogs,
        pagination: response.data.data?.pagination,
        total: blogs.length
      };
    } catch (error) {
      console.error('❌ Failed to fetch blogs:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      console.log(`📖 Fetching blog ${id}...`);
      const response = await api.get(`/admin/blogs/${id}`);
      
      if (response.data.success) {
        console.log('✅ Blog fetched successfully');
        return response.data;
      } else {
        throw new Error('Blog not found');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch blog ${id}:`, error.response?.data?.message || error.message);
      throw error;
    }
  },
  
  create: async (blogData) => {
    try {
      console.log('📝 Creating new blog...', { 
        title: blogData.title,
        status: blogData.status 
      });
      
      const response = await api.post('/admin/blogs', blogData);
      
      if (response.data.success) {
        console.log('✅ Blog created successfully');
        return response.data;
      } else {
        throw new Error('Failed to create blog');
      }
    } catch (error) {
      console.error('❌ Failed to create blog:', error.response?.data?.message || error.message);
      throw error;
    }
  },
  
  update: async (id, blogData) => {
    try {
      console.log(`✏️ Updating blog ${id}...`, { 
        title: blogData.title 
      });
      
      const response = await api.put(`/admin/blogs/${id}`, blogData);
      
      if (response.data.success) {
        console.log('✅ Blog updated successfully');
        return response.data;
      } else {
        throw new Error('Failed to update blog');
      }
    } catch (error) {
      console.error(`❌ Failed to update blog ${id}:`, error.response?.data?.message || error.message);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting blog ${id}...`);
      const response = await api.delete(`/admin/blogs/${id}`);
      
      if (response.data.success) {
        console.log('✅ Blog deleted successfully');
        return response.data;
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (error) {
      console.error(`❌ Failed to delete blog ${id}:`, error.response?.data?.message || error.message);
      throw error;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/blogs/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update blog status:', error);
      throw error;
    }
  }
};

// Alias for compatibility
const blogsAPI = blogAPI;

// ==========================================
// 🚀 PROJECTS API
// ==========================================
const projectsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/projects', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return { success: false, projects: [], message: 'Failed to fetch projects' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  },
  
  create: async (projectData) => {
    try {
      const response = await api.post('/admin/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  },
  
  update: async (id, projectData) => {
    try {
      const response = await api.put(`/admin/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }
};

// Alias for compatibility
const projectAPI = projectsAPI;

// ==========================================
// 📧 CONTACTS API
// ==========================================
const contactsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/contacts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      return { success: false, contacts: [], message: 'Failed to fetch contacts' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      throw error;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/contacts/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update contact status:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  }
};

// Alias for compatibility
const contactAPI = contactsAPI;

// ==========================================
// 🌐 PUBLIC API (for frontend website)
// ==========================================
const publicAPI = {
  getBlogs: async (params = {}) => {
    try {
      const response = await api.get('/blogs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch public blogs:', error);
      return { success: false, blogs: [] };
    }
  },
  
  getBlogById: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch public blog:', error);
      throw error;
    }
  },
  
  getProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch public projects:', error);
      return { success: false, projects: [] };
    }
  }
};

// ==========================================
// 🛠️ UTILITY API FUNCTIONS
// ==========================================
const getAppUrls = () => ({
  admin: ADMIN_URL,
  frontend: FRONTEND_URL,
  api: API_BASE_URL,
  apiBase: API_BASE_PATH,
  environment: ENVIRONMENT
});

const testBackendConnection = async () => {
  try {
    console.log('🔗 Testing backend connection...');
    const response = await api.get('/health');
    
    console.log('✅ Backend connection test successful:', {
      status: response.data.status,
      environment: response.data.environment,
      database: response.data.database
    });
    
    return { 
      success: true, 
      data: response.data,
      message: 'Backend is connected and healthy'
    };
  } catch (error) {
    console.error('❌ Backend connection test failed:', {
      message: error.message,
      code: error.code,
      url: API_BASE_PATH + '/health'
    });
    
    return { 
      success: false, 
      error: error.message,
      message: 'Cannot connect to backend server'
    };
  }
};

// ==========================================
// 🚀 INITIALIZATION
// ==========================================
console.log('🚀 Initializing ZMO Admin API Service...');

// Test backend connection on app start (non-blocking)
setTimeout(() => {
  if (ENVIRONMENT === 'development') {
    testBackendConnection();
  }
}, 1000);

// ==========================================
// 📦 EXPORTS
// ==========================================
export {
  authAPI,
  blogAPI,
  blogsAPI,
  projectsAPI,
  projectAPI,
  dashboardAPI,
  contactsAPI,
  contactAPI,
  publicAPI,
  getAppUrls,
  testBackendConnection,
  clearAuthData,
  getToken
};

export default api;