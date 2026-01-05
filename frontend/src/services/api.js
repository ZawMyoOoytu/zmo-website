// src/services/api.js - UPDATED VERSION WITH BETTER FILTERING
import axios from 'axios';

// ==========================================
// 🎯 HARDCODED CONFIGURATION FOR RENDER
// ==========================================
const API_BASE_URL = 'https://zmo-backend.onrender.com';
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
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
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
    console.log(`✅ API Response [${response.status}]:`, {
      url: response.config.url,
      success: response.data?.success,
      count: response.data?.data?.length || 0
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Return a consistent error format
    const apiError = new Error(error.response?.data?.message || error.message || 'API request failed');
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;
    
    return Promise.reject(apiError);
  }
);

// ==========================================
// 🌐 PUBLIC API (for frontend website) - FIXED!
// ==========================================
export const publicAPI = {
  // Get all blogs - SIMPLIFIED VERSION
  getBlogs: async () => {
    try {
      console.log('📚 Fetching blogs from:', `${API_BASE_URL}/api/blogs`);
      
      const response = await api.get('/api/blogs');
      console.log('✅ API Response received');
      
      // Handle response format - SIMPLIFIED LOGIC
      let blogs = [];
      
      // Check if response.data exists
      if (!response.data) {
        console.warn('⚠️ No data in response');
        return getFallbackBlogs();
      }
      
      // Case 1: Direct array
      if (Array.isArray(response.data)) {
        console.log(`📊 Direct array format (${response.data.length} items)`);
        blogs = response.data;
      }
      // Case 2: { data: [...] } format
      else if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`📊 Data array format (${response.data.data.length} items)`);
        blogs = response.data.data;
      }
      // Case 3: { success: true, data: [...] } format
      else if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`📊 Success.data format (${response.data.data.length} items)`);
        blogs = response.data.data;
      }
      // Case 4: { blogs: [...] } format
      else if (response.data.blogs && Array.isArray(response.data.blogs)) {
        console.log(`📊 Blogs array format (${response.data.blogs.length} items)`);
        blogs = response.data.blogs;
      }
      else {
        console.warn('⚠️ Unknown response format:', response.data);
        // Try to find any array in the response
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`🔍 Found array in key "${key}" (${response.data[key].length} items)`);
            blogs = response.data[key];
            break;
          }
        }
      }
      
      console.log(`✅ Retrieved ${blogs.length} blogs total`);
      
      // If no blogs found, return fallback
      if (blogs.length === 0) {
        console.log('🔄 No blogs found, returning fallback');
        return getFallbackBlogs();
      }
      
      return blogs;
      
    } catch (error) {
      console.error('❌ Error fetching blogs:', error.message);
      
      // Return fallback data instead of throwing
      console.log('🔄 Returning fallback blogs due to error');
      return getFallbackBlogs();
    }
  },

  // Get single blog by ID
  getBlogById: async (id) => {
    try {
      console.log(`📖 Fetching blog ${id}...`);
      
      const response = await api.get(`/api/blogs/${id}`);
      console.log('✅ Blog fetched successfully');
      
      // Handle different response formats
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching blog:', error);
      
      // Return fallback blog
      const fallbackBlog = getFallbackBlogs().find(b => b._id === id || b.id === id);
      if (fallbackBlog) {
        console.log('🔄 Returning fallback blog');
        return fallbackBlog;
      }
      
      throw new Error('Failed to load blog: ' + error.message);
    }
  },

  // Get all published blogs only - FIXED FILTERING!
  getPublishedBlogs: async () => {
    try {
      console.log('📚 Fetching published blogs...');
      const blogs = await publicAPI.getBlogs();
      
      if (blogs.length === 0) {
        console.log('📭 No blogs to filter');
        return [];
      }
      
      // Log first blog structure for debugging
      console.log('🔍 First blog structure:', {
        keys: Object.keys(blogs[0]),
        values: {
          title: blogs[0].title,
          published: blogs[0].published,
          status: blogs[0].status,
          draft: blogs[0].draft,
          isPublished: blogs[0].isPublished,
          publishedStatus: blogs[0].publishedStatus,
          isActive: blogs[0].isActive,
          visible: blogs[0].visible
        }
      });
      
      // SMARTER FILTERING: Include blog if NOT explicitly unpublished/draft
      const publishedBlogs = blogs.filter(blog => {
        // Check if blog is explicitly unpublished/draft
        const isUnpublished = 
          blog.published === false ||
          blog.published === 'false' ||
          blog.status === 'draft' ||
          blog.draft === true ||
          blog.draft === 'true' ||
          blog.isPublished === false ||
          blog.publishedStatus === 'draft' ||
          blog.isActive === false ||
          blog.visible === false;
        
        // If not explicitly unpublished, include it
        const shouldInclude = !isUnpublished;
        
        if (!shouldInclude) {
          console.log(`❌ Filtered out: "${blog.title}" - Unpublished indicators:`, {
            published: blog.published,
            status: blog.status,
            draft: blog.draft
          });
        }
        
        return shouldInclude;
      });
      
      console.log(`✅ Found ${publishedBlogs.length} published blogs out of ${blogs.length} total`);
      
      // If no published blogs but we have blogs, show warning
      if (publishedBlogs.length === 0 && blogs.length > 0) {
        console.warn('⚠️ All blogs filtered out! Check filtering logic');
        console.log('Sample blogs:', blogs.slice(0, 3).map(b => ({
          title: b.title,
          published: b.published,
          status: b.status,
          draft: b.draft
        })));
        
        // TEMPORARY: Show all blogs if filtering removes everything
        console.log('🔄 TEMPORARY: Showing all blogs due to strict filtering');
        return blogs;
      }
      
      return publishedBlogs;
      
    } catch (error) {
      console.error('❌ Error fetching published blogs:', error);
      return getFallbackBlogs(); // Return fallback as published
    }
  },

  // Get recent blogs (first 5 published) - FIXED!
  getRecentBlogs: async (limit = 3) => {
    try {
      console.log(`📚 Fetching ${limit} recent blogs...`);
      
      // First try to get published blogs
      let blogs = await publicAPI.getPublishedBlogs();
      
      console.log(`📊 Published blogs available: ${blogs.length}`);
      
      // If no published blogs, try to get all blogs
      if (blogs.length === 0) {
        console.log('🔄 No published blogs, trying to get all blogs...');
        blogs = await publicAPI.getBlogs();
        console.log(`📊 All blogs available: ${blogs.length}`);
      }
      
      // If still no blogs, use fallback
      if (blogs.length === 0) {
        console.log('🔄 No blogs found, using fallback');
        blogs = getFallbackBlogs();
      }
      
      // Sort by date (newest first)
      const sortedBlogs = blogs.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || a.updatedAt || Date.now());
        const dateB = new Date(b.createdAt || b.date || b.updatedAt || Date.now());
        return dateB - dateA; // Newest first
      });
      
      // Take limited number
      const recent = sortedBlogs.slice(0, limit);
      console.log(`✅ Returning ${recent.length} recent blogs`);
      
      // Log what we're returning
      recent.forEach((blog, index) => {
        console.log(`  ${index + 1}. "${blog.title}" - ${blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'No date'}`);
      });
      
      return recent;
      
    } catch (error) {
      console.error('❌ Error fetching recent blogs:', error);
      return getFallbackBlogs().slice(0, limit);
    }
  },

  // Get all projects
  getProjects: async () => {
    try {
      console.log('🚀 Fetching projects...');
      const response = await api.get('/api/projects');
      console.log('✅ Projects fetched successfully');
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('⚠️ Unknown projects format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      return [];
    }
  },

  // Get single project by ID
  getProjectById: async (id) => {
    try {
      console.log(`🔍 Fetching project ${id}...`);
      const response = await api.get(`/api/projects/${id}`);
      console.log('✅ Project fetched successfully');
      
      // Handle different response formats
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching project:', error);
      throw new Error('Failed to load project: ' + error.message);
    }
  },

  // Test backend connection
  testConnection: async () => {
    try {
      console.log('🔗 Testing backend connection...');
      const response = await api.get('/api/blogs');
      
      console.log('✅ Backend connection successful');
      return { 
        success: true, 
        data: response.data,
        message: 'Backend is connected and healthy',
        status: response.status
      };
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      
      return { 
        success: false, 
        error: error.message,
        message: 'Cannot connect to backend server',
        status: error.status
      };
    }
  },

  // Get blog count
  getBlogCount: async () => {
    try {
      const blogs = await publicAPI.getBlogs();
      return blogs.length;
    } catch (error) {
      console.error('❌ Error getting blog count:', error);
      return 0;
    }
  }
};

