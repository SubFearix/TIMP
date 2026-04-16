import { create } from 'zustand';
import { incidentService } from '../services/api';

export const useIncidentStore = create((set, get) => ({
  incidents: [],
  currentIncident: null,
  selectedIncidentId: null,
  loading: false,
  error: null,

  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),

  fetchIncidents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await incidentService.getAll();
      set({ incidents: response.data, loading: false });
    } catch (err) {
      set({ error: 'Ошибка сети. Не удалось загрузить данные.', loading: false });
    }
  },

  fetchIncidentById: async (id) => {
    set({ loading: true, error: null, currentIncident: null });
    try {
      const response = await incidentService.getById(id);
      set({ currentIncident: response.data, loading: false });
    } catch (err) {
      set({ error: 'Не удалось загрузить инцидент.', loading: false });
    }
  },

  createIncident: async (incidentData) => {
    set({ loading: true, error: null });
    try {
      const newIncident = { ...incidentData, timestamp: new Date().toISOString(), status: 'open' };
      const response = await incidentService.create(newIncident);
      set((state) => ({ 
        incidents: [...state.incidents, response.data],
        loading: false 
      }));
      return true;
    } catch (err) {
      set({ error: 'Не удалось создать инцидент.', loading: false });
      return false;
    }
  },

  updateIncident: async (id, incidentData) => {
    set({ loading: true, error: null });
    try {
      const response = await incidentService.update(id, incidentData);
      set((state) => ({
        incidents: state.incidents.map(inc => inc.id === id ? response.data : inc),
        currentIncident: response.data,
        loading: false
      }));
      return true;
    } catch (err) {
      set({ error: 'Не удалось обновить инцидент.', loading: false });
      return false;
    }
  },

  deleteIncident: async (id) => {
    set({ loading: true, error: null });
    try {
      await incidentService.delete(id);
      set((state) => ({
        incidents: state.incidents.filter(inc => inc.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ error: 'Не удалось удалить инцидент.', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));