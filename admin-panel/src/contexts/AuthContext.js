import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

  // Demo user data for fallback
  const demoUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@zmo.com',
    role: 'admin'
  };

  // Check backend connection and existing auth on app start
  const initializeAuth = useCallback(async () => {
    try {
      console.log('🔧 Initializing authentication...');
      
      // Test backend connection (but don't block if it fails)
      try {
        const connectionResult = await testBackendConnection();
        setBackendStatus(connectionResult.success ? 'connected' : 'disconnected');
        console.log('🌐 Backend status:', connectionResult.success ? 'Connected' : 'Disconnected');
      } catch (error) {
        console.log('⚠️ Backend connection test failed, using demo mode');
        setBackendStatus('disconnected');
      }

      // Check for existing authentication (local storage)
      const currentUser = authAPI.getCurrentUser();
      const token = localStorage.getItem('adminToken');

      if (token && currentUser) {
        console.log('✅ Found existing user session:', currentUser.email);
        setUser(currentUser);
        
        // Try to verify token if backend is available, but don't require it
        if (backendStatus === 'connected') {
          try {
            await authAPI.verify();
            console.log('✅ Token verified');
          } catch (error) {
            console.log('⚠️ Token verification failed, but keeping local session');
          }
        }
      } else {
        console.log('ℹ️ No existing user session found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  }, [backendStatus]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Demo login for when backend is unavailable
  const demoLogin = async (email, password) => {
    console.log('🎭 Attempting demo login...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@zmo.com' && password === 'password') {
      const demoToken = 'demo-token-' + Date.now();
      
      localStorage.setItem('adminToken', demoToken);
      localStorage.setItem('adminUser', JSON.stringify(demoUser));
      
      console.log('✅ Demo login successful');
      return {
        success: true,
        user: demoUser,
        token: demoToken,
        message: 'Demo Mode - Backend is currently unavailable'
      };
    } else {
      throw new Error('Invalid email or password. Use: admin@zmo.com / password');
    }
  };

  const login = async (email, password, rememberMe = false) => {
    setAuthLoading(true);
    try {
      console.log('🔐 Attempting login...', { email });

      let result;
      let usedDemoMode = false;

      // Try backend login first
      try {
        console.log('🔄 Trying backend login...');
        const connection = await testBackendConnection();
        
        if (connection.success) {
          result = await authAPI.login(email, password, rememberMe);
          setBackendStatus('connected');
          console.log('✅ Backend login successful');
        } else {
          throw new Error('Backend unavailable');
        }
      } catch (backendError) {
        console.log('⚠️ Backend login failed, trying demo mode:', backendError.message);
        
        // Fallback to demo authentication
        result = await demoLogin(email, password);
        usedDemoMode = true;
        setBackendStatus('disconnected');
      }

      if (result.success) {
        setUser(result.user);
        
        // Show different message based on mode
        if (usedDemoMode) {
          console.log('🎭 Demo mode active - Backend unavailable');
        } else {
          console.log('✅ Backend mode active');
        }
        
        return {
          ...result,
          demoMode: usedDemoMode
        };
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Enhanced error messages
      let errorMessage = error.message;
      if (error.message.includes('Network Error') || error.message.includes('Cannot connect') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the server. The backend might be temporarily unavailable. Using demo mode.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Server is taking too long to respond. Please try again.';
      } else if (error.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please use: admin@zmo.com / password';
      }
      
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Try backend logout if connected
      if (backendStatus === 'connected') {
        await authAPI.logout();
      }
    } catch (error) {
      console.log('Logout cleanup:', error.message);
    } finally {
      // Always clear local data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      
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
    isDemoMode: backendStatus === 'disconnected' && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}