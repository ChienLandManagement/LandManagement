import axios from 'axios';
import { clearAuth, getAccessToken } from '@/entities/session';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const publicClient = axios.create({ baseURL });

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
