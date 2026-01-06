import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import existing components directly
import Dashboard from './components/dashboard/Dashboard';
import BlogList from './components/dashboard/BlogList'; // Keep existing BlogList
import BlogCreate from './pages/Blogs/BlogCreate'; // Import BlogCreate
import BlogEditor from './components/dashboard/BlogEditor'; // Import BlogEditor

import './styles/global.css';

// Lazy load other pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));

// Simple placeholder components for missing pages
const SettingsPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>⚙️ Settings</h2>
    <p>Settings page is under development.</p>
    <div style={{ marginTop: '30px', color: '#666' }}>
      <p>Coming soon:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>✅ User Management</li>
        <li>✅ Site Configuration</li>
        <li>✅ API Settings</li>
      </ul>
    </div>
  </div>
);

const AnalyticsPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>📈 Analytics</h2>
    <p>Analytics dashboard is under development.</p>
    <div style={{ marginTop: '30px', color: '#666' }}>
      <p>Coming soon:</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>✅ Blog Views Analytics</li>
        <li>✅ User Engagement</li>
        <li>✅ Traffic Sources</li>
      </ul>
    </div>
  </div>
);

// Route constants
export const ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  BLOGS: '/admin/blogs',
  BLOGS_CREATE: '/admin/blogs/new',
  BLOGS_EDIT: '/admin/blogs/edit/:id',
  PROJECTS: '/admin/projects',
  SETTINGS: '/admin/settings',
  ANALYTICS: '/admin/analytics',
};

// Loading components
const PageLoader = ({ message = "Loading..." }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <div style={{ 
      width: '40px', 
      height: '40px', 
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <div style={{ color: '#666', fontSize: '16px' }}>{message}</div>
  </div>
);

const AuthLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#f8f9fa'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <div style={{ 
        color: '#666', 
        fontSize: '16px',
        maxWidth: '300px'
      }}>
        Checking authentication...
      </div>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

// Public Route Component (for login page)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  if (isAuthenticated) {
    console.log('✅ Already authenticated, redirecting to dashboard');
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { loading } = useAuth();

  // Add spin animation on component mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (loading) {
    return <AuthLoader />;
  }

  return (
    <Router>
      <Routes>
        {/* Login Route - Public */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <PublicRoute>
              <Suspense fallback={<PageLoader message="Loading login page..." />}>
                <LoginPage />
              </Suspense>
            </PublicRoute>
          } 
        />

        {/* Dashboard Route */}
        <Route 
          path={ROUTES.DASHBOARD} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Blog List Route */}
        <Route 
          path={ROUTES.BLOGS} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <BlogList />
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Blog Create Route */}
        <Route 
          path={ROUTES.BLOGS_CREATE} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <BlogCreate />
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Blog Edit Route */}
        <Route 
          path={ROUTES.BLOGS_EDIT} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <BlogEditor />
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Projects Route */}
        <Route 
          path={ROUTES.PROJECTS} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader message="Loading projects..." />}>
                    <ProjectsPage />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Settings Route */}
        <Route 
          path={ROUTES.SETTINGS} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <SettingsPage />
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Analytics Route */}
        <Route 
          path={ROUTES.ANALYTICS} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <AnalyticsPage />
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Default routes */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        
        {/* Admin routes - redirect to dashboard */}
        <Route path="/admin" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        
        {/* Blog public routes (if any) */}
        <Route path="/blog/:id" element={<div>Public Blog View</div>} />
        <Route path="/blogs" element={<div>Public Blogs List</div>} />
        
        {/* 404 - This MUST BE THE VERY LAST ROUTE */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component with AuthProvider
const App = () => {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;