import React, { useState, useEffect } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { API_CONFIG } from '../config/api.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);      } else {
        // Token is invalid
        localStorage.removeItem('authToken');
      }
    } catch {
      console.error('Error fetching user profile');
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
        setUser(data.data.user);
        return { success: true };      } else {
        return { success: false, error: data.message };
      }
    } catch {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_CONFIG.AUTH_API}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
        setUser(data.data.user);
        return { success: true };      } else {
        return { success: false, error: data.message };
      }
    } catch {
      return { success: false, error: 'Network error occurred' };
    }
  };  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('guestSessionId');
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsGuest(false);
  };
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isGuest,
    continueAsGuest,
    handleAuthSuccess
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
