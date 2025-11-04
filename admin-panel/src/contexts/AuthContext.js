// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);
      console.log('✅ Login Response:', response); // debug

      // Adjust depending on your backend structure
      const userData = response.data?.user || response.user;
      const token = response.data?.token || response.token;

      if (!userData || !token) {
        throw new Error('Invalid login response from server');
      }

      setUser(userData);
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));

      return response;
    } catch (err) {
      console.error('❌ Login Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  // VERIFY TOKEN AND FETCH USER
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await authAPI.verify(token);
      console.log('✅ Verify Response:', response); // debug

      const userData = response.data?.user || response.user;
      setUser(userData || null);
    } catch (err) {
      console.error('❌ Verify Error:', err.response?.data || err.message);
      logout(); // clear invalid token
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// CUSTOM HOOK TO USE AUTH
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
