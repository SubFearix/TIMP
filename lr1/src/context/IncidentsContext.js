import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const API_URL = `${API_BASE_URL}/incidents`;

const authHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const IncidentsContext = createContext();

export const useIncidents = () => {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error('useIncidents должен быть использован внутри IncidentsProvider');
  }
  return context;
};

const handleApiError = (err) => {
  if (err.response) {
    const status = err.response.status;
    switch (status) {
      case 400:
        return 'Некорректный запрос. Проверьте введенные данные.';
      case 403:
        return 'Доступ запрещен. У вас нет прав для выполнения этой операции.';
      case 404:
        return 'Запрашиваемый ресурс не найден.';
      case 500:
        return 'Внутренняя ошибка сервера. Попробуйте позже.';
      case 502:
        return 'Сервер временно недоступен. Попробуйте позже.';
      case 503:
        return 'Сервис временно недоступен. Попробуйте позже.';
      default:
        return `Ошибка сервера: ${status}`;
    }
  } else if (err.request) {
    return 'Не удалось связаться с сервером. Проверьте подключение и что json-server запущен.';
  } else {
    return 'Произошла ошибка при отправке запроса.';
  }
};

export const IncidentsProvider = ({ children }) => {
  const [incidents, setIncidents] = useState([]);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL, { headers: authHeaders() });
      setIncidents(response.data);
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIncidentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/${id}`, { headers: authHeaders() });
      setCurrentIncident(response.data);
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addIncident = useCallback(async (incidentData) => {
    setLoading(true);
    setError(null);
    try {
      const maxId = incidents.length > 0
        ? Math.max(...incidents.map(item => (typeof item.id === 'number' ? item.id : parseInt(item.id) || 0)))
        : 0;
      const newId = maxId + 1;
      const dataWithId = { ...incidentData, id: newId };
      const response = await axios.post(API_URL, JSON.stringify(dataWithId), {
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
      });
      setIncidents(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incidents]);

  const updateIncident = useCallback(async (id, incidentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/${id}`, JSON.stringify(incidentData), {
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
      });
      const numId = typeof id === 'string' ? parseInt(id) : id;
      setIncidents(prev => prev.map(item => (item.id === numId ? response.data : item)));
      setCurrentIncident(response.data);
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIncident = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
      const numId = typeof id === 'string' ? parseInt(id) : id;
      setIncidents(prev => prev.filter(item => item.id !== numId));
      return true;
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    incidents,
    currentIncident,
    loading,
    error,
    fetchIncidents,
    fetchIncidentById,
    addIncident,
    updateIncident,
    deleteIncident,
    clearError,
    setCurrentIncident
  };

  return (
    <IncidentsContext.Provider value={value}>
      {children}
    </IncidentsContext.Provider>
  );
};

export default IncidentsContext;
