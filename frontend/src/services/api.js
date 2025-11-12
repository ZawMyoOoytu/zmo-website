// src/services/api.js - PRODUCTION READY & LOCAL READY
import axios from 'axios';

// ==========================================
// 🚀 ENVIRONMENT CONFIGURATION
// ==========================================
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Dynamic configuration for different environments
const getApiConfig = () => {
  if (isDevelopment) {
    return {
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 15000,
      debug: true
    };
  } else {
    return {
      baseURL: process.env.REACT_APP_API_URL || 'https://zmo-backend.onrender.com/api',
      timeout: 20000,
      debug: false
    };
  }
};

const apiConfig = getApiConfig();

console.log('🔧 API Configuration:', {
  environment: process.env.NODE_ENV,
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  debug: apiConfig.debug
});

// ==========================================
// 🛠️ AXIOS INSTANCE CONFIGURATION
// ==========================================
const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: { 
    'Content-Type': 'application/json',
    'X-Client': 'zmo-frontend',
    'X-Client-Version': '2.0.0',
    'X-Environment': process.env.NODE_ENV
  },
  withCredentials: false,
});

// ==========================================
// 🔄 REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    if (apiConfig.debug) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
    if (apiConfig.debug) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    };
    
    console.error('❌ API Error:', errorInfo);
    
    // Handle specific error cases
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
      break;
    case 403:
      console.log('🚫 Forbidden - Insufficient permissions');
      break;
    case 404:
      console.log('🔍 Not Found - API endpoint does not exist');
      break;
    case 429:
      console.log('🚦 Rate Limited - Too many requests');
      break;
    case 500:
      console.log('💥 Server Error - Backend issue');
      break;
    case 502:
    case 503:
    case 504:
      console.log('🌐 Backend Unavailable - Server might be starting');
      break;
    default:
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        console.log('🌐 Network Error - Cannot connect to backend');
      } else if (error.code === 'TIMEOUT') {
        console.log('⏰ Timeout - Request took too long');
      }
      break;
  }
};

// ==========================================
// 🛠️ UTILITY FUNCTIONS
// ==========================================
const showToast = (message, type = 'info') => {
  if (apiConfig.debug) {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
  }
};

// ==========================================
// 🌐 PUBLIC API (for frontend website)
// ==========================================
const publicAPI = {
  // Get all blogs
  getBlogs: async () => {
    try {
      if (apiConfig.debug) {
        console.log('📚 Fetching blogs...');
      }
      
      const response = await api.get('/blogs');
      
      if (response.data.success) {
        if (apiConfig.debug) {
          console.log(`✅ Found ${response.data.data?.length || 0} blogs`);
        }
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch blogs');
      }
    } catch (error) {
      console.error('❌ Failed to fetch blogs:', error.message);
      
      // Fallback data for development
      if (isDevelopment) {
        return {
          success: true,
          data: [
            {
              _id: 'dev-1',
              title: 'Development Blog Post',
              excerpt: 'This is sample content for development environment',
              content: 'This content is served from fallback data while the backend connects.',
              author: 'Developer',
              published: true,
              tags: ['development', 'sample'],
              readTime: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          count: 1,
          message: 'Development fallback data'
        };
      }
      
      throw error;
    }
  },

  // Get single blog by ID
  getBlogById: async (id) => {
    try {
      if (apiConfig.debug) {
        console.log(`📖 Fetching blog ${id}...`);
      }
      
      const response = await api.get(`/blogs/${id}`);
      
      if (response.data.success) {
        if (apiConfig.debug) {
          console.log('✅ Blog fetched successfully');
        }
        return response.data;
      } else {
        throw new Error('Blog not found');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch blog ${id}:`, error.message);
      
      // Fallback for development
      if (isDevelopment) {
        return {
          success: true,
          data: {
            _id: id,
            title: 'Development Blog Post',
            content: 'This is fallback content for development environment.',
            excerpt: 'Development blog excerpt',
            author: 'Developer',
            published: true,
            tags: ['development'],
            readTime: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          message: 'Development fallback data'
        };
      }
      
      throw error;
    }
  },

  // Get all projects
  getProjects: async () => {
    try {
      if (apiConfig.debug) {
        console.log('🚀 Fetching projects...');
      }
      
      const response = await api.get('/projects');
      
      if (response.data.success) {
        if (apiConfig.debug) {
          console.log(`✅ Found ${response.data.data?.length || 0} projects`);
        }
        return response.data;
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error.message);
      
      // Fallback data for development
      if (isDevelopment) {
        return {
          success: true,
          data: [
            {
              _id: 'dev-1',
              title: 'Development Project',
              description: 'This is a sample project for development environment',
              technologies: ['React', 'Node.js', 'MongoDB'],
              category: 'web',
              published: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          count: 1,
          message: 'Development fallback data'
        };
      }
      
      throw error;
    }
  },

  // Get single project by ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  },

  // Test backend connection
  testConnection: async () => {
    try {
      console.log('🔗 Testing backend connection...');
      const response = await api.get('/health');
      
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
// 🔐 AUTHENTICATION API (for admin panel)
// ==========================================
const authAPI = {
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
  }
};

// ==========================================
// 📝 BLOG MANAGEMENT API (for admin panel)
// ==========================================
const blogsAPI = {
  // Get all blogs for admin
  getAdminBlogs: async () => {
    try {
      console.log('🔐 Fetching admin blogs...');
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await api.get('/blogs', config);
      
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
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.post('/blogs', blogData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.put(`/blogs/${id}`, blogData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.delete(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
const dashboardAPI = {
  getStats: async () => {
    try {
      console.log('📊 Fetching dashboard statistics...');
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await api.get('/admin/dashboard/stats', config);
      
      if (response.data.success) {
        console.log('✅ Dashboard stats fetched successfully');
        return response.data;
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error);
      
      // Return fallback data for development
      if (isDevelopment) {
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
      
      throw error;
    }
  }
};

// ==========================================
// 🚀 PROJECTS API (for admin panel)
// ==========================================
const projectsAPI = {
  getAdminProjects: async () => {
    try {
      console.log('🔐 Fetching admin projects...');
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await api.get('/projects', config);
      
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
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.post('/projects', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.put(`/projects/${id}`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
// 🛠️ UTILITY FUNCTIONS
// ==========================================
const getAppUrls = () => ({
  api: apiConfig.baseURL.replace('/api', ''),
  environment: process.env.NODE_ENV,
  isDevelopment,
  isProduction
});

// Alias for backward compatibility
const blogAPI = blogsAPI;
const projectAPI = projectsAPI;

// ==========================================
// 🚀 INITIALIZATION
// ==========================================
console.log('🚀 ZMO API Service Initialized -', {
  environment: process.env.NODE_ENV,
  baseURL: apiConfig.baseURL
});

// Test backend connection on app start
if (isDevelopment) {
  setTimeout(() => {
    publicAPI.testConnection().then(result => {
      if (result.success) {
        console.log('✅ Backend connection verified');
      } else {
        console.log('⚠️ Backend connection issue:', result.message);
      }
    });
  }, 1000);
}

// ==========================================
// 📦 EXPORTS (ALL EXPORTS INCLUDED)
// ==========================================
export {
  // Public API (frontend website)
  publicAPI,
  
  // Authentication
  authAPI,
  
  // Blog management
  blogsAPI,
  blogAPI, // Alias for backward compatibility
  
  // Project management  
  projectsAPI,
  projectAPI, // Alias for backward compatibility
  
  // Dashboard
  dashboardAPI,
  
  // Utilities
  getAppUrls,
  
  // Individual functions for specific use cases
  showToast
};

export default api;