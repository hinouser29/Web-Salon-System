import axios from 'axios';

import toast from 'react-hot-toast';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này. Giao diện sẽ tự động tải lại quyền mới nhất.');
      window.dispatchEvent(new Event('auth:sync-permissions'));
    } else if (status >= 500) {
      toast.error('Hệ thống đang bảo trì hoặc xảy ra lỗi. Vui lòng thử lại sau.');
    }
    return Promise.reject(error);
  }
);

export function resolveFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}

export default axiosClient;
