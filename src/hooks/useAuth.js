import { useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.login(email, password);
      if (!data.token) throw new Error('No se recibió un token');
      localStorage.setItem('authToken', data.token);
      const decoded = jwtDecode(data.token);
      setUser(decoded);
      return decoded;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authAPI.register(userData);
      if (!data.token) throw new Error('No se recibió un token');
      localStorage.setItem('authToken', data.token);
      const decoded = jwtDecode(data.token);
      setUser(decoded);
      return decoded;
    } catch (err) {
      setError(err.message || 'Error al registrar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
};
