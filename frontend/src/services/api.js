import axios from 'axios';

// Set default base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smarthealth-nexus.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90s timeout to handle Render free tier cold start (~50s wake-up)
});

// Request interceptor to attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sh_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), token might have expired or is invalid
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      // We can trigger a redirect or reload to reset context if needed
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
