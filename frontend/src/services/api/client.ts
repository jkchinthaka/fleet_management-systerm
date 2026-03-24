import axios from 'axios';
import { useAppStore } from '../../store/appStore';

const AUTH_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRY_ATTEMPTS = 1;

type RetryableRequestConfig = {
  _retryCount?: number;
  url?: string;
  method?: string;
  timeout?: number;
};

const isAuthRoute = (url = '') => /\/auth(-mongo)?\/login$/i.test(url);

const shouldRetryRequest = (error: any) => {
  const config = (error?.config ?? {}) as RetryableRequestConfig;
  const retryCount = config._retryCount ?? 0;
  const status = error?.response?.status;
  const isTimeout = error?.code === 'ECONNABORTED';
  const isNetworkError = error?.message === 'Network Error';

  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    return false;
  }

  if (status) {
    return false;
  }

  return isTimeout || isNetworkError;
};

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

  if (!import.meta.env.DEV) {
    console.warn('VITE_API_BASE_URL is not set in production. Configure it to your deployed backend, e.g. https://your-backend-domain/api/v1');
  }

  return '/api/v1';
};

const baseURL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL,
  timeout: DEFAULT_REQUEST_TIMEOUT_MS
});

apiClient.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isAuthRoute(config.url) && !config.timeout) {
    config.timeout = AUTH_REQUEST_TIMEOUT_MS;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldRetryRequest(error)) {
      const config = error.config as RetryableRequestConfig;
      config._retryCount = (config._retryCount ?? 0) + 1;

      // Brief delay helps with transient cold starts and connection hiccups.
      await new Promise((resolve) => setTimeout(resolve, 800));
      return apiClient.request(config as any);
    }

    if (error.response?.status === 401) {
      useAppStore.getState().setToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
