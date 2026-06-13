import axios from 'axios';

// Create Axios client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add Bearer Token from localStorage if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: capture 401 unauthorized and logout user
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user details on auth failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      
      // Dispatch custom event to notify App to log out
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
