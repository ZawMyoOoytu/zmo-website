// admin-panel/src/components/login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { healthAPI } from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('unknown');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const health = await healthAPI.check();
      setBackendStatus('connected');
      console.log('✅ Backend connection successful:', health);
    } catch (err) {
      setBackendStatus('disconnected');
      console.error('❌ Backend connection failed:', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoadingForm(false);
      return;
    }

    try {
      console.log('🔄 Attempting login with:', { email: formData.email });

      // Call AuthContext login
      await login(formData.email, formData.password);

      console.log('✅ Login successful');
      navigate('/dashboard'); // Navigate without full page reload

    } catch (err) {
      console.error('❌ Login failed:', err);

      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 404) {
        setError('Login endpoint not found');
      } else if (err.message.includes('Network Error')) {
        setError('Cannot connect to backend. Check your server.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Try again.');
      }
    } finally {
      setLoadingForm(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      const health = await healthAPI.check();
      alert(`✅ Backend connected!\nStatus: ${health.status}\nEnv: ${health.environment || 'N/A'}`);
    } catch (err) {
      alert(`❌ Backend connection failed!\nError: ${err.message}`);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        {/* Backend Status Indicator */}
        <div
          style={{
            padding: '8px',
            marginBottom: '15px',
            borderRadius: '4px',
            backgroundColor:
              backendStatus === 'connected'
                ? '#d4edda'
                : backendStatus === 'disconnected'
                ? '#f8d7da'
                : '#fff3cd',
            color:
              backendStatus === 'connected'
                ? '#155724'
                : backendStatus === 'disconnected'
                ? '#721c24'
                : '#856404',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          Backend Status:{' '}
          <strong>
            {backendStatus === 'connected'
              ? '✅ Connected'
              : backendStatus === 'disconnected'
              ? '❌ Disconnected'
              : '🔄 Checking...'}
          </strong>
        </div>

        {error && (
          <div
            style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              border: '1px solid #f5c6cb',
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loadingForm}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loadingForm}
          />
        </div>

        <button
          type="submit"
          disabled={loadingForm}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          {loadingForm ? '🔄 Logging in...' : '🔑 Login'}
        </button>

        <button
          type="button"
          onClick={testBackendConnection}
          style={{
            width: '100%',
            backgroundColor: '#6c757d',
            border: '1px solid #6c757d',
          }}
        >
          Test Backend Connection
        </button>
      </form>
    </div>
  );
};

export default Login;
