import axios from 'axios';

// IMPORTANT: Set REACT_APP_API_URL in Vercel settings to your Railway URL (e.g., https://your-backend.railway.app/api)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
});

export { IMAGE_BASE_URL };


// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// global response handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.message || '';
    if ((status === 401 || status === 403) && (msg === 'Admin only' || window.location.pathname.startsWith('/admin'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminMode');
      window.location.href = '/auth/admin-secure-v2';
    }
    return Promise.reject(err);
  }
);

export default api;