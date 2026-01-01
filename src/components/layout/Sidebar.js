// admin-panel/src/components/layout/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/blogs', icon: '📝', label: 'Blogs' },
    { path: '/projects', icon: '🛠️', label: 'Projects' },
  ];
  
  return (
    <div style={{
      width: '250px',
      background: '#1e293b',
      color: 'white',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #334155' }}>
        <h2 style={{ margin: 0 }}>ZMO Admin</h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px' }}>Administration Panel</p>
      </div>
      
      <nav style={{ marginTop: '20px' }}>
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              color: location.pathname === item.path ? 'white' : '#cbd5e1',
              background: location.pathname === item.path ? '#4361ee' : 'transparent',
              textDecoration: 'none',
              margin: '5px 10px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ marginRight: '10px', fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;