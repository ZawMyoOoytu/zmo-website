// Simulated backend API service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simulated database
let blogsDB = [
  {
    id: 1,
    title: 'Getting Started with React',
    excerpt: 'Learn how to start with React development',
    content: 'This is a full guide about React...',
    author: 'Admin User',
    status: 'published',
    tags: ['react', 'javascript', 'frontend'],
    readTime: 5,
    featured: true,
    imageUrl: '',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

let nextId = 2;

export const blogService = {
  // Create new blog
  async createBlog(blogData) {
    try {
      console.log('🚀 SERVICE: Creating blog with data:', blogData);
      console.log('🌐 SERVICE: API Base URL available:', API_BASE_URL); // Using the variable to avoid warning
      
      // Validate required fields
      if (!blogData.title || !blogData.content) {
        console.log('❌ SERVICE: Validation failed - title or content missing');
        return { 
          success: false, 
          error: 'Title and content are required' 
        };
      }

      console.log('⏳ SERVICE: Simulating API delay...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newBlog = {
        id: nextId++,
        title: blogData.title,
        excerpt: blogData.excerpt || `Excerpt for ${blogData.title}`,
        content: blogData.content,
        author: blogData.author || 'Admin User',
        status: blogData.status || 'draft',
        tags: blogData.tags || [],
        readTime: blogData.readTime || 5,
        featured: blogData.featured || false,
        imageUrl: blogData.imageUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      blogsDB.unshift(newBlog);
      
      console.log('✅ SERVICE: Blog created successfully:', newBlog);
      console.log('📊 SERVICE: Total blogs now:', blogsDB.length);
      
      return { 
        success: true, 
        data: newBlog, 
        message: 'Blog created successfully' 
      };
    } catch (error) {
      console.error('💥 SERVICE: Error creating blog:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create blog' 
      };
    }
  },

  // ... rest of your methods remain the same
  async getBlogs() {
    try {
      console.log('📡 SERVICE: Fetching all blogs');
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: blogsDB, total: blogsDB.length };
    } catch (error) {
      console.error('💥 SERVICE: Error fetching blogs:', error);
      return { success: false, error: 'Failed to fetch blogs' };
    }
  },

  async getBlogById(id) {
    try {
      console.log(`📡 SERVICE: Fetching blog with ID: ${id}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      const blog = blogsDB.find(blog => blog.id === parseInt(id));
      if (!blog) {
        console.log(`❌ SERVICE: Blog not found with ID: ${id}`);
        return { success: false, error: 'Blog not found' };
      }
      return { success: true, data: blog };
    } catch (error) {
      console.error(`💥 SERVICE: Error fetching blog ${id}:`, error);
      return { success: false, error: 'Failed to fetch blog' };
    }
  },

  async updateBlog(id, blogData) {
    try {
      console.log(`📡 SERVICE: Updating blog with ID: ${id}`, blogData);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const index = blogsDB.findIndex(blog => blog.id === parseInt(id));
      if (index === -1) {
        console.log(`❌ SERVICE: Blog not found for update: ${id}`);
        return { success: false, error: 'Blog not found' };
      }
      
      blogsDB[index] = {
        ...blogsDB[index],
        ...blogData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('✅ SERVICE: Blog updated successfully');
      return { 
        success: true, 
        data: blogsDB[index], 
        message: 'Blog updated successfully' 
      };
    } catch (error) {
      console.error(`💥 SERVICE: Error updating blog ${id}:`, error);
      return { success: false, error: 'Failed to update blog' };
    }
  },

  async deleteBlog(id) {
    try {
      console.log(`📡 SERVICE: Deleting blog with ID: ${id}`);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const index = blogsDB.findIndex(blog => blog.id === parseInt(id));
      if (index === -1) {
        console.log(`❌ SERVICE: Blog not found for deletion: ${id}`);
        return { success: false, error: 'Blog not found' };
      }
      
      blogsDB.splice(index, 1);
      
      console.log('✅ SERVICE: Blog deleted successfully');
      return { 
        success: true, 
        message: 'Blog deleted successfully' 
      };
    } catch (error) {
      console.error(`💥 SERVICE: Error deleting blog ${id}:`, error);
      return { success: false, error: 'Failed to delete blog' };
    }
  },

  async getBlogStats() {
    try {
      console.log('📡 SERVICE: Fetching blog statistics');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const total = blogsDB.length;
      const published = blogsDB.filter(blog => blog.status === 'published').length;
      const drafts = blogsDB.filter(blog => blog.status === 'draft').length;
      const featured = blogsDB.filter(blog => blog.featured).length;
      
      console.log('📊 SERVICE: Stats calculated', { total, published, drafts, featured });
      
      return {
        success: true,
        data: {
          total,
          published,
          drafts,
          featured
        }
      };
    } catch (error) {
      console.error('💥 SERVICE: Error fetching stats:', error);
      return { success: false, error: 'Failed to fetch stats' };
    }
  }
};