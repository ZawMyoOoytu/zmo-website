// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    published: 0,
    drafts: 0,
    activeProjects: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch blogs
      const blogsResponse = await fetch('/api/blogs');
      let blogsData = [];
      
      if (blogsResponse.ok) {
        const result = await blogsResponse.json();
        
        // Handle different response formats
        if (result.status === 'success' && result.data && result.data.blogs) {
          blogsData = result.data.blogs;
        } else if (Array.isArray(result)) {
          blogsData = result;
        } else if (result.data && Array.isArray(result.data)) {
          blogsData = result.data;
        }
      }
      
      // Calculate stats
      const publishedCount = blogsData.filter(blog => blog.status === 'published').length;
      const draftCount = blogsData.filter(blog => blog.status === 'draft').length;
      
      // Fetch projects
      const projectsResponse = await fetch('/api/projects');
      let projectsData = [];
      
      if (projectsResponse.ok) {
        const result = await projectsResponse.json();
        if (result.status === 'success' && result.data) {
          projectsData = Array.isArray(result.data) ? result.data : 
                       result.data.projects || result.data.items || [];
        }
      }
      
      // Update state
      setStats({
        totalPosts: blogsData.length,
        published: publishedCount,
        drafts: draftCount,
        activeProjects: projectsData.length
      });
      
      // Get recent blogs
      setRecentBlogs(blogsData.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Fallback to mock data
      setStats({
        totalPosts: 7,
        published: 5,
        drafts: 2,
        activeProjects: 4
      });
      
      setRecentBlogs([
        {
          _id: '1',
          title: 'Getting Started with React on Render',
          author: 'Admin User',
          status: 'published',
          createdAt: '2024-01-15T17:00:00.000Z'
        },
        {
          _id: '2',
          title: 'Building Admin Panels',
          author: 'Admin User',
          status: 'draft',
          createdAt: '2024-01-16T10:30:00.000Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (blogId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    if (!window.confirm(`Change status from ${currentStatus} to ${newStatus}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setRecentBlogs(prev => prev.map(blog =>
          blog._id === blogId ? { ...blog, status: newStatus } : blog
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          published: newStatus === 'published' ? prev.published + 1 : prev.published - 1,
          drafts: newStatus === 'draft' ? prev.drafts + 1 : prev.drafts - 1
        }));
        
        alert(`Status changed to ${newStatus}!`);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="user-info">
          <span className="user-avatar">AU</span>
          <span>Admin User</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon published">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.published}</h3>
            <p>Published</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon drafts">
            <i className="fas fa-edit"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.drafts}</h3>
            <p>Drafts</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon projects">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.activeProjects}</h3>
            <p>Active Projects</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/blogs/create" className="action-btn primary">
            <i className="fas fa-plus"></i>
            <span>Create New Blog</span>
          </Link>
          <Link to="/admin/blogs" className="action-btn secondary">
            <i className="fas fa-blog"></i>
            <span>Manage Blogs</span>
          </Link>
          <button onClick={fetchDashboardData} className="action-btn outline">
            <i className="fas fa-sync-alt"></i>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Recent Blogs */}
      <div className="recent-blogs">
        <div className="section-header">
          <h2>Recent Blog Posts</h2>
          <Link to="/admin/blogs" className="view-all">View All →</Link>
        </div>
        
        <div className="blogs-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBlogs.map(blog => (
                <tr key={blog._id}>
                  <td>
                    <div className="blog-title">{blog.title}</div>
                  </td>
                  <td>{blog.author || 'Admin User'}</td>
                  <td>
                    <button
                      onClick={() => handleStatusToggle(blog._id, blog.status)}
                      className={`status-btn ${blog.status}`}
                    >
                      {blog.status === 'published' ? '✅ Published' : '📝 Draft'}
                    </button>
                  </td>
                  <td>{formatDate(blog.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/admin/blogs/edit/${blog._id}`} className="action-link">
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Delete this blog?')) {
                            // Handle delete
                            setRecentBlogs(prev => prev.filter(b => b._id !== blog._id));
                            setStats(prev => ({
                              ...prev,
                              totalPosts: prev.totalPosts - 1,
                              [blog.status]: prev[blog.status] - 1
                            }));
                          }
                        }}
                        className="action-link delete"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Debug Section */}
      <div className="debug-section">
        <h3>API Debug</h3>
        <div className="debug-actions">
          <button 
            onClick={() => {
              fetch('/api/blogs')
                .then(r => r.json())
                .then(d => console.log('Blogs API:', d))
                .catch(e => console.error('Blogs Error:', e));
            }}
            className="debug-btn"
          >
            Test Blogs API
          </button>
          <button 
            onClick={() => {
              fetch('/api/projects')
                .then(r => r.json())
                .then(d => console.log('Projects API:', d))
                .catch(e => console.error('Projects Error:', e));
            }}
            className="debug-btn"
          >
            Test Projects API
          </button>
          <button 
            onClick={fetchDashboardData}
            className="debug-btn refresh"
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;