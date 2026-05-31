import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const fetchMe = async () => {
    try {
      const res = await axiosClient.get('/users/me');
      if (res.data?.data) {
        updateUser(res.data.data);
      }
    } catch (error) {
      console.error('Failed to sync user permissions', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    // If user is logged in, fetch fresh permissions to ensure they are up to date
    if (user && localStorage.getItem('token')) {
      fetchMe();
    }

    const handleSync = () => {
      if (localStorage.getItem('token')) fetchMe();
    };
    window.addEventListener('auth:sync-permissions', handleSync);
    
    return () => {
      window.removeEventListener('auth:sync-permissions', handleSync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeAuthPayload = (payload) => {
    const data = payload?.data ?? payload;
    return {
      accessToken: data?.accessToken || data?.token || null,
      user: data?.user || null,
    };
  };

  const login = (payload) => {
    const { accessToken, user: authUser } = normalizeAuthPayload(payload);
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    }
  };

  const updateUser = (newUser) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (_) {
      // Ignore network errors and clear local session anyway.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const hasPermission = (permissionCode) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true; // Super Admin has all permissions
    return user.permissions?.includes(permissionCode) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoggedIn: !!user, hasPermission, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
