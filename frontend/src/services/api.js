import axios from 'axios';

// If REACT_APP_API_URL is set, use it. 
// Otherwise, on Vercel (where window exists and origin isn't localhost), use the current domain.
// Fallback to localhost for local development.
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
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

// global response handler: if token is missing/invalid or account not admin, redirect to admin login when on admin pages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.message || '';
    if ((status === 401 || status === 403) && (msg === 'Admin only' || window.location.pathname.startsWith('/admin'))) {
      // clear stored token and send to admin login
      localStorage.removeItem('token');
      localStorage.removeItem('adminMode');
      window.location.href = '/staff/admin-portal-access';
    }
    return Promise.reject(err);
  }
);

export default api;