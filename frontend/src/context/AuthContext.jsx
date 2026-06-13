import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user state from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('profile');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      
      // Optionally fetch fresh profile details
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Set listener for authorization expiration events
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      setProfile(null);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
        setProfile(response.data.profile);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.profile) {
          localStorage.setItem('profile', JSON.stringify(response.data.profile));
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: jwtToken, user: userData, profile: profileData } = response.data;
        
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (profileData) {
          localStorage.setItem('profile', JSON.stringify(profileData));
        } else {
          localStorage.removeItem('profile');
        }

        setToken(jwtToken);
        setUser(userData);
        setProfile(profileData);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid username or password',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (signUpData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', signUpData);
      if (response.data.success) {
        const { token: jwtToken, user: userData, profile: profileData } = response.data;
        
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (profileData) {
          localStorage.setItem('profile', JSON.stringify(profileData));
        } else {
          localStorage.removeItem('profile');
        }

        setToken(jwtToken);
        setUser(userData);
        setProfile(profileData);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = (updatedUser, updatedProfile) => {
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    if (updatedProfile) {
      setProfile(updatedProfile);
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
    }
  };

  const value = {
    user,
    token,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
