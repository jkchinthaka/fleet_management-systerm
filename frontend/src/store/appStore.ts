import { create } from 'zustand';

type AppState = {
  token: string | null;
  roleId: number | null;
  isDark: boolean;
  setSession: (token: string, roleId: number | null) => void;
  setToken: (token: string | null) => void;
  clearSession: () => void;
  toggleTheme: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  token: localStorage.getItem('token'),
  roleId: Number(localStorage.getItem('roleId')) || null,
  isDark: false,
  setSession: (token, roleId) =>
    set(() => {
      localStorage.setItem('token', token);
      if (roleId != null) localStorage.setItem('roleId', String(roleId));
      else localStorage.removeItem('roleId');
      return { token, roleId };
    }),
  setToken: (token) =>
    set(() => {
      if (token) localStorage.setItem('token', token);
      else {
        localStorage.removeItem('token');
        localStorage.removeItem('roleId');
      }
      return { token, roleId: token ? Number(localStorage.getItem('roleId')) || null : null };
    }),
  clearSession: () =>
    set(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('roleId');
      return { token: null, roleId: null };
    }),
  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark;
      document.documentElement.classList.toggle('dark', next);
      return { isDark: next };
    })
}));
