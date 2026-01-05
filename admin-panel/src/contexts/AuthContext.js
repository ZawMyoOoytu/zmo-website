import React, { createContext, useState, useContext, useEffect } from 'react';

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
  const [authLoading, setAuthLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendInfo, setBackendInfo] = useState(null);
  const [currentApiUrl, setCurrentApiUrl] = useState('');

  // Determine which API URL to use
  const getApiUrl = () => {
    // Check environment variable first
    const envUrl = process.env.REACT_APP_API_URL;
    
    if (envUrl) {
      console.log('🌐 Using API URL from .env:', envUrl);
      return envUrl;
    }
    
    // Fallback based on environment
    if (process.env.NODE_ENV === 'development') {
      const localUrl = 'http://localhost:5000/api';
      console.log('🌐 Using local API URL for development:', localUrl);
      return localUrl;
    }
    
    // Production fallback
    const prodUrl = 'https://zmo-backend.onrender.com/api';
    console.log('🌐 Using production API URL:', prodUrl);
    return prodUrl;
  };

  const API_BASE_URL = getApiUrl();
  
  // Store the API URL in state for debugging
  useEffect(() => {
    setCurrentApiUrl(API_BASE_URL);
  }, [API_BASE_URL]);

  // Custom fetch with better error handling
  const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

    const defaultOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
    };

    try {
      const response = await fetch(url, defaultOptions);
      clearTimeout(timeoutId);

      console.log(`📡 Response status: ${response.status}`);

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your internet connection.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to backend server. It might be down or blocked by CORS.');
      }
      
      throw error;
    }
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('🔌 Testing connection to:', API_BASE_URL);
      const data = await apiFetch('/health');
      
      if (data.status === 'OK') {
        setBackendStatus('connected');
        setBackendInfo(data);
        return { success: true, data };
      } else {
        setBackendStatus('disconnected');
        return { success: false, error: 'Backend health check failed' };
      }
    } catch (error) {
      console.log('⚠️ Backend connection failed:', error.message);
      setBackendStatus('disconnected');
      return { success: false, error: error.message };
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...');
        
        // Check for existing user in localStorage
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log('✅ Found existing user:', userData.email);
            setUser(userData);
          } catch (error) {
            console.error('❌ Error parsing user data:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        }
        
        // Test backend connection
        await testBackendConnection();
        
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [API_BASE_URL]);

  // Login function
  const login = async (email, password) => {
    setAuthLoading(true);
    
    try {
      console.log('🔐 Attempting login...');
      
      // First try real backend
      if (backendStatus === 'connected') {
        try {
          const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          
          if (data.success) {
            // Save token and user data
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            
            setUser(data.user);
            
            console.log('✅ Login successful with real backend');
            return {
              success: true,
              user: data.user,
              token: data.token,
              demoMode: false,
              backendInfo
            };
          }
        } catch (backendError) {
          console.log('⚠️ Backend login failed:', backendError.message);
        }
      }
      
      // Fallback to demo login
      console.log('🔄 Using demo login...');
      
      const demoUsers = {
        'admin@zmo.com': {
          id: 1,
          name: 'Admin User',
          email: 'admin@zmo.com',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin'],
          avatar: null
        },
        'content@zmo.com': {
          id: 2,
          name: 'Content Manager',
          email: 'content@zmo.com',
          role: 'editor',
          permissions: ['read', 'write'],
          avatar: null
        }
      };
      
      const demoUser = demoUsers[email];
      
      if (demoUser && (
          (email === 'admin@zmo.com' && password === 'password') ||
          (email === 'content@zmo.com' && password === 'demo123')
      )) {
        const demoToken = `demo-token-${Date.now()}`;
        
        localStorage.setItem('adminToken', demoToken);
        localStorage.setItem('adminUser', JSON.stringify(demoUser));
        
        setUser(demoUser);
        setBackendStatus('disconnected');
        
        return {
          success: true,
          user: demoUser,
          token: demoToken,
          demoMode: true,
          message: 'Logged in using demo mode'
        };
      }
      
      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('👋 Logging out...');
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    setUser(null);
    setBackendStatus('checking');
    setBackendInfo(null);
    
    console.log('✅ Logout successful');
  };

  // Check connection
  const checkConnection = testBackendConnection;

  // Clear auth data
  const clearAuthData = () => {
    console.log('🧹 Clearing auth data...');
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    setUser(null);
    setBackendStatus('checking');
    setBackendInfo(null);
    
    window.location.reload();
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const value = {
    // State
    user,
    loading,
    authLoading,
    backendStatus,
    backendInfo,
    currentApiUrl,
    
    // Actions
    login,
    logout,
    checkConnection,
    clearAuthData,
    getAuthHeaders,
    apiFetch: (endpoint, options) => apiFetch(endpoint, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    }),
    
    // Computed
    isAuthenticated: !!user,
    isDemoMode: backendStatus === 'disconnected' && !!user,
    isBackendConnected: backendStatus === 'connected',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}