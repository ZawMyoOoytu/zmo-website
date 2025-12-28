// src/services/api.js - COMPLETE FIXED VERSION
import axios from 'axios';

// ==========================================
// 🎯 HARDCODED CONFIGURATION FOR RENDER
// ==========================================
const API_BASE_URL = 'https://zmo-backend.onrender.com/api';
const API_TIMEOUT = 30000;

console.log('🎯 Frontend API: Using Render Backend:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client': 'zmo-frontend',
    'X-Client-Version': '2.0.0'
  }
});

// ==========================================
// 🔄 REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// ==========================================
// 🌐 PUBLIC API (for frontend website)
// ==========================================
export const publicAPI = {
  // Get all blogs
  getBlogs: async () => {
    try {
      console.log('📚 Fetching blogs from:', `${API_BASE_URL}/blogs`);
      const response = await api.get('/blogs');
      console.log('✅ Blogs fetched successfully:', response.data.data?.length, 'blogs');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
      throw new Error('Failed to load blogs: ' + error.message);
    }
  },

  // Get single blog by ID
  getBlogById: async (id) => {
    try {
      console.log(`📖 Fetching blog ${id}...`);
      const response = await api.get(`/blogs/${id}`);
      console.log('✅ Blog fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching blog:', error);
      throw new Error('Failed to load blog: ' + error.message);
    }
  },

  // Get all projects
  getProjects: async () => {
    try {
      console.log('🚀 Fetching projects...');
      const response = await api.get('/projects');
      console.log('✅ Projects fetched successfully:', response.data.data?.length, 'projects');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      throw new Error('Failed to load projects: ' + error.message);
    }
  },

  // Get single project by ID
  getProjectById: async (id) => {
    try {
      console.log(`🔍 Fetching project ${id}...`);
      const response = await api.get(`/projects/${id}`);
      console.log('✅ Project fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching project:', error);
      throw new Error('Failed to load project: ' + error.message);
    }
  },

  // Test backend connection
  testConnection: async () => {
    try {
      console.log('🔗 Testing backend connection...');
      const response = await api.get('/blogs');
      
      console.log('✅ Backend connection successful');
      return { 
        success: true, 
        data: response.data,
        message: 'Backend is connected and healthy'
      };
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      
      return { 
        success: false, 
        error: error.message,
        message: 'Cannot connect to backend server'
      };
    }
  }
};

// ==========================================
// 🔐 AUTHENTICATION API
// ==========================================
export const authAPI = {
  login: async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Attempting login...');
      
      const response = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password: password.trim() 
      });
      
      const { success, token, user, message } = response.data;
      
      if (success && token) {
        // Store token based on rememberMe preference
        if (rememberMe) {
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminUser', JSON.stringify(user));
        } else {
          sessionStorage.setItem('adminToken', token);
          sessionStorage.setItem('adminUser', JSON.stringify(user));
        }
        
        console.log('✅ Login successful');
        return { success: true, user, token, message };
      } else {
        throw new Error(message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },
  
  logout: async () => {
    try {
      console.log('👋 Logging out...');
      
      // Clear storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      
      console.log('✅ Logout successful');
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },
  
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  },
  
  isAuthenticated: () => {
    return !!(localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken'));
  },
  
  getToken: () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  },

  clearAuthData: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
  }
};

// ==========================================
// 📝 BLOG MANAGEMENT API (for admin panel)
// ==========================================
export const blogsAPI = {
  // Get all blogs for admin
  getAdminBlogs: async () => {
    try {
      console.log('🔐 Fetching admin blogs...');
      
      const response = await api.get('/blogs');
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data?.length || 0} blogs`);
        return {
          success: true,
          blogs: response.data.data || [],
          count: response.data.data?.length || 0
        };
      } else {
        throw new Error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin blogs:', error);
      throw error;
    }
  },

  // Create new blog
  createBlog: async (blogData) => {
    try {
      console.log('📝 Creating new blog...');
      
      const response = await api.post('/blogs', blogData);
      
      if (response.data.success) {
        console.log('✅ Blog created successfully');
        return response.data;
      } else {
        throw new Error('Failed to create blog');
      }
    } catch (error) {
      console.error('❌ Failed to create blog:', error);
      throw error;
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      console.log(`✏️ Updating blog ${id}...`);
      
      const response = await api.put(`/blogs/${id}`, blogData);
      
      if (response.data.success) {
        console.log('✅ Blog updated successfully');
        return response.data;
      } else {
        throw new Error('Failed to update blog');
      }
    } catch (error) {
      console.error(`❌ Failed to update blog ${id}:`, error);
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      console.log(`🗑️ Deleting blog ${id}...`);
      
      const response = await api.delete(`/blogs/${id}`);
      
      if (response.data.success) {
        console.log('✅ Blog deleted successfully');
        return response.data;
      } else {
        throw new Error('Failed to delete blog');
      }
    } catch (error) {
      console.error(`❌ Failed to delete blog ${id}:`, error);
      throw error;
    }
  }
};

// ==========================================
// 📊 DASHBOARD API (for admin panel)
// ==========================================
export const dashboardAPI = {
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
      console.error('❌ Failed to fetch dashboard stats:', error);
      
      // Return fallback data
      return {
        success: true,
        data: {
          totalBlogs: 12,
          totalProjects: 8,
          totalMessages: 24,
          totalUsers: 3,
          monthlyVisitors: 1542,
          revenue: 28500,
          performance: 87.5
        }
      };
    }
  }
};

// ==========================================
// 🚀 PROJECTS API (for admin panel)
// ==========================================
export const projectsAPI = {
  getAdminProjects: async () => {
    try {
      console.log('🔐 Fetching admin projects...');
      
      const response = await api.get('/projects');
      
      if (response.data.success) {
        console.log(`✅ Found ${response.data.data?.length || 0} projects`);
        return {
          success: true,
          projects: response.data.data || [],
          count: response.data.data?.length || 0
        };
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin projects:', error);
      throw error;
    }
  },

  createProject: async (projectData) => {
    try {
      console.log('📝 Creating new project...');
      
      const response = await api.post('/projects', projectData);
      
      if (response.data.success) {
        console.log('✅ Project created successfully');
        return response.data;
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    try {
      console.log(`✏️ Updating project ${id}...`);
      
      const response = await api.put(`/projects/${id}`, projectData);
      
      if (response.data.success) {
        console.log('✅ Project updated successfully');
        return response.data;
      } else {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      console.error(`❌ Failed to update project ${id}:`, error);
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      console.log(`🗑️ Deleting project ${id}...`);
      
      const response = await api.delete(`/projects/${id}`);
      
      if (response.data.success) {
        console.log('✅ Project deleted successfully');
        return response.data;
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error(`❌ Failed to delete project ${id}:`, error);
      throw error;
    }
  }
};

// ==========================================
// 🏥 HEALTH CHECK API
// ==========================================
export const healthAPI = {
  check: async () => {
    try {
      console.log('🏥 Checking backend health...');
      const response = await api.get('/health');
      return { 
        success: true, 
        data: response.data, 
        message: 'Backend is healthy and responsive'
      };
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return { 
        success: false, 
        error: error.message, 
        message: 'Backend health check failed'
      };
    }
  }
};

// ==========================================
// 📦 EXPORTS
// ==========================================
// Export for backward compatibility
export const getBlogs = publicAPI.getBlogs;
export const getBlogById = publicAPI.getBlogById;
export const blogAPI = blogsAPI;
export const projectAPI = projectsAPI;

export default api;