// admin-panel/src/pages/Blogs/BlogCreate.js
import React from 'react';
import BlogForm from '../../components/forms/BlogForm';

const BlogCreate = () => {
  const handleCreateBlog = async (formData) => {
    console.log('Creating blog:', formData);
    // Add your API call here
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create New Blog Post</h1>
      <BlogForm
        onSubmit={handleCreateBlog}
        onCancel={() => window.history.back()}
        loading={false}
      />
    </div>
  );
};

export default BlogCreate;