import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, getUnreadCount } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('kc_token'));
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await getMe();
      setUser(data.user);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch { setUnreadCount(0); }
  }, []);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token, fetchMe]);

  // Poll unread notifications every 30s when logged in
  useEffect(() => {
    if (!user) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnread]);

  const loginUser = (newToken, newUser) => {
    localStorage.setItem('kc_token', newToken);
    localStorage.setItem('kc_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logoutUser = () => {
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_user');
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('kc_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    unreadCount,
    isAuthenticated: !!user,
    loginUser,
    logoutUser,
    updateUser,
    fetchMe,
    fetchUnread,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
