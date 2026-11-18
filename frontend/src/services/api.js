import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token from localStorage & handle FormData
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type'); // Let the browser set the multipart boundary
  }
  return config;
});

// Response interceptor: handle 401 (logout)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        sessionStorage.setItem(
          'campusconnect:returnTo',
          `${window.location.pathname}${window.location.search}${window.location.hash}`
        );
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
