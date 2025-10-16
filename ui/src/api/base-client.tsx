import axios from 'axios';
import { urls } from '@/utils/urls';
import { AUTH_TOKEN_STORAGE_KEY, AUTH_TOKEN_HEADER_KEY } from '@/utils/constants';

// In production, use /api which is proxied by nginx to the API service
// In development, use the VITE_API_URL env var or default to localhost:3000
const apiUrl = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

const baseClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to the request headers
baseClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.set(AUTH_TOKEN_HEADER_KEY, token);
    // insert .json at the end of the url and before the query string
    if (config.url && config.url.includes('?')) {
      config.url = `${config.url.split('?')[0]}.json?${config.url.split('?')[1]}`;
    } else {
      config.url = `${config.url}.json`;
    }
  }
  return config;
});

// Handle 401 and 403 errors
baseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (window.location.pathname !== urls.login.path()) {
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = urls.login.path();
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export { baseClient };
