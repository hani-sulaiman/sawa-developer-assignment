import axios from 'axios';

const TOKEN_KEY = 'medbook_token';
const USER_KEY = 'medbook_user';
const UNAUTHORIZED_EVENT = 'medbook:unauthorized';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error?.config?.url ?? '');
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/me');

      const hasToken = !!localStorage.getItem(TOKEN_KEY);

      // Only treat 401s as a "session expired" if we previously had a token
      // and the request was not an auth endpoint.
      if (hasToken && !isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        // SPA-safe: let the app handle navigation without a full refresh
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
