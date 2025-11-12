// admin-panel/src/components/BackendTester.js - Updated
import React, { useState } from 'react';

const BackendTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
    console.log(`🧪 ${type.toUpperCase()}: ${message}`);
  };

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('Testing backend connection...');
      
      const response = await fetch('http://localhost:5000/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password'
        })
      });
      
      addResult(`Backend responded with status: ${response.status}`);
      
      const data = await response.json();
      addResult(`Response data: ${JSON.stringify(data)}`);
      
      if (response.ok) {
        addResult('✅ Backend is reachable and responding', 'success');
      } else {
        addResult(`❌ Backend error: ${data.message || 'Unknown error'}`, 'error');
      }
      
    } catch (error) {
      addResult(`❌ Cannot connect to backend: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseHealth = async () => {
    setLoading(true);
    
    try {
      addResult('Testing database health...');
      
      const response = await fetch('http://localhost:5000/api/health/database');
      const data = await response.json();
      
      addResult(`Database health: ${data.success ? '✅ Healthy' : '❌ Issues'}`, data.success ? 'success' : 'error');
      addResult(`Database message: ${data.message}`);
      
      if (data.adminUser) {
        if (data.adminUser.exists) {
          addResult(`✅ Admin user exists: ${data.adminUser.email}`, 'success');
        } else {
          addResult(`❌ Admin user not found: ${data.adminUser.message}`, 'error');
        }
      }
      
    } catch (error) {
      addResult(`❌ Cannot test database health: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    setLoading(true);
    
    try {
      addResult('Attempting to create admin user...');
      
      const response = await fetch('http://localhost:5000/api/setup/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password',
          name: 'Admin User'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addResult(`✅ ${data.message}`, 'success');
        if (data.user) {
          addResult(`✅ Admin user created: ${data.user.email}`, 'success');
        }
      } else {
        addResult(`❌ Failed to create admin: ${data.message}`, 'error');
      }
      
    } catch (error) {
      addResult(`❌ Failed to create admin: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    setLoading(true);
    
    try {
      addResult('Checking admin user status...');
      
      const response = await fetch('http://localhost:5000/api/setup/check-admin');
      const data = await response.json();
      
      if (data.exists) {
        addResult(`✅ Admin user exists: ${data.user.email}`, 'success');
        addResult(`   Name: ${data.user.name}, Role: ${data.user.role}, Active: ${data.user.isActive}`);
      } else {
        addResult(`❌ Admin user not found`, 'error');
        addResult(`   ${data.message}`);
      }
      
    } catch (error) {
      addResult(`❌ Cannot check admin status: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('🚀 Starting comprehensive backend tests...');
    
    await testDatabaseHealth();
    await checkAdminStatus();
    await testBackendConnection();
    
    addResult('🏁 All tests completed');
  };

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', margin: '20px 0' }}>
      <h3>🔧 Backend & Database Diagnostic Tool</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={runAllTests} disabled={loading} className="btn btn-primary">
          Run All Tests
        </button>
        <button onClick={testDatabaseHealth} disabled={loading} className="btn btn-success">
          Test Database
        </button>
        <button onClick={checkAdminStatus} disabled={loading} className="btn btn-info">
          Check Admin
        </button>
        <button onClick={testBackendConnection} disabled={loading} className="btn btn-warning">
          Test Login
        </button>
        <button onClick={createAdminUser} disabled={loading} className="btn btn-secondary">
          Create Admin
        </button>
      </div>

      <div className="test-results">
        <h4>Test Results:</h4>
        {testResults.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No tests run yet. Click buttons above to diagnose.</p>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index} 
              className={`result-item ${result.type}`}
            >
              <strong>[{result.timestamp}]</strong> {result.message}
            </div>
          ))
        )}
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Testing...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .btn {
          padding: 10px 15px;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        .btn-primary { background: #007bff; }
        .btn-success { background: #28a745; }
        .btn-info { background: #17a2b8; }
        .btn-warning { background: #ffc107; color: black; }
        .btn-secondary { background: #6c757d; }
        
        .test-results {
          max-height: 300px;
          overflow-y: auto;
          background: white;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }
        
        .result-item {
          padding: 8px;
          margin: 5px 0;
          border-left: 4px solid #007bff;
          background: #f8f9fa;
          font-size: 14px;
        }
        .result-item.success { border-left-color: #28a745; background: #d4edda; }
        .result-item.error { border-left-color: #dc3545; background: #f8d7da; }
        .result-item.info { border-left-color: #17a2b8; background: #d1ecf1; }
        
        .loading-indicator {
          text-align: center;
          padding: 10px;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BackendTester;