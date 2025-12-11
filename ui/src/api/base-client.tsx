import axios from 'axios';
import { urls } from '@/utils/urls';
import { AUTH_TOKEN_STORAGE_KEY, AUTH_TOKEN_HEADER_KEY } from '@/utils/constants';

const baseClient = axios.create({
  baseURL: '/api',
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
    // Don't redirect if already on auth pages (login or signup)
    const isAuthPage = window.location.pathname === urls.login.path() || 
                       window.location.pathname === urls.signup.path();
    
    if (!isAuthPage && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('token');
      window.location.href = urls.login.path();
    }
    return Promise.reject(error);
  }
);

export { baseClient };
