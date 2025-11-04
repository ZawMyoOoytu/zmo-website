// src/services/api.js - PRODUCTION READY WITH ENV VARIABLES
import axios from 'axios';

// Use environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL;
const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;
const ENVIRONMENT = process.env.REACT_APP_ENV;

console.log('🔧 Admin Panel Configuration:', {
  apiUrl: API_BASE_URL,
  adminUrl: ADMIN_URL,
  frontendUrl: FRONTEND_URL,
  environment: ENVIRONMENT,
  nodeEnv: process.env.NODE_ENV
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
    'X-Admin-Panel': 'zmo-admin-panel',
    'X-Environment': ENVIRONMENT
  },
  timeout: 15000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} from: ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorInfo = {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      code: error.code
    };
    
    console.error('❌ API Error:', errorInfo);
    
    // Handle specific errors
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing local storage');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    if (error.response?.status === 403) {
      console.log('🚫 Forbidden - insufficient permissions');
    }
    
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.log('🌐 Network error - backend might be down');
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login...', { email, environment: ENVIRONMENT });
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        console.log('✅ Login successful, token stored');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      console.log('✅ Logout successful');
      return { message: 'Logout successful' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },
  
  verify: async () => {
    try {
      const response = await api.get('/auth/verify');
      console.log('✅ Token verification successful');
      return response.data;
    } catch (error) {
      console.error('❌ Token verification failed:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Blog Management API
export const blogAPI = {
  getAll: async () => {
    try {
      console.log('📡 Fetching all blogs...');
      const response = await api.get('/admin/blogs');
      
      // Handle different response formats
      let blogs = [];
      if (Array.isArray(response.data)) {
        blogs = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        blogs = response.data.data;
      } else if (response.data?.blogs && Array.isArray(response.data.blogs)) {
        blogs = response.data.blogs;
      }
      
      console.log(`✅ Found ${blogs.length} blogs`);
      return blogs;
    } catch (error) {
      console.error('❌ Failed to fetch blogs:', error.response?.data || error.message);
      throw error;
    }
  },
  
  create: async (blogData) => {
    try {
      console.log('📝 Creating new blog...', { title: blogData.title });
      const response = await api.post('/admin/blogs', blogData);
      console.log('✅ Blog created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create blog:', error.response?.data || error.message);
      throw error;
    }
  },
  
  update: async (id, blogData) => {
    try {
      console.log('✏️ Updating blog...', { id, title: blogData.title });
      const response = await api.put(`/admin/blogs/${id}`, blogData);
      console.log('✅ Blog updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update blog:', error.response?.data || error.message);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting blog...', { id });
      const response = await api.delete(`/admin/blogs/${id}`);
      console.log('✅ Blog deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete blog:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      console.log('📖 Fetching blog by ID...', { id });
      const response = await api.get(`/admin/blogs/${id}`);
      console.log('✅ Blog fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch blog:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await api.get('/admin/dashboard/stats');
      console.log('✅ Stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getRecentActivity: async () => {
    try {
      console.log('🔄 Fetching recent activity...');
      const response = await api.get('/admin/dashboard/recent');
      console.log('✅ Recent activity fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch recent activity:', error.response?.data || error.message);
      return { activities: [] };
    }
  }
};

// Other APIs
export const projectAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/admin/projects');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return { projects: [] };
    }
  }
};

export const contactAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/admin/contacts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      return { contacts: [] };
    }
  }
};

// Utility functions
export const getAppUrls = () => ({
  admin: ADMIN_URL,
  frontend: FRONTEND_URL,
  api: API_BASE_URL,
  environment: ENVIRONMENT
});

// Test backend connection on app start
export const testBackendConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Backend connection test successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error.message);
    return false;
  }
};

// Initialize connection test
testBackendConnection();

export default api;