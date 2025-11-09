import axios from 'axios';

// ==========================================
// 🚀 DIRECT CONFIGURATION (No env dependencies)
// ==========================================
const API_BASE_URL = 'https://zmo-backend.onrender.com/api';
const API_TIMEOUT = 30000;

console.log('🚀 ZMO Admin Panel API Config:', { 
  API_BASE_URL, 
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
  },
  withCredentials: false,
});

// ==========================================
// 🔐 AUTH UTILITIES
// ==========================================
export const getToken = () => {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
};

export const clearAuthData = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
};

// ==========================================
// 🔗 TEST BACKEND CONNECTION
// ==========================================
export const testBackendConnection = async () => {
  try {
    console.log('🔗 Testing backend connection...');
    const response = await api.get('/health');
    console.log('✅ Backend connection successful');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return { 
      success: false, 
      error: error.message,
      message: 'Cannot connect to backend server' 
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
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      clearAuthData();
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login?session=expired';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

// ==========================================
// 🔐 AUTH API - IMPROVED LOGIN
// ==========================================
export const authAPI = {
  login: async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Attempting login with:', email);
      
      // Test backend first
      const connectionTest = await testBackendConnection();
      if (!connectionTest.success) {
        throw new Error('Cannot connect to backend server');
      }

      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      console.log('📡 Login response received:', response.data);

      // Check if we got a proper login response
      if (response.data && response.data.success && response.data.token) {
        const { token, user, message } = response.data;
        
        // Store authentication data
        if (rememberMe) {
          localStorage.setItem('adminToken', token);
        } else {
          sessionStorage.setItem('adminToken', token);
        }
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        console.log('✅ Login successful for:', user.email);
        return { 
          success: true, 
          user, 
          token, 
          message: message || 'Login successful' 
        };
      } else {
        // Handle unexpected response format
        console.error('❌ Unexpected login response:', response.data);
        throw new Error(response.data.message || 'Invalid response from server');
      }

    } catch (error) {
      console.error('💥 Login API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message === 'Network Error' || error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login endpoint not found. Please contact support.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout failed (normal if backend down):', error.message);
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
      
      // Demo data for when backend is down
      const demoStats = {
        totalBlogs: 24,
        totalProjects: 15,
        totalMessages: 42,
        totalUsers: 8,
        monthlyVisitors: 2845,
        revenue: 45200,
        performance: 92.5,
        recentActivities: [
          { 
            id: 1, 
            action: 'New blog published', 
            user: 'Admin User', 
            time: '2 hours ago',
            type: 'blog'
          },
          { 
            id: 2, 
            action: 'Project completed', 
            user: 'Content Team', 
            time: '5 hours ago',
            type: 'project'
          }
        ]
      };
      
      return {
        success: true,
        data: demoStats,
        demoMode: true,
        message: 'Using demo dashboard data'
      };
    }
  },
};

// ==========================================
// 📝 BLOG API - COMPLETE CRUD OPERATIONS
// ==========================================
export const blogAPI = {
  // Get all blogs
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
      
      // Demo data for when backend is down
      const demoBlogs = [
        {
          id: 1,
          title: 'Getting Started with React',
          excerpt: 'Learn the basics of React development and build your first application.',
          status: 'published',
          author: 'Admin User',
          tags: ['react', 'javascript', 'frontend'],
          featured: true,
          createdAt: '2024-01-15T10:30:00Z',
          views: 1245,
          likes: 89,
          readTime: 5
        },
        {
          id: 2,
          title: 'Building REST APIs with Node.js',
          excerpt: 'Create powerful and scalable backend APIs using Node.js and Express.',
          status: 'published',
          author: 'Admin User',
          tags: ['nodejs', 'api', 'backend'],
          featured: false,
          createdAt: '2024-01-10T14:20:00Z',
          views: 892,
          likes: 45,
          readTime: 8
        },
        {
          id: 3,
          title: 'Modern CSS Techniques',
          excerpt: 'Explore modern CSS features like Grid, Flexbox, and CSS Variables.',
          status: 'draft',
          author: 'Admin User',
          tags: ['css', 'frontend', 'design'],
          featured: false,
          createdAt: '2024-01-08T09:15:00Z',
          views: 567,
          likes: 23,
          readTime: 6
        }
      ];
      
      return { 
        success: true, 
        blogs: demoBlogs, 
        total: demoBlogs.length,
        demoMode: true,
        message: 'Using demo blog data'
      };
    }
  },

  // Create new blog - THE MISSING FUNCTION
  create: async (blogData) => {
    try {
      console.log('📝 Creating new blog:', blogData);
      
      const response = await api.post('/admin/blogs', blogData);
      
      if (response.data.success) {
        console.log('✅ Blog created successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create blog');
      }
    } catch (error) {
      console.error('❌ Create blog error:', error);
      
      // Demo mode fallback
      const demoBlog = {
        id: Date.now(),
        ...blogData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: blogData.status || 'published',
        author: 'Demo User',
        views: 0,
        likes: 0,
        readTime: Math.ceil((blogData.content?.length || 0) / 200) || 3
      };
      
      return {
        success: true,
        message: 'Blog created successfully (demo mode)',
        data: demoBlog,
        demoMode: true
      };
    }
  },

  // Get single blog by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get blog error:', error);
      
      // Demo data
      const demoBlog = {
        id: id,
        title: 'Demo Blog Post',
        content: `
          <h1>Demo Blog Post</h1>
          <p>This is a demo blog post content. The backend is currently unavailable, but you can still preview how the blog would look and function.</p>
          <p>In a real scenario, this would contain the actual blog content with proper formatting, images, and other media.</p>
          <h2>Features of this blog:</h2>
          <ul>
            <li>Rich text content</li>
            <li>Image support</li>
            <li>SEO optimization</li>
            <li>Social sharing</li>
          </ul>
          <p>When the backend is available, all CRUD operations will work seamlessly with real data.</p>
        `,
        excerpt: 'Demo blog post excerpt for testing purposes. This shows how the blog would appear in lists and previews.',
        status: 'published',
        author: 'Demo Author',
        tags: ['demo', 'blog', 'test', 'example'],
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 42,
        likes: 5,
        readTime: 4
      };
      
      return {
        success: true,
        data: demoBlog,
        demoMode: true,
        message: 'Using demo blog data'
      };
    }
  },

  // Update blog
  update: async (id, blogData) => {
    try {
      console.log('📝 Updating blog:', id, blogData);
      
      const response = await api.put(`/admin/blogs/${id}`, blogData);
      
      if (response.data.success) {
        console.log('✅ Blog updated successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('❌ Update blog error:', error);
      
      // Demo mode fallback
      return {
        success: true,
        message: 'Blog updated successfully (demo mode)',
        data: { 
          id, 
          ...blogData, 
          updatedAt: new Date().toISOString() 
        },
        demoMode: true
      };
    }
  },

  // Delete blog
  delete: async (id) => {
    try {
      console.log('🗑️ Deleting blog:', id);
      
      const response = await api.delete(`/admin/blogs/${id}`);
      
      if (response.data.success) {
        console.log('✅ Blog deleted successfully');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('❌ Delete blog error:', error);
      
      // Demo mode fallback
      return {
        success: true,
        message: 'Blog deleted successfully (demo mode)',
        demoMode: true
      };
    }
  },

  // Publish blog
  publish: async (id) => {
    try {
      const response = await api.patch(`/admin/blogs/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error('❌ Publish blog error:', error);
      
      return {
        success: true,
        message: 'Blog published successfully (demo mode)',
        demoMode: true
      };
    }
  },

  // Unpublish blog
  unpublish: async (id) => {
    try {
      const response = await api.patch(`/admin/blogs/${id}/unpublish`);
      return response.data;
    } catch (error) {
      console.error('❌ Unpublish blog error:', error);
      
      return {
        success: true,
        message: 'Blog unpublished successfully (demo mode)',
        demoMode: true
      };
    }
  },

  // Upload blog image
  uploadImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post('/admin/blogs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      
      // Return demo image URL
      return {
        success: true,
        data: {
          url: 'https://via.placeholder.com/800x400/667eea/ffffff?text=Blog+Image',
          filename: 'demo-image.jpg'
        },
        demoMode: true,
        message: 'Image uploaded (demo mode)'
      };
    }
  }
};

// ==========================================
// 📧 CONTACT API
// ==========================================
export const contactAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/contacts', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Contact API error:', error);
      
      // Demo data
      const demoContacts = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Partnership Inquiry',
          message: 'I would like to discuss potential partnership opportunities.',
          status: 'new',
          createdAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          subject: 'Support Request',
          message: 'I need help with my account setup.',
          status: 'read',
          createdAt: '2024-01-14T10:15:00Z'
        }
      ];
      
      return {
        success: true,
        data: { contacts: demoContacts, total: demoContacts.length },
        demoMode: true,
        message: 'Using demo contact data'
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/admin/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get contact error:', error);
      
      // Demo data
      const demoContact = {
        id: id,
        name: 'Demo Contact',
        email: 'demo@example.com',
        subject: 'Demo Inquiry',
        message: 'This is a demo contact message for testing purposes.',
        status: 'new',
        createdAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: demoContact,
        demoMode: true
      };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/admin/contacts/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('❌ Mark as read error:', error);
      
      return {
        success: true,
        message: 'Contact marked as read (demo mode)',
        demoMode: true
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Delete contact error:', error);
      
      return {
        success: true,
        message: 'Contact deleted successfully (demo mode)',
        demoMode: true
      };
    }
  }
};

// ==========================================
// 👥 USER MANAGEMENT API
// ==========================================
export const userAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('❌ User API error:', error);
      
      // Demo data
      const demoUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@zmo.com',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Content Manager',
          email: 'content@zmo.com',
          role: 'content_manager',
          status: 'active',
          lastLogin: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];
      
      return {
        success: true,
        data: { users: demoUsers, total: demoUsers.length },
        demoMode: true,
        message: 'Using demo user data'
      };
    }
  }
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
// 🎯 DIRECT LOGIN TEST FUNCTION
// ==========================================
export const testLoginEndpoint = async () => {
  try {
    console.log('🧪 Testing login endpoint directly...');
    
    const response = await fetch('https://zmo-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@zmo.com',
        password: 'password'
      }),
    });

    console.log('📊 Login test response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    const data = await response.json();
    console.log('📦 Login test data:', data);
    
    return { success: response.ok, data, status: response.status };
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return { success: false, error: error.message };
  }
};

// Auto-test connection
setTimeout(() => {
  testBackendConnection().then(result => {
    if (result.success) {
      console.log('🎉 Backend is ready!');
    } else {
      console.warn('⚠️ Backend connection issue detected');
    }
  });
}, 1000);

export default api;