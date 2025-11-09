import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, testBackendConnection } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [authLoading, setAuthLoading] = useState(false);

  // Check backend connection and existing auth on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Test backend connection first
      const connectionResult = await testBackendConnection();
      setBackendStatus(connectionResult.success ? 'connected' : 'disconnected');

      // Check for existing authentication
      const currentUser = authAPI.getCurrentUser();
      const isAuthenticated = authAPI.isAuthenticated();

      if (isAuthenticated && currentUser) {
        try {
          // Verify token is still valid
          await authAPI.verify();
          setUser(currentUser);
          console.log('✅ User session restored:', currentUser.email);
        } catch (error) {
          console.log('❌ Token verification failed, logging out');
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    setAuthLoading(true);
    try {
      console.log('🔐 Attempting login...', { email, rememberMe });

      // Test connection first
      const connection = await testBackendConnection();
      if (!connection.success) {
        throw new Error('Cannot connect to backend server. Please check if the server is running.');
      }

      const result = await authAPI.login(email, password, rememberMe);
      
      if (result.success) {
        setUser(result.user);
        setBackendStatus('connected');
        console.log('✅ Login successful:', result.user.email);
        return result;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setBackendStatus('disconnected');
      
      // Enhanced error messages
      let errorMessage = error.message;
      if (error.message.includes('Network Error') || error.message.includes('Cannot connect')) {
        errorMessage = 'Cannot connect to the server. Please check your internet connection and ensure the backend is running.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Server is taking too long to respond. Please try again.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout cleanup:', error.message);
    } finally {
      setUser(null);
      setBackendStatus('checking');
      console.log('👋 User logged out');
    }
  };

  const checkConnection = async () => {
    try {
      const result = await testBackendConnection();
      setBackendStatus(result.success ? 'connected' : 'disconnected');
      return result;
    } catch (error) {
      setBackendStatus('disconnected');
      return { success: false, error: error.message };
    }
  };

  const value = {
    // State
    user,
    loading,
    authLoading,
    backendStatus,
    
    // Actions
    login,
    logout,
    checkConnection,
    
    // Computed
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}