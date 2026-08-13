import axios from 'axios';
import { getToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const status = error.response?.status;
    const retryable = !error.response || status >= 500 || status === 429 || status === 408;
    config.__retryCount = config.__retryCount || 0;

    if (!retryable || config.__retryCount >= 2) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;
    await sleep(400 * config.__retryCount);
    return api(config);
  }
);
