// admin-panel/src/pages/Blogs/BlogList.js
import React from 'react';
import { Link } from 'react-router-dom';

const BlogList = () => {
  const blogs = [
    { id: 1, title: 'Sample Blog 1', status: 'published' },
    { id: 2, title: 'Sample Blog 2', status: 'draft' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Blog Posts</h1>
        <Link to="/blogs/create">
          <button style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            + Create New
          </button>
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #dee2e6' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '10px' }}>{blog.title}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: blog.status === 'published' ? '#d4edda' : '#fff3cd',
                    color: blog.status === 'published' ? '#155724' : '#856404',
                    fontSize: '12px'
                  }}>
                    {blog.status}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <Link to={`/blogs/edit/${blog.id}`} style={{ marginRight: '10px', color: '#007bff' }}>
                    Edit
                  </Link>
                  <Link to={`/blogs/view/${blog.id}`} style={{ color: '#6c757d' }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogList;