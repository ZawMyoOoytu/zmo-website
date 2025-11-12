// Alternative: Keep your text and add BlogsManager
import React from 'react';
import BlogsManager from '../components/dashboard/BlogsManager';

const BlogsPage = () => {
  return (
    <div>
      <h1>Blog Management</h1>
      <p>This is where you manage your blog posts.</p>
      <BlogsManager />
    </div>
  );
};

export default BlogsPage;