
import axios from 'axios';

const API_URL = 'https://iphonecamerounapi.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
