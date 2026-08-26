import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const USERS_URL = `${API_BASE_URL}/users`;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен быть использован внутри AuthProvider');
  }
  return context;
};

const makeFakeToken = (username) =>
  btoa(unescape(encodeURIComponent(`${username}:${Date.now()}`)));

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token);

  const clearError = () => setError(null);

  const persistSession = (user, fakeToken) => {
    localStorage.setItem('auth_token', fakeToken);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setToken(fakeToken);
    setCurrentUser(user);
  };

  const register = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const existing = await axios.get(USERS_URL, { params: { username } });
      if (existing.data.length > 0) {
        throw new Error('Пользователь с таким логином уже зарегистрирован');
      }
      const response = await axios.post(
        USERS_URL,
        JSON.stringify({ username, password }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      const user = { id: response.data.id, username };
      persistSession(user, makeFakeToken(username));
      return user;
    } catch (err) {
      const message = err.response || err.request
        ? 'Не удалось связаться с сервером. Проверьте подключение.'
        : err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(USERS_URL, { params: { username } });
      const found = response.data[0];
      if (!found || found.password !== password) {
        throw new Error('Неверный логин или пароль');
      }
      const user = { id: found.id, username: found.username };
      persistSession(user, makeFakeToken(username));
      return user;
    } catch (err) {
      const message = err.response || err.request
        ? 'Не удалось связаться с сервером. Проверьте подключение.'
        : err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setCurrentUser(null);
  }, []);

  const value = {
    isAuthenticated,
    currentUser,
    token,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
