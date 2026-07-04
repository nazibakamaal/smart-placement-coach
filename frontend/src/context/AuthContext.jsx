import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          // Token is invalid/expired
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

const login = async (email, password) => {
  setLoading(true);
  setError(null);

  try {
    const response = await api.post('/auth/login', { email, password });

    console.log("LOGIN RESPONSE:", response.data);

    const resData = response.data.data || response.data;

    localStorage.setItem('token', resData.token);

    setUser({
      _id: resData._id,
      name: resData.name,
      email: resData.email,
      role: resData.role
    });

    return { success: true, user: resData };
  } catch (err) {
    const msg =
      err.response?.data?.message || 'Login failed. Please check credentials.';

    setError(msg);
    return { success: false, message: msg };
  } finally {
    setLoading(false);
  }
};

  const register = async (name, email, password, role = 'student') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { data } = response.data;
      
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      });
      return { success: true, user: data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
