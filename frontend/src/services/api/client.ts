import axios from 'axios';
import { useAppStore } from '../../store/appStore';

const resolveBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envBaseUrl) return envBaseUrl;
  console.warn('VITE_API_BASE_URL is not set. Falling back to /api/v1.');
  return '/api/v1';
};

const baseURL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().setToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
