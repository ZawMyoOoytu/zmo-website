// src/pages/LoginPage.js - UPDATED WITH CORRECT CREDENTIALS
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@zmo.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (type) => {
    if (type === 'admin') {
      setEmail('admin@zmo.com');
      setPassword('password');
    } else {
      setEmail('content@zmo.com');
      setPassword('demo123');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>
        
        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zmo.com"
              style={styles.input}
              required
              disabled={loading}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.loginButton,
              ...(loading && styles.loginButtonDisabled)
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Demo Accounts:</p>
          
          <div style={styles.demoButtons}>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              style={styles.demoButton}
            >
              <div style={styles.demoButtonContent}>
                <span style={styles.demoRole}>👑 Admin</span>
                <span style={styles.demoCreds}>admin@zmo.com / password</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleDemoLogin('editor')}
              style={styles.demoButton}
            >
              <div style={styles.demoButtonContent}>
                <span style={styles.demoRole}>✏️ Editor</span>
                <span style={styles.demoCreds}>content@zmo.com / demo123</span>
              </div>
            </button>
          </div>
          
          <p style={styles.note}>
            <strong>Note:</strong> The system will try to connect to the real backend first.
            If unavailable, it will use demo mode.
          </p>
        </div>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>© {new Date().getFullYear()} ZMO Admin Panel</p>
          <p style={styles.footerText}>v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  loginCard: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '480px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '15px',
    color: '#718096',
    margin: 0
  },
  errorAlert: {
    background: '#fed7d7',
    color: '#9b2c2c',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px'
  },
  errorIcon: {
    fontSize: '16px'
  },
  form: {
    marginBottom: '30px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  loginButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    transition: 'opacity 0.2s',
    marginTop: '10px'
  },
  loginButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  demoSection: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },
  demoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '15px',
    textAlign: 'center'
  },
  demoButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  demoButton: {
    width: '100%',
    padding: '12px',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  demoButtonContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  demoRole: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748'
  },
  demoCreds: {
    fontSize: '12px',
    color: '#718096',
    fontFamily: 'monospace'
  },
  note: {
    fontSize: '13px',
    color: '#718096',
    lineHeight: '1.5',
    margin: '15px 0 0 0',
    textAlign: 'center'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },
  footerText: {
    margin: '5px 0',
    fontSize: '13px',
    color: '#a0aec0'
  }
};

// Add spin animation
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinStyle);

export default LoginPage;