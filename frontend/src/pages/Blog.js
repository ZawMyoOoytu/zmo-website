// frontend/src/pages/Blog.js
import React, { useState, useEffect } from 'react';
import BlogCard from '../components/BlogCard';
import { blogAPI } from '../services/api';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching blogs from API...');
      // ✅ CORRECTED: Use getBlogs() instead of getPublishedBlogs()
      const result = await blogAPI.getBlogs();
      
      console.log('📊 API Response:', result);
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.length} blogs`);
        setBlogs(result.data);
      } else {
        setError(result.message || 'Failed to load blogs');
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Blog</h1>
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Blog</h1>
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchBlogs}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Blog</h1>
      
      {blogs.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No blog posts available yet.</p>
          <p>Check back soon for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;