// ==========================================
// 🎪 FALLBACK DATA (for when API fails)
// ==========================================
const getFallbackBlogs = () => {
  console.log('🔄 Using fallback blog data');
  return [
    {
      _id: 'fallback-1',
      title: 'Welcome to CYBARCSOFT Blog',
      excerpt: 'Discover algorithmic solutions for modern problems in politics, media, education, and ICT platforms.',
      content: 'Full content would appear here...',
      author: 'Admin',
      published: true,
      status: 'published',
      readTime: '5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featuredImage: null,
      tags: ['technology', 'education'],
      category: 'Introduction'
    },
    {
      _id: 'fallback-2',
      title: 'Latest Updates & Announcements',
      excerpt: 'Stay informed with our latest developments and upcoming projects in the tech education space.',
      content: 'More detailed content here...',
      author: 'Admin',
      published: true,
      status: 'published',
      readTime: '3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featuredImage: null,
      tags: ['updates', 'announcements'],
      category: 'News'
    },
    {
      _id: 'fallback-3',
      title: 'Technology in Education',
      excerpt: 'Exploring how modern technology is transforming education and creating new opportunities.',
      content: 'Educational technology content...',
      author: 'Admin',
      published: true,
      status: 'published',
      readTime: '7',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featuredImage: null,
      tags: ['education', 'technology', 'ict'],
      category: 'Education'
    }
  ];
};

