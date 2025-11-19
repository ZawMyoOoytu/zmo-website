// admin-panel/src/App.js - CLEAN FIXED VERSION
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/global.css';

// Enhanced lazy loading with error handling
const createLazyComponent = (importFn, componentName) => {
  return lazy(async () => {
    try {
      console.log(`📥 Loading ${componentName}...`);
      const module = await importFn();
      console.log(`✅ ${componentName} loaded successfully`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load ${componentName}:`, error);
      
      // Return a fallback component
      const FallbackComponent = () => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>❌ {componentName} Failed to Load</h2>
          <p>Error: {error.message}</p>
          <p>Check if the file exists and has no syntax errors.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', margin: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Retry Loading
          </button>
        </div>
      );
      
      return { default: FallbackComponent };
    }
  });
};

// Lazy load pages
const DashboardPage = createLazyComponent(() => import('./pages/DashboardPage'), 'DashboardPage');
const BlogList = createLazyComponent(() => import('./pages/Blogs/BlogList'), 'BlogList');
const BlogCreate = createLazyComponent(() => import('./pages/Blogs/BlogCreate'), 'BlogCreate');
const BlogEdit = createLazyComponent(() => import('./pages/Blogs/BlogEdit'), 'BlogEdit');
const BlogView = createLazyComponent(() => import('./pages/Blogs/BlogView'), 'BlogView');
const ProjectsPage = createLazyComponent(() => import('./pages/ProjectsPage'), 'ProjectsPage');
const NotFoundPage = createLazyComponent(() => import('./pages/NotFoundPage'), 'NotFoundPage');

// Route constants
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  BLOGS: '/blogs',
  BLOGS_CREATE: '/blogs/create',
  BLOGS_EDIT: '/blogs/edit/:id',
  BLOGS_VIEW: '/blogs/view/:id',
  PROJECTS: '/projects',
  NOT_FOUND: '*'
};

// Loading components
const PageLoader = ({ message = "Loading page..." }) => (
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
  <div className="loading-screen">
    <LoadingSpinner size="large" message="Checking authentication..." />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { isAuthenticated, loading, path: window.location.pathname });

  if (loading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    console.log('🔐 Redirecting to login - not authenticated');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  console.log('✅ Access granted to protected route');
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

// Debug component for testing
const DebugRoute = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>🐛 Debug Page</h1>
      <p>Use this page to test if routes and components are working.</p>
      
      <div style={{ display: 'grid', gap: '10px', marginTop: '20px', maxWidth: '400px' }}>
        <button 
          onClick={() => navigate('/blogs/create')}
          style={{ padding: '15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }}
        >
          Test Blog Create Page
        </button>
        
        <button 
          onClick={() => navigate('/blogs')}
          style={{ padding: '15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }}
        >
          Test Blog List Page
        </button>
        
        <button 
          onClick={() => {
            // Test if BlogCreate component can be imported
            import('./pages/Blogs/BlogCreate').then(module => {
              alert('✅ BlogCreate can be imported successfully!');
              console.log('BlogCreate module:', module);
            }).catch(error => {
              alert('❌ BlogCreate import failed: ' + error.message);
              console.error('Import error:', error);
            });
          }}
          style={{ padding: '15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }}
        >
          Test BlogCreate Import
        </button>

        <button 
          onClick={() => {
            // Check if file exists by testing the import
            console.log('🔍 Checking if BlogCreate file exists...');
            fetch('/src/pages/Blogs/BlogCreate.js')
              .then(response => {
                if (response.ok) {
                  alert('✅ BlogCreate.js file exists!');
                } else {
                  alert('❌ BlogCreate.js file not found!');
                }
              })
              .catch(() => {
                alert('❌ Cannot check file existence (CORS issue)');
              });
          }}
          style={{ padding: '15px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', fontSize: '16px' }}
        >
          Check BlogCreate File
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Current Route Info:</h3>
        <p><strong>Pathname:</strong> {window.location.pathname}</p>
        <p><strong>Full URL:</strong> {window.location.href}</p>
      </div>
    </div>
  );
};

// Route configuration
const routeConfig = [
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
    public: true,
    layout: false
  },
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardPage />,
    layout: true,
    name: 'Dashboard'
  },
  {
    path: ROUTES.BLOGS,
    element: <BlogList />,
    layout: true,
    name: 'Blog List'
  },
  {
    path: ROUTES.BLOGS_CREATE,
    element: <BlogCreate />,
    layout: true,
    name: 'Create Blog'
  },
  {
    path: ROUTES.BLOGS_EDIT,
    element: <BlogEdit />,
    layout: true,
    name: 'Edit Blog'
  },
  {
    path: ROUTES.BLOGS_VIEW,
    element: <BlogView />,
    layout: true,
    name: 'View Blog'
  },
  {
    path: ROUTES.PROJECTS,
    element: <ProjectsPage />,
    layout: true,
    name: 'Projects'
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
    layout: true,
    name: 'Not Found'
  }
];

// Route renderer component
const RouteRenderer = ({ route }) => {
  const RouteElement = route.layout ? (
    <Layout>
      <ErrorBoundary>
        {route.element}
      </ErrorBoundary>
    </Layout>
  ) : (
    <ErrorBoundary>
      {route.element}
    </ErrorBoundary>
  );

  if (route.public) {
    return <PublicRoute>{RouteElement}</PublicRoute>;
  }

  return <ProtectedRoute>{RouteElement}</ProtectedRoute>;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Suspense fallback={<PageLoader message="Loading application..." />}>
              <Routes>
                {/* Debug route - always available */}
                <Route 
                  path="/debug" 
                  element={
                    <Layout>
                      <DebugRoute />
                    </Layout>
                  } 
                />
                
                {/* Main routes */}
                {routeConfig.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<RouteRenderer route={route} />}
                  />
                ))}
                
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;