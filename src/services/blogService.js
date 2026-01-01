// admin-panel/src/services/blogService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const blogService = {
  createBlog: async (blogData) => {
    try {
      const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create blog');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating blog:', error);
      return { success: false, error: error.message };
    }
  },
  
  getBlogs: async () => {
    try {
      const response = await fetch(`${API_URL}/blogs`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return { success: false, error: error.message };
    }
  },
  
  updateBlog: async (id, blogData) => {
    try {
      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating blog:', error);
      return { success: false, error: error.message };
    }
  },
  
  deleteBlog: async (id) => {
    try {
      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'DELETE'
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting blog:', error);
      return { success: false, error: error.message };
    }
  }
};