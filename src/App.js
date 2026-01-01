// admin-panel/src/App.js - FIXED VERSION
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// ========== FIXED DASHBOARD IMPORT ==========
import Dashboard from './components/dashboard/Dashboard'; // Correct path!
// ============================================

import './styles/global.css';

// Lazy load other components
const createLazyComponent = (importFn, componentName) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.warn(`⚠️ ${componentName} not found`);
      const FallbackComponent = () => (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>{componentName} Page</h2>
          <p>This page is under development.</p>
        </div>
      );
      return { default: FallbackComponent };
    }
  });
};

// Other pages
const BlogList = createLazyComponent(() => import('./pages/Blogs/BlogList'), 'BlogList');
const BlogCreate = createLazyComponent(() => import('./pages/Blogs/BlogCreate'), 'BlogCreate');
const BlogEdit = createLazyComponent(() => import('./pages/Blogs/BlogEdit'), 'BlogEdit');
const BlogView = createLazyComponent(() => import('./pages/Blogs/BlogView'), 'BlogView');
const LoginPage = createLazyComponent(() => import('./pages/LoginPage'), 'LoginPage');
const ProjectsPage = createLazyComponent(() => import('./pages/ProjectsPage'), 'ProjectsPage');

// Route constants
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  BLOGS: '/blogs',
  BLOGS_CREATE: '/blogs/create',
  BLOGS_EDIT: '/blogs/edit/:id',
  BLOGS_VIEW: '/blogs/view/:id',
  PROJECTS: '/projects',
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
    <LoadingSpinner size="large" />
    <div style={{ color: '#666', fontSize: '16px' }}>{message}</div>
  </div>
);

const AuthLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <LoadingSpinner size="large" message="Checking authentication..." />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  return !isAuthenticated ? children : <Navigate to={ROUTES.DASHBOARD} replace />;
};

// Main App Component
const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <PublicRoute>
              <Suspense fallback={<PageLoader message="Loading login..." />}>
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

        {/* Blog Routes */}
        <Route 
          path={ROUTES.BLOGS} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader message="Loading blog list..." />}>
                    <BlogList />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.BLOGS_CREATE} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader message="Loading blog editor..." />}>
                    <BlogCreate />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.BLOGS_EDIT} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader message="Loading blog editor..." />}>
                    <BlogEdit />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path={ROUTES.BLOGS_VIEW} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader message="Loading blog..." />}>
                    <BlogView />
                  </Suspense>
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

        {/* Default routes */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;