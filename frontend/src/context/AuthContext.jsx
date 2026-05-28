import { createContext, useContext, useState } from 'react';
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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
