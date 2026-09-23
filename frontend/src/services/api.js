import axios from 'axios';

export const API_BASE_URL =
  (import.meta.env.VITE_API_ENDPOINT || 'https://dtechsupreme.com/api').replace(/\/$/, '');

let redirectingForAuth = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message || '';
    const authExpired =
      status === 401 ||
      status === 403 ||
      /token has expired|token.*invalid|no token provided/i.test(serverMessage);

    if (authExpired && !String(error?.config?.url || '').includes('/auth/login')) {
      localStorage.removeItem('token');

      if (!redirectingForAuth && typeof window !== 'undefined') {
        redirectingForAuth = true;
        const currentPath = window.location.pathname;
        const loginTarget = `/login?reason=session_expired&from=${encodeURIComponent(currentPath)}`;
        window.location.replace(loginTarget);
      }
    }

    const err = new Error(serverMessage || error?.message || 'Unable to connect to the server');
    err.status = status;
    err.authExpired = authExpired;
    return Promise.reject(err);
  },
);

export function isAuthError(error) {
  return Boolean(error?.authExpired || error?.status === 401 || error?.status === 403);
}

export default api;
