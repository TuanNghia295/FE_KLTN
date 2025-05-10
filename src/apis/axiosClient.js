import axios from 'axios';
import queryString from 'querystring';

export const baseURL = 'https://be-kltn.onrender.com';

if (!baseURL) {
  console.error('⚠️ VITE_APP_BASE_URL is not defined. Check your .env file.');
}

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // quan trọng để gửi cookie refreshToken
  paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accesstoken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response.status === 401) {
      try {
        const response = await axios.post(`http://localhost:3001/auth/refresh_token`, {}, { withCredentials: true });
        console.log('🚀 Token mới:', response.data.accessToken);
        const newAccessToken = response.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(error.config);
      } catch (refreshError) {
        console.log('🚀 Refresh token không hợp lệ:', refreshError);
        localStorage.removeItem('accesstoken');
        // window.location.href = '/'; // Chuyển hướng đến trang đăng nhập
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
