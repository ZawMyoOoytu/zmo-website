import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Blog Posts</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>12</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Projects</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>5</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Messages</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>3</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Recent Activity</h2>
        <ul>
          <li>New blog post created - 2 hours ago</li>
          <li>Project updated - 5 hours ago</li>
          <li>New contact message received - 1 day ago</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;