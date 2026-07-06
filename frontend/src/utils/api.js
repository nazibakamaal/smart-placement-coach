import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: "https://smart-placement-coach.onrender.com/api", // Proxied via Vite config to http://localhost:10000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add JWT authorization token if it exists in local storage
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

export default api;
