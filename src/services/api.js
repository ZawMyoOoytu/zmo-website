// admin-panel/src/services/api.js - COMPLETE FIXED VERSION
import axios from 'axios';

// ==========================================
// 🎯 HARDCODED CONFIGURATION FOR RENDER
// ==========================================
const API_BASE_URL = 'https://zmo-backend.onrender.com/api';
const API_TIMEOUT = 30000;

console.log('🎯 Admin Panel API: Using Render Backend:', API_BASE_URL);

// ==========================================
// 🛠️ ENHANCED AXIOS INSTANCE
// ==========================================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'zmo-admin-panel',
    'X-Client-Version': '2.0.0',
    'X-Platform': 'web'
  },
  withCredentials: false,
});

// ==========================================
// 🔐 ENHANCED AUTH UTILITIES
// ==========================================
export const getToken = () => {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
};

export const clearAuthData = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
  console.log('🔐 Auth data cleared');
};

// ==========================================
// 🔗 ENHANCED BACKEND CONNECTION TEST
// ==========================================
export const testBackendConnection = async () => {
  try {
    console.log('🔗 Testing backend connection to:', API_BASE_URL);
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return { 
      success: true, 
      data: response.data,
      message: 'Backend is healthy and responsive'
    };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return { 
      success: false, 
      error: error.message,
      message: 'Cannot connect to backend server. Please check if the server is running.',
      details: {
        url: API_BASE_URL,
        status: error.response?.status,
        code: error.code
      }
    };
  }
};

// ==========================================
// 🔄 ENHANCED REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request tracking
    config.headers['X-Request-ID'] = Date.now().toString(36);
    config.headers['X-Client-Timestamp'] = new Date().toISOString();
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      timestamp: config.headers['X-Client-Timestamp']
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ==========================================
// 📡 ENHANCED RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
      success: response.data?.success,
      message: response.data?.message
    });
    return response;
  },
  (error) => {
    const requestInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    };

    console.error('❌ API Error:', requestInfo);

    // Enhanced error handling
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing auth data');
      clearAuthData();
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login?session=expired';
        }, 1000);
      }
    } else if (error.response?.status === 403) {
      console.error('🚫 Access forbidden - insufficient permissions');
    } else if (error.response?.status === 404) {
      console.error('🔍 Endpoint not found - check backend routes');
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network error - check internet connection');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - server taking too long to respond');
    }
    
    return Promise.reject(error);
  }
);

// ==========================================
// 🔐 ENHANCED AUTH API
// ==========================================
export const authAPI = {
  login: async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Attempting login with:', email);

      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      console.log('📡 Login response received:', response.data);

      // Validate response structure
      if (response.data && response.data.success && response.data.token) {
        const { token, user, message } = response.data;
        
        // Store authentication data
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user)); // Always store user in localStorage
        
        console.log('✅ Login successful for:', user.email);
        return { 
          success: true, 
          user, 
          token, 
          message: message || 'Login successful' 
        };
      } else {
        console.error('❌ Unexpected login response format:', response.data);
        throw new Error(response.data?.message || 'Invalid response from server');
      }

    } catch (error) {
      console.error('💥 Login API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message === 'Network Error' || error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection and ensure the backend is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login endpoint not found. Please contact support.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  logout: async () => {
    try {
      // Only attempt logout if we have a token
      const token = getToken();
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.log('Logout API call failed (normal if backend down):', error.message);
    } finally {
      clearAuthData();
      console.log('✅ User logged out successfully');
      return { 
        success: true, 
        message: 'Logout successful' 
      };
    }
  },
  
  verify: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/auth/verify');
      if (response.data.success) {
        console.log('✅ Token verification successful');
        return response.data;
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification error:', error.message);
      clearAuthData();
      throw new Error('Session expired. Please login again.');
    }
  },
  
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('adminUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  isAuthenticated: () => {
    const token = getToken();
    const user = authAPI.getCurrentUser();
    return !!(token && user);
  },

  // Get demo login credentials
  getDemoCredentials: () => {
    return {
      email: 'admin@zmo.com',
      password: 'password'
    };
  }
};

// ==========================================
// 📊 ENHANCED DASHBOARD API
// ==========================================
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
      
      // Enhanced demo data
      const demoStats = {
        totalBlogs: 24,
        totalProjects: 15,
        totalMessages: 42,
        totalUsers: 8,
        monthlyVisitors: 2845,
        revenue: 45200,
        performance: 92.5,
        server: {
          status: 'healthy',
          responseTime: '125ms',
          uptime: Math.floor(Math.random() * 1000000)
        },
        recentActivities: [
          { 
            id: 1, 
            action: 'New blog published', 
            user: 'Admin User', 
            time: '2 hours ago',
            type: 'blog',
            icon: '📝'
          },
          { 
            id: 2, 
            action: 'Project completed', 
            user: 'Content Team', 
            time: '5 hours ago',
            type: 'project',
            icon: '🚀'
          },
          { 
            id: 3, 
            action: 'User registered', 
            user: 'System', 
            time: '1 day ago',
            type: 'user',
            icon: '👤'
          }
        ],
        chartData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          visitors: [65, 59, 80, 81, 56, 55, 70],
          revenue: [28, 48, 40, 19, 86, 27, 45],
          projects: [5, 8, 12, 6, 15, 10, 8]
        }
      };
      
      return {
        success: true,
        data: demoStats,
        demoMode: true,
        message: 'Using demo dashboard data - Backend connection issue'
      };
    }
  },
};