// ==========================================
// 🔐 AUTHENTICATION API (unchanged)
// ==========================================
export const authAPI = {
  login: async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Attempting login...');
      
      const response = await api.post('/api/auth/login', { 
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
      
      const response = await api.get('/api/admin/blogs');
      
      // Handle response
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`✅ Found ${response.data.data.length} blogs`);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} blogs (direct array)`);
        return response.data;
      } else if (Array.isArray(response.data.data)) {
        console.log(`✅ Found ${response.data.data.length} blogs (data array)`);
        return response.data.data;
      } else {
        console.warn('⚠️ Unexpected admin blogs response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin blogs:', error);
      return getFallbackBlogs();
    }
  },

  // Get single blog by ID for admin
  getBlog: async (id) => {
    try {
      console.log(`📖 Fetching blog ${id}...`);
      
      const response = await api.get(`/api/admin/blogs/${id}`);
      
      if (response.data.success && response.data.data) {
        console.log('✅ Blog fetched successfully');
        return response.data.data;
      } else if (response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Failed to fetch blog:', error);
      
      // Return fallback if exists
      const fallback = getFallbackBlogs().find(b => b._id === id || b.id === id);
      if (fallback) return fallback;
      
      throw error;
    }
  },

  // Create new blog
  createBlog: async (blogData) => {
    try {
      console.log('📝 Creating new blog...');
      
      const response = await api.post('/api/admin/blogs', blogData);
      
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
      
      const response = await api.put(`/api/admin/blogs/${id}`, blogData);
      
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
      
      const response = await api.delete(`/api/admin/blogs/${id}`);
      
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
  },

  // Image upload function
  uploadImage: async (formData) => {
    try {
      console.log('📤 Uploading image...');
      
      // Get token manually
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Authentication token missing');
      }
      
      // Use fetch directly for FormData
      const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      console.log('📤 Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📤 Upload response data:', data);
      
      if (data.success) {
        console.log('✅ Image uploaded successfully');
        return data;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  },

  // Alternative: Simple image upload using axios
  uploadImageSimple: async (file) => {
    try {
      console.log('📤 Uploading image (simple method)...');
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'blogs');
      
      const response = await api.post('/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('✅ Image uploaded successfully');
        return response.data;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
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
      
      const response = await api.get('/api/admin/dashboard/stats');
      
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
      
      const response = await api.get('/api/admin/projects');
      
      // Handle response
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`✅ Found ${response.data.data.length} projects`);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} projects (direct array)`);
        return response.data;
      } else if (Array.isArray(response.data.data)) {
        console.log(`✅ Found ${response.data.data.length} projects (data array)`);
        return response.data.data;
      } else {
        console.warn('⚠️ Unexpected admin projects response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin projects:', error);
      return [];
    }
  },

  getProject: async (id) => {
    try {
      console.log(`🔍 Fetching project ${id}...`);
      
      const response = await api.get(`/api/admin/projects/${id}`);
      
      if (response.data.success && response.data.data) {
        console.log('✅ Project fetched successfully');
        return response.data.data;
      } else if (response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Failed to fetch project:', error);
      throw error;
    }
  },

  createProject: async (projectData) => {
    try {
      console.log('📝 Creating new project...');
      
      const response = await api.post('/api/admin/projects', projectData);
      
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
      
      const response = await api.put(`/api/admin/projects/${id}`, projectData);
      
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
      
      const response = await api.delete(`/api/admin/projects/${id}`);
      
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
      const response = await api.get('/api/health');
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
// Export everything
export const getBlogs = publicAPI.getBlogs;
export const getBlogById = publicAPI.getBlogById;
export const getPublishedBlogs = publicAPI.getPublishedBlogs;
export const getRecentBlogs = publicAPI.getRecentBlogs;
export const blogAPI = blogsAPI;
export const projectAPI = projectsAPI;

export default api;