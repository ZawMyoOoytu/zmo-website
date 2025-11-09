import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const { 
    login, 
    backendStatus, 
    checkConnection, 
    authLoading, 
    loading: appLoading 
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);

  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      if (!appLoading) {
        await checkConnection();
        setConnectionTested(true);
      }
    };
    
    testConnection();
  }, [appLoading, checkConnection]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password, rememberMe);
      // Redirect will happen automatically via protected routes
    } catch (err) {
      setError(err.message);
    }
  };

  const retryConnection = async () => {
    setError('');
    setConnectionTested(false);
    const result = await checkConnection();
    setConnectionTested(true);
    
    if (!result.success) {
      setError('Still cannot connect to backend. Please check if the server is running.');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@zmo.com');
    setPassword('password');
    setRememberMe(true);
  };

  if (appLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Admin Login</h1>
        
        {/* Connection Status */}
        {connectionTested && (
          <div className={`connection-status ${backendStatus}`}>
            {backendStatus === 'connected' && '✅ Backend connected'}
            {backendStatus === 'disconnected' && '❌ Backend not available'}
            {backendStatus === 'checking' && '🔄 Checking connection...'}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            {backendStatus === 'disconnected' && (
              <button onClick={retryConnection} className="retry-btn">
                Retry Connection
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={authLoading || backendStatus === 'disconnected'}
              placeholder="Enter your email"
              className={error && !email ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={authLoading || backendStatus === 'disconnected'}
              placeholder="Enter your password"
              className={error && !password ? 'error' : ''}
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={authLoading}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button 
            className={`login-btn ${authLoading ? 'loading' : ''}`} 
            type="submit" 
            disabled={authLoading || backendStatus === 'disconnected'}
          >
            {authLoading ? (
              <>
                <span className="btn-spinner"></span>
                Authenticating...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        {/* Demo Helper */}
        <div className="demo-section">
          <button 
            type="button" 
            className="demo-btn"
            onClick={fillDemoCredentials}
            disabled={authLoading}
          >
            Fill Demo Credentials
          </button>
          
          <div className="demo-credentials">
            <p><strong>Demo Access:</strong></p>
            <p>Email: <code>admin@zmo.com</code></p>
            <p>Password: <code>password</code></p>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        {backendStatus === 'disconnected' && (
          <div className="troubleshooting">
            <h3>🚫 Connection Issues?</h3>
            <p>Your frontend cannot connect to the backend server.</p>
            
            <div className="troubleshooting-steps">
              <h4>Quick Checks:</h4>
              <ol>
                <li>
                  <strong>Test Backend Directly:</strong>{' '}
                  <a 
                    href="https://zmo-backend.onrender.com/api/health" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Check if backend is running
                  </a>
                </li>
                <li>
                  <strong>Check Render Dashboard:</strong>{' '}
                  <a 
                    href="https://render.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View service status
                  </a>
                </li>
                <li>
                  <strong>Wait and Retry:</strong> Render services can take a few minutes to start
                </li>
                <li>
                  <strong>Check Console:</strong> Open browser dev tools for detailed errors
                </li>
              </ol>
            </div>

            <div className="backend-info">
              <p><strong>Backend URL:</strong> <code>https://zmo-backend.onrender.com</code></p>
              <p><strong>API Health Check:</strong> <code>/api/health</code></p>
              <p><strong>Login Endpoint:</strong> <code>/api/auth/login</code></p>
            </div>
          </div>
        )}

        {/* App Info */}
        <div className="app-info">
          <p>ZMO Admin Panel v2.0.0</p>
          <p>Environment: {process.env.NODE_ENV || 'development'}</p>
        </div>
      </div>
    </div>
  );
}