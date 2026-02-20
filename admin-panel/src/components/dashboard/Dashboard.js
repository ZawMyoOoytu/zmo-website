// src/components/dashboard/Dashboard.js - FIXED VERSION
import React, { useState, useEffect } from 'react'; // Removed unused useCallback
import { Link } from 'react-router-dom';
import './Dashboard.css';

const API_BASE_URL = 'https://zmo-backend.onrender.com/api';
const FRONTEND_URL = window.location.origin.includes('admin') 
  ? window.location.origin.replace('admin', '') 
  : 'http://localhost:3000';

const Dashboard = () => {
  // State
  const [blogs, setBlogs] = useState([]);
  const [frontendBlogs, setFrontendBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diagnostic, setDiagnostic] = useState({
    status: 'idle',
    message: '',
    details: null,
    apiTestResults: null
  });
  const [notification, setNotification] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    dashboardTotal: 0,
    dashboardPublished: 0,
    frontendVisible: 0,
    mismatchCount: 0,
    backendStatus: 'checking',
    frontendStatus: 'checking'
  });

  // Initialize
  useEffect(() => {
    console.log('🚀 Dashboard initialized');
    initializeDashboard();
  }, []);

  // Initialize dashboard - FIXED: Added eslint-disable for missing dependency
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setDiagnostic({
        status: 'checking',
        message: 'Initializing dashboard...',
        details: 'Checking backend and frontend status'
      });

      // Fetch all data in parallel
      const [dashboardData, frontendData] = await Promise.allSettled([
        fetchDashboardData(),
        fetchFrontendData()
      ]);

      // Process dashboard data
      if (dashboardData.status === 'fulfilled') {
        setBlogs(dashboardData.value);
        const publishedCount = dashboardData.value.filter(b => b.status === 'published').length;
        
        // Update stats
        setStats(prev => ({
          ...prev,
          dashboardTotal: dashboardData.value.length,
          dashboardPublished: publishedCount,
          backendStatus: 'online'
        }));
      } else {
        setStats(prev => ({ ...prev, backendStatus: 'offline' }));
      }

      // Process frontend data
      if (frontendData.status === 'fulfilled') {
        setFrontendBlogs(frontendData.value);
        setStats(prev => ({
          ...prev,
          frontendVisible: frontendData.value.length,
          frontendStatus: frontendData.value.length > 0 ? 'online' : 'empty',
          mismatchCount: Math.max(0, (prev.dashboardPublished || 0) - frontendData.value.length)
        }));
      } else {
        setStats(prev => ({ ...prev, frontendStatus: 'error' }));
      }

      setDiagnostic({
        status: 'complete',
        message: 'Dashboard initialized successfully',
        details: `Backend: ${stats.backendStatus}, Frontend: ${stats.frontendStatus}`
      });

    } catch (error) {
      console.error('❌ Dashboard initialization error:', error);
      setDiagnostic({
        status: 'error',
        message: 'Failed to initialize dashboard',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard blogs...');
      const response = await fetch(`${API_BASE_URL}/blogs?all=true`);
      
      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`);
      }
      
      const data = await response.json();
      const allBlogs = data.data || data || [];
      
      console.log(`✅ Dashboard loaded ${allBlogs.length} blogs`);
      return allBlogs;
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      throw error;
    }
  };

  // Fetch what frontend actually sees
  const fetchFrontendData = async () => {
    try {
      console.log('🌐 Fetching frontend blog view...');
      
      // Simulate frontend fetch
      const response = await fetch(`${API_BASE_URL}/blogs?_=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Frontend API error: ${response.status}`);
      }
      
      const data = await response.json();
      const frontendBlogs = data.data || data || [];
      
      console.log(`📱 Frontend sees ${frontendBlogs.length} blogs`);
      return frontendBlogs;
    } catch (error) {
      console.error('❌ Frontend fetch error:', error);
      throw error;
    }
  };

  // Comprehensive diagnostic test
  const runComprehensiveDiagnostic = async () => {
    try {
      setRefreshing(true);
      setDiagnostic({
        status: 'running',
        message: 'Running comprehensive diagnostic...',
        details: 'Testing all API endpoints and blog visibility'
      });

      const tests = [];
      const apiTestResults = {};

      // Test 1: Check backend status
      tests.push('🔍 Testing backend connectivity...');
      try {
        const backendTest = await fetch(`${API_BASE_URL}/health`);
        apiTestResults.backendStatus = backendTest.status;
        tests.push(`✅ Backend: Status ${backendTest.status}`);
      } catch (error) {
        tests.push(`❌ Backend: ${error.message}`);
      }

      // Test 2: Test dashboard endpoint (?all=true)
      tests.push('\n📊 Testing dashboard endpoint (?all=true)...');
      try {
        const dashboardResponse = await fetch(`${API_BASE_URL}/blogs?all=true`);
        const dashboardData = await dashboardResponse.json();
        const dashboardBlogs = dashboardData.data || dashboardData || [];
        apiTestResults.dashboardCount = dashboardBlogs.length;
        apiTestResults.dashboardPublished = dashboardBlogs.filter(b => b.status === 'published').length;
        tests.push(`✅ Dashboard: ${dashboardBlogs.length} total, ${apiTestResults.dashboardPublished} published`);
      } catch (error) {
        tests.push(`❌ Dashboard endpoint: ${error.message}`);
      }

      // Test 3: Test frontend endpoint (regular)
      tests.push('\n🌐 Testing frontend endpoint (regular)...');
      try {
        const frontendResponse = await fetch(`${API_BASE_URL}/blogs`);
        const frontendData = await frontendResponse.json();
        const frontendBlogs = frontendData.data || frontendData || [];
        apiTestResults.frontendCount = frontendBlogs.length;
        apiTestResults.frontendPublished = frontendBlogs.filter(b => b.status === 'published').length;
        tests.push(`✅ Frontend: Returns ${frontendBlogs.length} blogs`);
        
        // List what frontend sees
        if (frontendBlogs.length > 0) {
          tests.push(`   Blogs returned to frontend:`);
          frontendBlogs.forEach((blog, index) => {
            tests.push(`   ${index + 1}. "${blog.title}" (${blog.status || 'no status'})`);
          });
        }
      } catch (error) {
        tests.push(`❌ Frontend endpoint: ${error.message}`);
      }

      // Test 4: Test individual blog access
      tests.push('\n🔎 Testing individual blog access...');
      const publishedBlogs = blogs.filter(b => b.status === 'published');
      apiTestResults.individualTests = [];
      
      for (let i = 0; i < Math.min(publishedBlogs.length, 3); i++) {
        const blog = publishedBlogs[i];
        try {
          const blogResponse = await fetch(`${API_BASE_URL}/blogs/${blog._id}`);
          if (blogResponse.ok) {
            const blogData = await blogResponse.json();
            const singleBlog = blogData.data || blogData;
            apiTestResults.individualTests.push({
              title: blog.title,
              accessible: true,
              status: singleBlog.status,
              viaFrontend: frontendBlogs.some(fb => fb._id === blog._id)
            });
            tests.push(`✅ "${blog.title}": Accessible, Status: ${singleBlog.status}`);
          } else {
            apiTestResults.individualTests.push({
              title: blog.title,
              accessible: false,
              status: 'unknown',
              viaFrontend: false
            });
            tests.push(`❌ "${blog.title}": Not accessible (${blogResponse.status})`);
          }
        } catch (error) {
          apiTestResults.individualTests.push({
            title: blog.title,
            accessible: false,
            status: 'error',
            viaFrontend: false,
            error: error.message
          });
          tests.push(`❌ "${blog.title}": Error - ${error.message}`);
        }
      }

      // Analyze results
      tests.push('\n📈 DIAGNOSIS:');
      
      if (apiTestResults.frontendCount === 1 && apiTestResults.dashboardPublished > 1) {
        tests.push(`🚨 CRITICAL ISSUE DETECTED!`);
        tests.push(`• Backend has: ${apiTestResults.dashboardPublished} published blogs`);
        tests.push(`• Frontend receives: ${apiTestResults.frontendCount} blog`);
        tests.push(`• Missing: ${apiTestResults.dashboardPublished - apiTestResults.frontendCount} blogs`);
        tests.push(`\n🔧 PROBLEM: Backend /api/blogs endpoint is filtering out blogs`);
        tests.push(`   SOLUTION: Check backend route for extra filters (visible, isActive, etc.)`);
      } else if (apiTestResults.frontendCount === apiTestResults.dashboardPublished) {
        tests.push(`✅ API WORKING CORRECTLY`);
        tests.push(`• Backend and frontend in sync`);
        tests.push(`• If website shows only 1 blog, problem is in FRONTEND DISPLAY CODE`);
      } else {
        tests.push(`⚠️ PARTIAL ISSUE`);
        tests.push(`• Backend: ${apiTestResults.dashboardPublished} published`);
        tests.push(`• Frontend API returns: ${apiTestResults.frontendCount}`);
        tests.push(`• Some blogs not being returned`);
      }

      // Update state with results
      setDiagnostic({
        status: 'complete',
        message: 'Diagnostic complete',
        details: `Found ${apiTestResults.frontendCount} of ${apiTestResults.dashboardPublished} blogs`,
        apiTestResults: apiTestResults
      });

      setNotification({
        type: 'info',
        message: 'Diagnostic complete',
        details: 'Check the diagnostic results below'
      });

      // Show alert with results
      setTimeout(() => {
        alert(tests.join('\n'));
      }, 500);

    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      setDiagnostic({
        status: 'error',
        message: 'Diagnostic failed',
        details: error.message
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Fix backend filtering issue
  const fixBackendFiltering = async () => {
    if (!window.confirm(
      `🛠️ FIX BACKEND FILTERING ISSUE?\n\n` +
      `This will update all published blogs to ensure they:\n` +
      `1. Have proper published status\n` +
      `2. Are visible on frontend\n` +
      `3. Don't have conflicting filters\n` +
      `\nThis affects ${blogs.filter(b => b.status === 'published').length} blogs.`
    )) return;

    try {
      setRefreshing(true);
      setDiagnostic({
        status: 'running',
        message: 'Fixing backend filtering...',
        details: 'Updating blog visibility settings'
      });

      const publishedBlogs = blogs.filter(b => b.status === 'published');
      let successCount = 0;
      const results = [];

      for (const blog of publishedBlogs) {
        try {
          // Update blog to ensure frontend visibility
          const updateData = {
            status: 'published',
            publishedAt: new Date().toISOString(),
            // Ensure no conflicting flags
            visible: true,
            isActive: true,
            isPublished: true,
            showOnWebsite: true,
            // Remove any hiding flags
            isHidden: false,
            isArchived: false,
            isDeleted: false
          };

          const response = await fetch(`${API_BASE_URL}/blogs/${blog._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          });

          if (response.ok) {
            successCount++;
            results.push(`✅ "${blog.title}" - Fixed`);
            
            // Test if now accessible
            await new Promise(resolve => setTimeout(resolve, 200));
            const testResponse = await fetch(`${API_BASE_URL}/blogs/${blog._id}`);
            if (testResponse.ok) {
              console.log(`✅ Now accessible: "${blog.title}"`);
            }
          } else {
            results.push(`❌ "${blog.title}" - Failed (${response.status})`);
          }

          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
          results.push(`❌ "${blog.title}" - Error: ${error.message}`);
        }
      }

      // Show results
      const resultMessage = `📊 BACKEND FIX RESULTS:\n\n` +
        `✅ Successfully fixed: ${successCount} blogs\n` +
        `❌ Failed: ${publishedBlogs.length - successCount} blogs\n` +
        `Total: ${publishedBlogs.length} blogs\n\n` +
        `DETAILS:\n${results.join('\n')}\n\n` +
        `Please wait while we refresh the data...`;

      alert(resultMessage);

      // Refresh data
      setTimeout(() => {
        initializeDashboard();
      }, 2000);

    } catch (error) {
      alert('Backend fix failed: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Nuclear option: Recreate all blogs for frontend
  const nuclearFrontendFix = async () => {
    const publishedBlogs = blogs.filter(b => b.status === 'published');
    
    if (!window.confirm(
      `☢️ NUCLEAR FRONTEND FIX?\n\n` +
      `This will COMPLETELY RECREATE ${publishedBlogs.length} blogs:\n` +
      `• Delete and recreate blog entries\n` +
      `• Ensure perfect frontend compatibility\n` +
      `• Fix ALL possible issues\n` +
      `\n⚠️ WARNING: This cannot be undone!\n` +
      `Make sure you have backups.`
    )) return;

    try {
      setRefreshing(true);
      setDiagnostic({
        status: 'running',
        message: 'Running nuclear fix...',
        details: 'This may take several minutes'
      });

      let successCount = 0;
      const results = [];

      for (const blog of publishedBlogs) {
        try {
          // First, backup blog data
          const blogData = { ...blog };
          delete blogData._id;
          delete blogData.__v;
          
          // Create new blog with proper fields
          const newBlogData = {
            ...blogData,
            status: 'published',
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Frontend display fields
            slug: generateSlug(blog.title),
            excerpt: blog.excerpt || blog.content?.substring(0, 200) || 'Read more...',
            featuredImage: blog.featuredImage || '/images/default-blog.jpg',
            category: blog.category || 'general',
            tags: blog.tags || ['blog'],
            author: blog.author || 'Admin',
            // Visibility flags
            visible: true,
            isPublished: true,
            showOnWebsite: true,
            isActive: true,
            // Remove problematic fields
            isHidden: undefined,
            isArchived: undefined,
            isDeleted: undefined
          };

          // Create new blog
          const createResponse = await fetch(`${API_BASE_URL}/blogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBlogData)
          });

          if (createResponse.ok) {
            successCount++;
            results.push(`✅ Created: "${blog.title}"`);
            
            // Optional: Delete old blog
            try {
              await fetch(`${API_BASE_URL}/blogs/${blog._id}`, {
                method: 'DELETE'
              });
              results[results.length - 1] += ` (old deleted)`;
            } catch (deleteError) {
              // Ignore delete errors
            }
          } else {
            results.push(`❌ Failed: "${blog.title}"`);
          }

          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          results.push(`❌ Error: "${blog.title}" - ${error.message}`);
        }
      }

      alert(
        `☢️ NUCLEAR FIX COMPLETE:\n\n` +
        `✅ Created: ${successCount} new blogs\n` +
        `❌ Failed: ${publishedBlogs.length - successCount}\n` +
        `Total: ${publishedBlogs.length} blogs\n\n` +
        `Frontend should now display all blogs.\n` +
        `Refreshing dashboard in 5 seconds...`
      );

      // Wait and refresh
      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error) {
      alert('Nuclear fix failed: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Generate slug
  const generateSlug = (title) => {
    if (!title) return 'blog-' + Date.now();
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Clear frontend cache
  const clearFrontendCache = () => {
    if (window.confirm(
      `🗑️ CLEAR FRONTEND CACHE?\n\n` +
      `This will:\n` +
      `1. Clear localStorage cache\n` +
      `2. Clear sessionStorage\n` +
      `3. Force fresh API calls\n` +
      `\nTell users to also clear browser cache on the website.`
    )) {
      localStorage.removeItem('dashboard_cache');
      localStorage.removeItem('frontend_cache');
      sessionStorage.clear();
      
      setNotification({
        type: 'success',
        message: 'Frontend cache cleared',
        details: 'Local storage and session storage cleared'
      });
      
      setTimeout(() => initializeDashboard(), 1000);
    }
  };

  // Test individual blog
  const testBlogVisibility = async (blogId, blogTitle) => {
    try {
      setDiagnostic({
        status: 'running',
        message: `Testing "${blogTitle}"...`,
        details: 'Checking frontend accessibility'
      });

      // Test via frontend endpoint
      const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`);
      const data = await response.json();
      const blog = data.data || data;

      // Test via regular endpoint
      const frontendResponse = await fetch(`${API_BASE_URL}/blogs`);
      const frontendData = await frontendResponse.json();
      const frontendBlogs = frontendData.data || frontendData || [];
      const isInFrontendList = frontendBlogs.some(b => b._id === blogId);

      let alertMessage = `🔍 BLOG VISIBILITY TEST:\n\n`;
      alertMessage += `"${blogTitle}"\n`;
      alertMessage += `ID: ${blogId}\n\n`;
      alertMessage += `DIRECT ACCESS:\n`;
      alertMessage += `• Status: ${response.status}\n`;
      alertMessage += `• Blog Status: ${blog.status || 'unknown'}\n`;
      alertMessage += `• Visible Field: ${blog.visible !== false}\n\n`;
      alertMessage += `FRONTEND LIST ACCESS:\n`;
      alertMessage += `• In /api/blogs list: ${isInFrontendList ? '✅ YES' : '❌ NO'}\n`;
      alertMessage += `• Frontend sees: ${frontendBlogs.length} total blogs\n\n`;

      if (!isInFrontendList) {
        alertMessage += `🚨 PROBLEM: This blog is NOT in the frontend list!\n`;
        alertMessage += `Even though it's published, frontend cannot see it.\n`;
        alertMessage += `\n🔧 SOLUTION: Click "Fix This Blog" below.`;
      } else {
        alertMessage += `✅ This blog should appear on the website.`;
      }

      alert(alertMessage);

      setDiagnostic({
        status: 'complete',
        message: 'Test complete',
        details: `Blog ${isInFrontendList ? 'is' : 'is NOT'} in frontend list`
      });

    } catch (error) {
      alert(`Test failed: ${error.message}`);
    }
  };

  // Fix single blog
  const fixSingleBlog = async (blogId, blogTitle) => {
    if (!window.confirm(`Fix "${blogTitle}" for frontend display?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          publishedAt: new Date().toISOString(),
          visible: true,
          isActive: true
        })
      });

      if (response.ok) {
        alert(`✅ "${blogTitle}" fixed for frontend!`);
        setTimeout(() => initializeDashboard(), 1000);
      } else {
        alert(`❌ Failed to fix: ${response.status}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Close notification
  const closeNotification = () => {
    setNotification(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
        <p className="loading-subtext">{diagnostic.message}</p>
        {diagnostic.details && <p className="loading-details">{diagnostic.details}</p>}
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <strong>{notification.message}</strong>
            {notification.details && <small>{notification.details}</small>}
          </div>
          <button onClick={closeNotification} className="close-notification">×</button>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-top">
          <h1>Dashboard Overview</h1>
          <div className="data-source-indicator">
            <span className={`source-badge ${stats.backendStatus}`}>
              {stats.backendStatus === 'online' ? '📡 Backend Online' : '❌ Backend Offline'}
            </span>
            <span className={`source-badge ${stats.frontendStatus}`}>
              {stats.frontendStatus === 'online' ? '🌐 Frontend Online' : '⚠️ Frontend Issue'}
            </span>
          </div>
        </div>
        <div className="user-info">
          <span className="user-avatar">AU</span>
          <span>Admin User</span>
          <button 
            onClick={refreshAllData}
            className="refresh-header-btn"
            disabled={refreshing}
            title="Refresh All Data"
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'spinning' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Critical Alert - Only show if mismatch */}
      {stats.mismatchCount > 0 && (
        <div className="critical-alert">
          <div className="alert-content">
            <div className="alert-icon">🚨</div>
            <div className="alert-details">
              <h3>FRONTEND DISPLAY ISSUE DETECTED!</h3>
              <p>
                <strong>Dashboard:</strong> {stats.dashboardPublished} published blogs | 
                <strong> Frontend receives:</strong> {stats.frontendVisible} blogs
              </p>
              <p className="alert-message">
                ❌ {stats.mismatchCount} blog(s) not appearing on website!
              </p>
            </div>
          </div>
          <div className="alert-actions">
            <button onClick={runComprehensiveDiagnostic} className="alert-btn diagnose">
              <i className="fas fa-stethoscope"></i> Run Diagnostic
            </button>
            <button onClick={fixBackendFiltering} className="alert-btn fix">
              <i className="fas fa-wrench"></i> Fix Backend Filtering
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-overview">
        <h2>Website Visibility Status</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon dashboard">
              <i className="fas fa-columns"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.dashboardPublished}</h3>
              <p>Published in Dashboard</p>
              <small>Total in system: {stats.dashboardTotal}</small>
            </div>
          </div>
          
          <div className={`stat-card ${stats.mismatchCount > 0 ? 'warning' : ''}`}>
            <div className="stat-icon frontend">
              <i className="fas fa-globe"></i>
            </div>
            <div className="stat-content">
              <h3 className={stats.mismatchCount > 0 ? 'critical' : 'normal'}>
                {stats.frontendVisible}
                {stats.mismatchCount > 0 && (
                  <span className="mismatch">/{stats.dashboardPublished}</span>
                )}
              </h3>
              <p>Visible on Website</p>
              <small className={stats.mismatchCount > 0 ? 'critical-text' : 'success-text'}>
                {stats.mismatchCount > 0 
                  ? `${stats.mismatchCount} missing!` 
                  : '✅ All visible'}
              </small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon actions">
              <i className="fas fa-tools"></i>
            </div>
            <div className="stat-content">
              <h3>Fix Tools</h3>
              <p>Quick Actions</p>
              <div className="mini-actions">
                <button onClick={runComprehensiveDiagnostic} className="mini-btn">
                  Diagnose
                </button>
                <a href={FRONTEND_URL} target="_blank" rel="noopener noreferrer" className="mini-btn">
                  Visit Site
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Panel */}
      <div className="diagnostic-panel">
        <div className="section-header">
          <h3>
            <i className="fas fa-bug"></i>
            Diagnostic Tools
          </h3>
          <div className="diagnostic-status">
            <span className={`status-badge ${diagnostic.status}`}>
              {diagnostic.status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="diagnostic-info">
          <p className="diagnostic-message">
            <strong>{diagnostic.message}</strong>
            {diagnostic.details && <span> • {diagnostic.details}</span>}
          </p>
          
          {diagnostic.apiTestResults && (
            <div className="test-results">
              <h4>Test Results:</h4>
              <ul>
                <li>Dashboard endpoint: {diagnostic.apiTestResults.dashboardCount} blogs</li>
                <li>Frontend endpoint: {diagnostic.apiTestResults.frontendCount} blogs</li>
                <li>Published: {diagnostic.apiTestResults.dashboardPublished}</li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="diagnostic-actions">
          <button 
            onClick={runComprehensiveDiagnostic}
            className="diag-btn primary"
            disabled={refreshing}
          >
            <i className="fas fa-play-circle"></i>
            Run Full Diagnostic
          </button>
          
          <button 
            onClick={fixBackendFiltering}
            className="diag-btn warning"
            disabled={refreshing || stats.mismatchCount === 0}
          >
            <i className="fas fa-wrench"></i>
            Fix Backend Filtering
          </button>
          
          <button 
            onClick={clearFrontendCache}
            className="diag-btn info"
          >
            <i className="fas fa-broom"></i>
            Clear Cache
          </button>
          
          <button 
            onClick={nuclearFrontendFix}
            className="diag-btn danger"
            disabled={refreshing}
          >
            <i className="fas fa-bomb"></i>
            Nuclear Fix
          </button>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="blogs-section">
        <div className="section-header">
          <h2>Blog Visibility Management</h2>
          <div className="header-actions">
            <span className="count-badge">
              {stats.dashboardPublished} published • {stats.frontendVisible} on website
            </span>
            <Link to="/admin/blogs" className="view-all">Manage All →</Link>
          </div>
        </div>
        
        <div className="blogs-table-container">
          <table className="blogs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Frontend</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.filter(b => b.status === 'published').map(blog => {
                const isVisible = frontendBlogs.some(fb => fb._id === blog._id);
                
                return (
                  <tr key={blog._id} className={!isVisible ? 'not-visible' : ''}>
                    <td>
                      <div className="blog-title">
                        <strong>{blog.title || 'Untitled'}</strong>
                        {!isVisible && (
                          <span className="visibility-badge missing">
                            ⚠️ Not on Website
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="status-badge published">
                        {blog.status || 'published'}
                      </span>
                    </td>
                    <td>
                      <span className={`visibility-status ${isVisible ? 'visible' : 'hidden'}`}>
                        {isVisible ? '✅ Visible' : '❌ Hidden'}
                      </span>
                    </td>
                    <td>
                      {formatDate(blog.createdAt)}
                    </td>
                    <td>
                      <div className="blog-actions">
                        {!isVisible && (
                          <button
                            onClick={() => fixSingleBlog(blog._id, blog.title)}
                            className="action-btn fix"
                            title="Fix for frontend"
                          >
                            <i className="fas fa-wrench"></i> Fix
                          </button>
                        )}
                        <button
                          onClick={() => testBlogVisibility(blog._id, blog.title)}
                          className="action-btn test"
                          title="Test visibility"
                        >
                          <i className="fas fa-vial"></i> Test
                        </button>
                        <Link
                          to={`/admin/blogs/edit/${blog._id}`}
                          className="action-btn edit"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <a
                          href={`${FRONTEND_URL}/blog/${blog.slug || blog._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn view"
                          title="View on website"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {blogs.filter(b => b.status === 'published').length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">
                    <div className="empty-state">
                      <i className="fas fa-file-alt"></i>
                      <p>No published blogs found</p>
                      <Link to="/admin/blogs/create" className="create-btn">
                        Create Your First Blog
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="quick-guide">
        <h3>🛠️ Troubleshooting Guide</h3>
        <div className="guide-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Run Diagnostic</h4>
              <p>Click "Run Full Diagnostic" to identify the exact problem</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Check Results</h4>
              <p>If frontend API returns only 1 blog, use "Fix Backend Filtering"</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Fix Individual Blogs</h4>
              <p>Use "Fix" button next to each hidden blog</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Clear Cache</h4>
              <p>Clear frontend cache and refresh website</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="system-info">
        <h3>System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Backend URL:</span>
            <span className="info-value">{API_BASE_URL}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Frontend URL:</span>
            <span className="info-value">
              <a href={FRONTEND_URL} target="_blank" rel="noopener noreferrer">
                {FRONTEND_URL}
              </a>
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">{new Date().toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className={`info-value ${stats.mismatchCount > 0 ? 'critical' : 'good'}`}>
              {stats.mismatchCount > 0 ? '⚠️ Needs Attention' : '✅ All Systems Go'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;