import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ networkError }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = networkError
    ? [
        { path: '/', label: 'Demo Dashboard', icon: '📊', description: 'Demo Overview' },
        { path: '/demo-blogs', label: 'Demo Blogs', icon: '📝', description: 'Demo Blog Posts' },
      ]
    : [
        { path: '/', label: 'Dashboard', icon: '📊', description: 'Overview & Analytics' },
        { path: '/blogs', label: 'Blogs', icon: '📝', description: 'Manage Blog Posts' },
        { path: '/projects', label: 'Projects', icon: '💼', description: 'Project Portfolio' },
        { path: '/messages', label: 'Messages', icon: '✉️', description: 'Customer Inquiries' },
        { path: '/analytics', label: 'Analytics', icon: '📈', description: 'Performance Stats' },
        { path: '/settings', label: 'Settings', icon: '⚙️', description: 'System Configuration' },
      ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {networkError && (
        <div className="network-error">
          ⚠️ Network error. Showing demo menu items.
        </div>
      )}

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              {!isCollapsed && (
                <div className="logo-text">
                  <h3>AdminHub</h3>
                  <span className="logo-subtitle">Dashboard</span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="toggle-btn"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}>
              ‹
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''} ${
                    hoveredItem === index ? 'hovered' : ''
                  }`}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => window.innerWidth < 768 && setIsCollapsed(true)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  
                  {!isCollapsed && (
                    <div className="nav-content">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <div className="active-indicator"></div>
                  )}

                  {/* Hover effect */}
                  <div className="link-background"></div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-avatar">
                <span>👤</span>
              </div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;