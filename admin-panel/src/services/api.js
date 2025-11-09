import axios from 'axios';
import { config, isProduction } from '../utils/env';

// ==========================================
// 🚀 CONFIGURATION
// ==========================================
const API_BASE_URL = config.api.baseURL;
const API_TIMEOUT = config.api.timeout;

console.log('🚀 ZMO Admin Panel API Config:', { 
  API_BASE_URL, 
  ENVIRONMENT: config.app.env,
  APP_VERSION: config.app.version,
  API_TIMEOUT 
});

// ==========================================
// 🛠️ AXIOS INSTANCE
// ==========================================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'zmo-admin-panel',
    'X-Client-Version': config.app.version,
  },
  withCredentials: false,
});

// ==========================================
// 🔐 AUTH UTILITIES
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

export const clearAuthData = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
};

const showToast = (message, type = 'info') => {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { 
        message, 
        type, 
        duration: 5000 
      } 
    }));
  }
};

// ==========================================
// 🔗 TEST BACKEND CONNECTION - MOVED TO TOP OF EXPORTS
// ==========================================
export const testBackendConnection = async () => {
  try {
    console.log('🔗 Testing backend connection...', API_BASE_URL);
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data, message: 'Backend is healthy' };
  } catch (error) {
    console.error('❌ Backend connection failed:', {
      message: error.message,
      code: error.code,
      url: API_BASE_URL
    });
    
    let errorMessage = 'Cannot connect to backend';
    if (error.message === 'Network Error') {
      errorMessage = 'Cannot connect to backend server. The server might be down.';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'Connection blocked by CORS policy.';
    }
    
    return { 
      success: false, 
      error: error.message, 
      message: errorMessage 
    };
  }
};

// ==========================================
// 🔄 REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (!isProduction) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, { 
        hasToken: !!token 
      });
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
    if (!isProduction) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// ==========================================
// 🛡️ ERROR HANDLER
// ==========================================
const handleApiError = (error) => {
  const status = error.response?.status;
  const url = error.config?.url;

  console.error('❌ API Error:', {
    url,
    status,
    message: error.message,
    method: error.config?.method
  });

  switch (status) {
    case 401:
      clearAuthData();
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = `/login?session=expired&redirect=${encodeURIComponent(window.location.pathname)}`;
        }, 1000);
      }
      break;
    case 403:
      showToast('Access denied. You do not have permission for this action.', 'error');
      break;
    case 404:
      if (!isProduction) {
        console.warn('🔍 API endpoint not found:', url);
      }
      break;
    case 429:
      showToast('Too many requests. Please wait a moment and try again.', 'warning');
      break;
    case 500:
      showToast('Server error. Please try again later.', 'error');
      break;
    case 502:
    case 503:
    case 504:
      showToast('Backend service temporarily unavailable. Please try again in a moment.', 'error');
      break;
    default:
      if (error.code === 'ECONNABORTED') {
        showToast('Request timeout. Please check your connection and try again.', 'warning');
      } else if (error.message?.includes('CORS')) {
        console.error('❌ CORS Error - Request blocked by security policy');
        showToast('Connection blocked by security policy. Please try again.', 'error');
      } else if (error.message === 'Network Error') {
        console.error('❌ Network Error - Cannot connect to server');
        showToast('Cannot connect to server. Please check if the backend is running.', 'error');
      } else if (!error.response) {
        showToast('Cannot reach the server. Please check your internet connection.', 'error');
      }
      break;
  }
};

// ==========================================
// 🔐 AUTH API
// ==========================================
export const authAPI = {
  login: async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Attempting login to:', API_BASE_URL);
      
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const { success, token, user, message } = response.data;

      if (success && token) {
        setToken(token, rememberMe);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        console.log('✅ Login successful:', { 
          user: user.email, 
          role: user.role 
        });
        
        return { 
          success: true, 
          user, 
          token, 
          message 
        };
      } else {
        console.error('❌ Login failed:', message || 'Unknown error');
        throw new Error(message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Connection blocked by security policy. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      }
      
      throw new Error(errorMessage);
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('ℹ️ Backend logout failed (normal if offline):', error.message);
    } finally {
      clearAuthData();
      return { 
        success: true, 
        message: 'Logout successful' 
      };
    }
  },
  
  verify: async () => {
    try {
      const response = await api.get('/auth/verify');
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
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
};

// ==========================================
// 📊 DASHBOARD API
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
      throw new Error('Unable to load dashboard data. Please try again.');
    }
  },
};

// ==========================================
// 📝 BLOG API
// ==========================================
export const blogAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/blogs', { params });
      const blogs = response.data.success && response.data.data?.blogs 
        ? response.data.data.blogs 
        : [];
      
      return { 
        success: true, 
        blogs, 
        total: blogs.length, 
        pagination: response.data?.pagination 
      };
    } catch (error) {
      console.error('❌ Blog API error:', error);
      return { 
        success: false, 
        blogs: [], 
        total: 0,
        error: error.message 
      };
    }
  },
};

// ==========================================
// ❤️ HEALTH API
// ==========================================
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return { 
        success: true, 
        data: response.data, 
        message: 'Backend is healthy' 
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
// 🔄 AUTO-TEST CONNECTION IN DEVELOPMENT
// ==========================================
if (!isProduction) {
  setTimeout(() => {
    testBackendConnection().then(result => {
      if (!result.success) {
        console.warn('⚠️ Backend not available in development');
      }
    });
  }, 2000);
}

// Export utilities - FIXED: No duplicate getToken export
export { getToken };
export default api;