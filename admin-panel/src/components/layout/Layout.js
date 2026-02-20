import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDemoMode, backendStatus } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // UPDATED: Added /admin prefix to match your routes
  const navigationItems = [
    {
      path: '/admin/dashboard',  // Added /admin
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview and statistics'
    },
    {
      path: '/admin/blogs',      // Added /admin
      label: 'Blog Posts',
      icon: '📝',
      description: 'Manage blog content'
    },
    {
      path: '/admin/projects',   // Added /admin
      label: 'Projects',
      icon: '🚀',
      description: 'Manage projects'
    },
    {
      path: '/admin/analytics',  // Added /admin
      label: 'Analytics',
      icon: '📈',
      description: 'View analytics'
    },
    {
      path: '/admin/settings',   // Added /admin
      label: 'Settings',
      icon: '⚙️',
      description: 'System settings'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className="mobile-logo">
          <Link to="/admin/dashboard" onClick={closeMobileMenu}>
            ZMO Admin
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Link to="/admin/dashboard" onClick={closeMobileMenu}>
              <span className="logo-icon">🚀</span>
              <span className="logo-text">ZMO Admin</span>
            </Link>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀️' : '▶️'}
          </button>
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span className="avatar-fallback">
                {user?.name?.charAt(0) || 'A'}
              </span>
            )}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'Admin User'}</div>
            <div className="user-email">{user?.email || 'admin@zmo.com'}</div>
            <div className="user-role">
              <span className={`role-badge role-${user?.role || 'admin'}`}>
                {user?.role || 'admin'}
              </span>
              {isDemoMode && (
                <span className="demo-badge">Demo Mode</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    {sidebarOpen && (
                      <span className="nav-description">{item.description}</span>
                    )}
                  </div>
                  {isActive(item.path) && (
                    <span className="active-indicator"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="connection-status">
            <div className={`status-indicator status-${backendStatus}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {backendStatus === 'connected' ? 'Backend Connected' : 
                 backendStatus === 'disconnected' ? 'Demo Mode' : 'Checking...'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <span className="logout-icon">🚪</span>
            {sidebarOpen && <span className="logout-text">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="main-header">
          <div className="header-left">
            <h1 className="page-title">
              {navigationItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            <div className="breadcrumb">
              <span>Admin</span>
              <span>›</span>
              <span>{navigationItems.find(item => isActive(item.path))?.label || 'Dashboard'}</span>
            </div>
          </div>
          
          <div className="header-right">
            {/* Quick Actions - REMOVED "New Blog" button */}
            <div className="quick-actions">
              {/* Only keep Website button */}
              <button 
                className="quick-action-btn"
                onClick={() => window.open('http://localhost:3001', '_blank')}
                title="View Website"
              >
                👁️ Website
              </button>
            </div>

            {/* User Menu */}
            <div className="user-menu">
              <div className="user-info-small">
                <div className="user-avatar-small">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div className="user-name-small">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-container">
          {children}
        </div>

        {/* Footer */}
        <footer className="main-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>© {new Date().getFullYear()} ZMO Admin Panel</span>
              <span className="footer-separator">•</span>
              <span>Version 2.0.0</span>
            </div>
            <div className="footer-right">
              <span className={`footer-status status-${backendStatus}`}>
                {backendStatus === 'connected' ? '✅ Backend Connected' : 
                 backendStatus === 'disconnected' ? '⚠️ Demo Mode' : '⏳ Connecting...'}
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;