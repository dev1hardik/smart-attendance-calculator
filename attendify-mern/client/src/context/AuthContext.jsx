import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('attendify_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('attendify_token'));
  const [loading, setLoading] = useState(true);

  // Validate token with backend on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('attendify_token');
      const savedUser = localStorage.getItem('attendify_user');
      if (savedToken && savedUser) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('attendify_user', JSON.stringify(res.data));
        } catch {
          // If network error, preserve local user session for offline/preview
          setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('attendify_token', receivedToken);
      localStorage.setItem('attendify_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      toast.success(`Welcome back, ${receivedUser.name}!`);
      return { success: true };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        // Offline / Demo fallback
        const demoUser = {
          id: 'demo-hardik-59',
          name: 'Hardik Singhal',
          rollNo: '24ESKIT059',
          email: email || 'hardik.24eskit059@skit.ac.in',
          targetCriteria: 75,
        };
        const demoToken = 'demo-jwt-token-attendify';
        localStorage.setItem('attendify_token', demoToken);
        localStorage.setItem('attendify_user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        toast.success(`Welcome, ${demoUser.name}! (Preview Mode)`);
        return { success: true };
      }
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await api.post('/auth/signup', userData);
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('attendify_token', receivedToken);
      localStorage.setItem('attendify_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        const demoUser = {
          id: 'demo-registered-user',
          name: userData.name,
          rollNo: userData.rollNo,
          email: userData.email,
          targetCriteria: 75,
        };
        const demoToken = 'demo-jwt-token-attendify';
        localStorage.setItem('attendify_token', demoToken);
        localStorage.setItem('attendify_user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        toast.success('Account created! (Preview Mode)');
        return { success: true };
      }
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('attendify_token');
    localStorage.removeItem('attendify_user');
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user }}>
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

