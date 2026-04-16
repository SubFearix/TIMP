import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  login: (username, password) => {
    // Простая заглушка. В реальности здесь будет запрос к API
    if (username === 'admin' && password === 'admin') {
      set({ isAuthenticated: true, user: { name: 'Администратор', role: 'Дежурный офис' } });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false, user: null }),
}));