// ==========================================
// 📝 ENHANCED BLOG API WITH CORRECT ENDPOINTS
// ==========================================
export const blogAPI = {
  // Get all blogs (Admin protected) - FIXED ENDPOINT
  getAll: async (params = {}) => {
    try {
      console.log('📝 Fetching blogs from:', `${API_BASE_URL}/blogs`);
      const response = await api.get('/blogs', { params });
      const blogs = response.data.success && response.data.data 
        ? response.data.data 
        : [];
      
      console.log(`✅ Loaded ${blogs.length} blogs from backend`);
      return { 
        success: true, 
        blogs, 
        total: blogs.length, 
        pagination: response.data?.pagination 
      };
    } catch (error) {
      console.error('❌ Blog API error:', error);
      throw new Error('Failed to fetch blogs: ' + error.message);
    }
  },

  // Create new blog - FIXED ENDPOINT
  create: async (blogData) => {
    try {
      console.log('📝 Creating new blog:', blogData);
      
      const response = await api.post('/blogs', blogData);
      
      if (response.data.success) {
        console.log('✅ Blog created successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create blog');
      }
    } catch (error) {
      console.error('❌ Create blog error:', error);
      throw new Error('Failed to create blog: ' + error.message);
    }
  },

  // Get single blog by ID - FIXED ENDPOINT
  getById: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get blog error:', error);
      throw new Error('Failed to fetch blog: ' + error.message);
    }
  },

  // Update blog - FIXED ENDPOINT
  update: async (id, blogData) => {
    try {
      console.log('📝 Updating blog:', id, blogData);
      
      const response = await api.put(`/blogs/${id}`, blogData);
      
      if (response.data.success) {
        console.log('✅ Blog updated successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('❌ Update blog error:', error);
      throw new Error('Failed to update blog: ' + error.message);
    }
  },

  // Delete blog - FIXED ENDPOINT
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting blog:', id);
      
      const response = await api.delete(`/blogs/${id}`);
      
      if (response.data.success) {
        console.log('✅ Blog deleted successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('❌ Delete blog error:', error);
      throw new Error('Failed to delete blog: ' + error.message);
    }
  }
};

// ==========================================
// 🛠️ PROJECTS API ENDPOINTS - FIXED
// ==========================================
export const projectsAPI = {
  // Get all projects
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/projects', { params });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        total: response.data.pagination?.total || 0
      };
    } catch (error) {
      console.error('❌ Projects API error:', error);
      throw new Error('Failed to fetch projects: ' + error.message);
    }
  },

  // Get single project by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get project error:', error);
      throw new Error('Failed to fetch project: ' + error.message);
    }
  },

  // Create new project - FIXED ENDPOINT
  create: async (projectData) => {
    try {
      console.log('🛠️ Creating new project:', projectData);
      
      const response = await api.post('/projects', projectData);
      
      if (response.data.success) {
        console.log('✅ Project created successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('❌ Create project error:', error);
      throw new Error('Failed to create project: ' + error.message);
    }
  },

  // Update project - FIXED ENDPOINT
  update: async (id, projectData) => {
    try {
      console.log('🛠️ Updating project:', id, projectData);
      
      const response = await api.put(`/projects/${id}`, projectData);
      
      if (response.data.success) {
        console.log('✅ Project updated successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('❌ Update project error:', error);
      throw new Error('Failed to update project: ' + error.message);
    }
  },

  // Delete project - FIXED ENDPOINT
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting project:', id);
      
      const response = await api.delete(`/projects/${id}`);
      
      if (response.data.success) {
        console.log('✅ Project deleted successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('❌ Delete project error:', error);
      throw new Error('Failed to delete project: ' + error.message);
    }
  }
};

// ==========================================
// 🏥 HEALTH CHECK API
// ==========================================
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return { 
        success: true, 
        data: response.data, 
        message: 'Backend is healthy and responsive',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return { 
        success: false, 
        error: error.message, 
        message: 'Backend health check failed',
        timestamp: new Date().toISOString()
      };
    }
  }
};

// ==========================================
// 🔄 ENHANCED AUTO-CONNECTION TEST ON LOAD
// ==========================================
// Test connection when module loads
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🔗 Auto-testing backend connection...');
    testBackendConnection().then(result => {
      if (result.success) {
        console.log('🎉 Backend connection successful! Ready for operations.');
      } else {
        console.warn('⚠️ Backend connection issue:', result.message);
      }
    });
  }, 1000);
}

export default api;