import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to the Dashboard</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/blogs/create">
          <button style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>
            Create Blog Post
          </button>
        </Link>
        
        <Link to="/blogs">
          <button style={{
            padding: '12px 24px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            View All Blogs
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;