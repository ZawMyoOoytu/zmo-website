import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../components/auth/Login.css';

export default function LoginPage() {
  const { login, backendStatus, checkConnection } = useAuth();
  const [email, setEmail] = useState('admin@zmo.com'); // Pre-fill for testing
  const [password, setPassword] = useState('password'); // Pre-fill for testing
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkConnection();
      } catch (error) {
        console.log('Connection check failed:', error.message);
      } finally {
        setConnectionChecked(true);
      }
    };

    checkBackend();
  }, [checkConnection]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Attempting login...');
      const result = await login(email, password);
      
      console.log('✅ Login success:', result);
      
      // Show demo mode notification
      if (result.demoMode) {
        console.log('🎭 Running in demo mode - Backend unavailable');
        // You could show a toast notification here
      }

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

    } catch (err) {
      console.error('❌ Login error:', err);
      
      // Enhanced error messages
      let errorMessage = err.message || 'Login failed. Please check your credentials and try again.';
      
      if (err.message.includes('Cannot connect') || err.message.includes('Network Error')) {
        errorMessage = 'Backend server is currently unavailable. Using demo mode with limited functionality.';
      } else if (err.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please use: admin@zmo.com / password';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Server is taking too long to respond. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = async () => {
    setError('');
    setLoading(true);
    try {
      await checkConnection();
      setError('Connection re-established! Please try logging in again.');
    } catch (error) {
      setError('Still cannot connect to backend. Using demo mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>ZMO Admin Panel</h1>
          <p>Sign in to your account</p>
        </div>

        {/* Connection Status */}
        {connectionChecked && (
          <div className={`connection-status ${backendStatus}`}>
            {backendStatus === 'connected' ? (
              <div className="status-connected">
                ✅ Backend Connected
              </div>
            ) : backendStatus === 'disconnected' ? (
              <div className="status-disconnected">
                ⚠️ Backend Unavailable - Using Demo Mode
                <button 
                  type="button" 
                  className="retry-btn"
                  onClick={handleRetryConnection}
                  disabled={loading}
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="status-checking">
                🔄 Checking Connection...
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`error-message ${error.includes('demo mode') ? 'demo-warning' : ''}`}>
            {error}
            {error.includes('demo mode') && (
              <div className="demo-note">
                You can still login and use the admin panel with demo data.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zmo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            className={`login-btn ${loading ? 'loading' : ''}`} 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="demo-info">
          <h3>Demo Credentials</h3>
          <div className="credentials">
            <div><strong>Email:</strong> admin@zmo.com</div>
            <div><strong>Password:</strong> password</div>
          </div>
          <div className="demo-note">
            <small>
              {backendStatus === 'disconnected' 
                ? '⚠️ Currently running in demo mode with sample data'
                : 'These credentials will work in both demo and backend modes'
              }
            </small>
          </div>
        </div>

        {/* Backend Status Info */}
        <div className="backend-info">
          <details>
            <summary>Backend Status</summary>
            <div className="status-details">
              <p><strong>Backend URL:</strong> https://zmo-backend.onrender.com</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${backendStatus}`}>
                  {backendStatus}
                </span>
              </p>
              <p><strong>Mode:</strong> 
                {backendStatus === 'connected' ? 'Full Backend Access' : 'Demo Mode'}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}