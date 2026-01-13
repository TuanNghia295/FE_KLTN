import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { END_POINTS } from './endpoints';

// 🧠 Khai báo type AxiosClient chung
interface TypedAxiosInstance extends AxiosInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const AxiosClient: TypedAxiosInstance = axios.create({
  baseURL: END_POINTS,
  timeout: 10000,
}) as TypedAxiosInstance;

// 🟡 Request Interceptor
AxiosClient.interceptors.request.use((config) => {
  if (!config.url?.includes('auth/logout')) {
    const token = localStorage.getItem('accesstoken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 🟢 Response Interceptor — trả về data trực tiếp
AxiosClient.interceptors.response.use(
  function <T>(response: AxiosResponse<T>) {
    return response.data;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('auth/logout')) {
      // Clear tokens on 401 unauthorized
      localStorage.removeItem('accesstoken');
      localStorage.removeItem('refreshtoken');

      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default AxiosClient;
