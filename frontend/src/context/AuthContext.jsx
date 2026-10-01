import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('warranty_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('warranty_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate current token with backend on mount
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await axiosClient.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('warranty_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Authentication token verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('warranty_token', res.data.token);
      localStorage.setItem('warranty_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axiosClient.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('warranty_token', res.data.token);
      localStorage.setItem('warranty_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('warranty_token');
    localStorage.removeItem('warranty_user');
  };

  const updateProfileData = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('warranty_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfileData,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
