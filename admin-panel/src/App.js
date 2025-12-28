// admin-panel/src/App.js - COMPLETE VERSION
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/global.css';

// Simple lazy loading with better error handling
const createLazyComponent = (importFn, componentName) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.warn(`⚠️ ${componentName} not found, using fallback`);
      // Return a fallback component
      const FallbackComponent = () => (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
          <h2 style={{ color: '#6c757d', marginBottom: '10px' }}>{componentName}</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            This feature is under development.
          </p>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            <p><strong>Expected file:</strong> {componentName}.js</p>
          </div>
        </div>
      );
      return { default: FallbackComponent };
    }
  });
};

// FIXED: Only try the correct import paths
const BlogList = createLazyComponent(() => import('./pages/Blogs/BlogList'), 'BlogList');
const BlogCreate = createLazyComponent(() => import('./pages/Blogs/BlogCreate'), 'BlogCreate');
const BlogEdit = createLazyComponent(() => import('./pages/Blogs/BlogEdit'), 'BlogEdit');
const BlogView = createLazyComponent(() => import('./pages/Blogs/BlogView'), 'BlogView');

// Other pages
const LoginPage = createLazyComponent(() => import('./pages/LoginPage'), 'LoginPage');
const DashboardPage = createLazyComponent(() => import('./pages/DashboardPage'), 'DashboardPage');
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

// Public Route Component (for login page)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  return !isAuthenticated ? children : <Navigate to={ROUTES.DASHBOARD} replace />;
};

// FIXED: Added the missing closing functions and main App component

// Main App Component
const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Login Route (Public) */}
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

        {/* Dashboard Route (Protected) */}
        <Route 
          path={ROUTES.DASHBOARD} 
          element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader message="Loading dashboard..." />}>
                    <DashboardPage />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Blog Routes (Protected) */}
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

        {/* Projects Route (Protected) */}
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

        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={ROUTES.DASHBOARD} replace />} 
        />

        {/* Catch-all route - redirect to dashboard */}
        <Route 
          path="*" 
          element={<Navigate to={ROUTES.DASHBOARD} replace />} 
        />
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