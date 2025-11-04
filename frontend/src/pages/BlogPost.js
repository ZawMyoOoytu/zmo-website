// src/pages/BlogPost.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { blogsAPI } from '../services/api'; // ✅ FIXED: Use blogsAPI instead of blogAPI

const BlogPost = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // ✅ FIXED: Use blogsAPI instead of blogAPI
        const blogData = await blogsAPI.getBlogById(id);
        setBlog(blogData);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // ... rest of your component
};

export default BlogPost;