import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendTester from '../BackendTester';

const DebugLogin = () => {
  const [credentials, setCredentials] = useState({
    email: 'admin@example.com',
    password: 'password'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('Click "Test Login" to start debugging');

  const testCredentials = [
    { email: 'admin@example.com', password: 'password', description: 'Default Admin' },
    { email: 'test@test.com', password: 'password', description: 'Test User' },
  ];

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const fillTestCredentials = (test) => {
    setCredentials(test);
    setDebugInfo(prev => prev + `\n🔑 Filled: ${test.email}`);
  };

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setDebugInfo('🚀 Starting login test...\n');
    
    try {
      // Test 1: Check backend connection
      setDebugInfo(prev => prev + '\n1. Testing backend connection...');
      const healthResponse = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
      setDebugInfo(prev => prev + `\n✅ Backend connected: ${healthResponse.data.message}`);
      
      // Test 2: Check auth endpoint
      setDebugInfo(prev => prev + '\n2. Testing auth endpoint...');
      const authTestResponse = await axios.get('http://localhost:5000/api/auth/test', { timeout: 5000 });
      setDebugInfo(prev => prev + `\n✅ Auth endpoint working: ${authTestResponse.data.message}`);
      
      // Test 3: Attempt login
      setDebugInfo(prev => prev + '\n3. Attempting login...');
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', credentials, { 
        timeout: 10000 
      });
      
      setDebugInfo(prev => prev + `\n✅ Login successful!`);
      setDebugInfo(prev => prev + `\n📦 Response: ${JSON.stringify(loginResponse.data, null, 2)}`);
      
      if (loginResponse.data.token) {
        setDebugInfo(prev => prev + `\n🔐 Token received: ${loginResponse.data.token.substring(0, 20)}...`);
        localStorage.setItem('adminToken', loginResponse.data.token);
        setDebugInfo(prev => prev + `\n💾 Token saved to localStorage`);
        
        // Redirect manually
        setDebugInfo(prev => prev + `\n🔄 Redirecting to admin panel...`);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
      
    } catch (error) {
      setDebugInfo(prev => prev + `\n❌ Error: ${error.message}`);
      
      if (error.response) {
        setDebugInfo(prev => prev + `\n📊 Status: ${error.response.status}`);
        setDebugInfo(prev => prev + `\n📦 Response: ${JSON.stringify(error.response.data)}`);
        setError(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        setDebugInfo(prev => prev + `\n🌐 No response received - backend might be down`);
        setError('Connection error. Please check your internet connection and try again.');
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <BackendTester />
      
      <form onSubmit={(e) => { e.preventDefault(); testLogin(); }} className="login-form">
        <h2>🔧 Debug Login</h2>
        
        {/* Test Credentials */}
        <div className="test-credentials">
          <h4>Quick Test:</h4>
          {testCredentials.map((test, index) => (
            <button 
              key={index}
              type="button"
              onClick={() => fillTestCredentials(test)}
              className="test-btn"
            >
              {test.description}
            </button>
          ))}
        </div>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '🔄 Testing...' : '🚀 Test Login'}
        </button>

        <div className="debug-info">
          <h4>Debug Console:</h4>
          <textarea 
            value={debugInfo}
            readOnly
            rows="8"
            style={{ 
              width: '100%', 
              fontFamily: 'monospace', 
              fontSize: '12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '8px'
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default DebugLogin;