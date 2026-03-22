import axios from 'axios';
import { useAppStore } from '../../store/appStore';

const isLocalhostApi = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url);

const resolveBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envBaseUrl) {
    if (!import.meta.env.DEV && isLocalhostApi(envBaseUrl)) {
      console.warn('Ignoring localhost VITE_API_BASE_URL in production. Falling back to /api/v1.');
      return '/api/v1';
    }
    return envBaseUrl;
  }
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
