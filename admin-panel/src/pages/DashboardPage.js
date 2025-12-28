// admin-panel/src/pages/DashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css'; // Make sure this CSS file exists

const DashboardPage = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your site.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blog">
            <i className="fas fa-blog"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">12</div>
            <h3>Blog Posts</h3>
            <p>Manage your blog content</p>
            <Link to="/blogs" className="stat-link">View All →</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon project">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">8</div>
            <h3>Projects</h3>
            <p>Manage your projects</p>
            <Link to="/projects" className="stat-link">View Projects →</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon user">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">24</div>
            <h3>Users</h3>
            <p>Manage user accounts</p>
            <span className="stat-link coming-soon">Coming Soon</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon analytics">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">1.2K</div>
            <h3>Visitors</h3>
            <p>View site statistics</p>
            <span className="stat-link coming-soon">Coming Soon</span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/blogs/create" className="action-btn primary">
            <i className="fas fa-plus"></i> Create New Blog Post
          </Link>
          <Link to="/blogs" className="action-btn secondary">
            <i className="fas fa-list"></i> View All Blogs
          </Link>
          <Link to="/projects" className="action-btn secondary">
            <i className="fas fa-project-diagram"></i> Manage Projects
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="activity-content">
              <div className="activity-title">New blog post created</div>
              <div className="activity-desc">"Getting Started with React" was created</div>
              <div className="activity-time">2 hours ago</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-edit"></i>
            </div>
            <div className="activity-content">
              <div className="activity-title">Blog post updated</div>
              <div className="activity-desc">"JavaScript Best Practices" was edited</div>
              <div className="activity-time">Yesterday</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="activity-content">
              <div className="activity-title">Project completed</div>
              <div className="activity-desc">"Admin Panel v1.0" was marked as done</div>
              <div className="activity-time">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;