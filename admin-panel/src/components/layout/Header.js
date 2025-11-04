import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Example notifications
  useEffect(() => {
    setNotifications([
      { id: 1, message: 'New message from John Doe', time: '5 min ago', type: 'message', read: false },
      { id: 2, message: 'Blog post published successfully', time: '1 hour ago', type: 'success', read: true },
      { id: 3, message: 'System backup completed', time: '2 hours ago', type: 'info', read: true },
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleProfile = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleNotificationRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-header">
      <div className="header-left">
        <h2 className="header-title">Admin Dashboard</h2>
      </div>

      <div className="header-right">
        {/* Notification Bell */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className={`notification-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={toggleNotifications}
          >
            🔔
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {isNotificationOpen && (
            <div className="notification-panel">
              <div className="panel-header">
                <h4>Notifications</h4>
                <span>{unreadCount} unread</span>
              </div>

              <div className="panel-body">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationRead(notif.id)}
                    >
                      <div className="notif-icon">
                        {notif.type === 'message' && '💬'}
                        {notif.type === 'success' && '✅'}
                        {notif.type === 'info' && 'ℹ️'}
                      </div>
                      <div className="notif-content">
                        <p>{notif.message}</p>
                        <small>{notif.time}</small>
                      </div>
                      {!notif.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <p className="no-notif">No new notifications</p>
                )}
              </div>

              <div className="panel-footer">
                <button>View All</button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Section */}
        <div className="profile-wrapper" ref={dropdownRef}>
          <button className="profile-btn" onClick={toggleProfile}>
            <div className="profile-text">
              <span className="profile-name">{user?.name || 'Admin User'}</span>
              <span className="profile-role">admin</span>
            </div>
            <span className={`arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-top">
                <div className="avatar-circle">
                  {user?.avatar || (user?.name?.charAt(0) || 'A')}
                </div>
                <div>
                  <div className="dropdown-name">{user?.name || 'Admin User'}</div>
                  <div className="dropdown-email">{user?.email || 'admin@example.com'}</div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item">👤 My Profile</button>
              <button className="dropdown-item">⚙️ Settings</button>
              <button className="dropdown-item">🛡️ Privacy & Security</button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>🚪 Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
