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
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin', 'settings'],
    avatar: null,
    lastLogin: new Date().toISOString()
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
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

      console.log('🔍 Auth initialization check:', {
        hasToken: !!token,
        hasUser: !!currentUser,
        backendStatus: backendStatus
      });

      if (token && currentUser) {
        console.log('✅ Found existing user session:', currentUser.email);
        setUser(currentUser);
        
        // Try to verify token if backend is available, but don't require it
        if (backendStatus === 'connected') {
          try {
            console.log('🔄 Verifying existing token...');
            await authAPI.verify();
            console.log('✅ Token verified successfully');
          } catch (error) {
            console.log('⚠️ Token verification failed, but keeping local session:', error.message);
            // Keep the session anyway for better UX
          }
        }
      } else {
        console.log('ℹ️ No existing user session found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Auth initialization complete');
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
        message: 'Demo Mode - Backend is currently unavailable',
        demoMode: true
      };
    } else if (email === 'content@zmo.com' && password === 'demo123') {
      const demoToken = 'demo-token-' + Date.now();
      const contentUser = {
        ...demoUser,
        id: 2,
        name: 'Content Manager',
        email: 'content@zmo.com',
        role: 'content_manager',
        permissions: ['read', 'write']
      };
      
      localStorage.setItem('adminToken', demoToken);
      localStorage.setItem('adminUser', JSON.stringify(contentUser));
      
      console.log('✅ Demo login successful (Content Manager)');
      return {
        success: true,
        user: contentUser,
        token: demoToken,
        message: 'Demo Mode - Backend is currently unavailable',
        demoMode: true
      };
    } else {
      throw new Error('Invalid email or password. Use: admin@zmo.com / password or content@zmo.com / demo123');
    }
  };

  const login = async (email, password, rememberMe = false) => {
    setAuthLoading(true);
    try {
      console.log('🔐 Attempting login...', { email, rememberMe });

      let result;
      let usedDemoMode = false;

      // Try backend login first
      try {
        console.log('🔄 Testing backend connection...');
        const connection = await testBackendConnection();
        
        if (connection.success) {
          console.log('🌐 Backend available, attempting real login...');
          result = await authAPI.login(email, password, rememberMe);
          setBackendStatus('connected');
          console.log('✅ Backend login successful', result);
        } else {
          console.log('❌ Backend connection failed, switching to demo mode');
          throw new Error('Backend unavailable');
        }
      } catch (backendError) {
        console.log('⚠️ Backend login failed, trying demo mode:', backendError.message);
        
        // Fallback to demo authentication
        result = await demoLogin(email, password);
        usedDemoMode = true;
        setBackendStatus('disconnected');
      }

      // FIX: Handle the response properly - check for success and user data
      if (result && (result.success === true || result.user)) {
        console.log('🎉 Login successful, setting user state...');
        setUser(result.user);
        
        // Show different message based on mode
        if (usedDemoMode) {
          console.log('🎭 Demo mode active - Backend unavailable');
        } else {
          console.log('✅ Backend mode active');
        }
        
        return {
          success: true,
          user: result.user,
          token: result.token,
          message: result.message,
          demoMode: usedDemoMode
        };
      } else {
        console.error('❌ Login failed - invalid response structure:', result);
        throw new Error(result?.message || 'Login failed - invalid response from server');
      }
    } catch (error) {
      console.error('💥 Login process error:', error);
      
      // Enhanced error messages
      let errorMessage = error.message;
      if (error.message.includes('Network Error') || 
          error.message.includes('Cannot connect') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Backend unavailable')) {
        errorMessage = 'Cannot connect to the server. The backend might be temporarily unavailable. Try demo login with: admin@zmo.com / password';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Server is taking too long to respond. Please try again.';
      } else if (error.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please use: admin@zmo.com / password or content@zmo.com / demo123';
      } else if (error.message.includes('No token received')) {
        errorMessage = 'Authentication error: No token received from server. Please try again.';
      } else if (error.message.includes('No user data received')) {
        errorMessage = 'Authentication error: No user data received. Please try again.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      
      // Try backend logout if connected
      if (backendStatus === 'connected') {
        try {
          await authAPI.logout();
          console.log('✅ Backend logout successful');
        } catch (error) {
          console.log('⚠️ Backend logout failed, but continuing with local cleanup:', error.message);
        }
      }
    } catch (error) {
      console.log('Logout cleanup error:', error.message);
    } finally {
      // Always clear local data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      
      setUser(null);
      setBackendStatus('checking');
      console.log('✅ Local auth data cleared, user logged out');
    }
  };

  const checkConnection = async () => {
    try {
      console.log('🔗 Checking backend connection...');
      const result = await testBackendConnection();
      const newStatus = result.success ? 'connected' : 'disconnected';
      setBackendStatus(newStatus);
      console.log('🌐 Connection check result:', newStatus);
      return result;
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      setBackendStatus('disconnected');
      return { success: false, error: error.message };
    }
  };

  // Force demo login for testing
  const forceDemoLogin = async () => {
    setAuthLoading(true);
    try {
      console.log('🎭 Forcing demo login...');
      const result = await demoLogin('admin@zmo.com', 'password');
      setUser(result.user);
      setBackendStatus('disconnected');
      return result;
    } catch (error) {
      console.error('❌ Force demo login failed:', error);
      throw error;
    } finally {
      setAuthLoading(false);
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
    forceDemoLogin,
    
    // Computed
    isAuthenticated: !!user,
    isDemoMode: backendStatus === 'disconnected' && !!user,
    isBackendConnected: backendStatus === 'connected',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}