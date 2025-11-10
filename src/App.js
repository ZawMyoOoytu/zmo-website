// admin-panel/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BlogsPage from './pages/BlogsPage';
import ProjectsPage from './pages/ProjectsPage';
import Layout from './components/layout/Layout';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show a loading spinner or placeholder while checking auth
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If authenticated, show children; otherwise redirect to login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard - Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Blogs Page - Protected */}
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <Layout>
                  <BlogsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Projects Page - Protected */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard if route not found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
