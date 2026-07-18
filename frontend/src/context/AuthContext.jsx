// Context provider for User Authentication state supporting OTP email verification
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Base API url (uses environment variable for production, falls back to localhost)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load user profile automatically on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data); // Save user profile data to state
        } else {
          logout(); // Clear expired token
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If unverified, throw a special error object
        if (response.status === 401 && data.isVerified === false) {
          const verifyErr = new Error(data.message || 'Verification required');
          verifyErr.isVerified = false;
          verifyErr.email = data.email;
          throw verifyErr;
        }
        throw new Error(data.message || 'Login failed');
      }

      // Save token to local storage and state
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register user account handler
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token to local storage and state instantly upon successful registration
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Handle completing login after successful OTP verification
  const verifyOtp = (data) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
  };

  // Update profile details handler
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyOtp,
    logout,
    updateProfile,
    API_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
