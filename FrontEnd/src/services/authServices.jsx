import axiosClient from '../apis/axiosClient';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStore from '../store/useStore';

// API đăng ký
export const register = async (values) => {
  const response = await axiosClient.post(`/auth/register`, values);
  return response;
};

// Hook đăng ký
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onMutate: () => {
      console.log('Đang đăng ký...');
    },
    onSuccess: () => {
      toast.success('Tạo tài khoản thành công', {
        position: 'top-center',
        autoClose: 3000,
      });
      navigate('/login'); // Chuyển hướng sau khi đăng ký thành công
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

// API đăng nhập
export const login = async (values) => {
  const response = await axiosClient.post(`/auth/login`, values, {
    withCredentials: true, // Để gửi cookie
  });
  localStorage.setItem('accesstoken', response.data.accessToken); // Lưu token vào localStorage
  return response.data;
};

// Hook đăng nhập
export function useLogin() {
  const navigate = useNavigate();
  const getInfo = useStore((state) => state.getInfo); // Lấy hàm cập nhật thông tin từ Zustand

  return useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: (data) => {
      getInfo(data); // Cập nhật thông tin người dùng trong Zustand
      toast.success('Sign in successfully !', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      navigate('/'); // Chuyển hướng sau khi đăng nhập thành công
    },
    onError: (error) => {
      console.log('error', error);

      toast.error(error.response?.data?.message || 'Sign in unsuccessfully !', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
    },
  });
}

// API lấy thông tin người dùng
export const getUserInfo = async () => {
  const response = await axiosClient.get('/users/userInfo');
  return response.data;
};

// API đăng xuất
export const logout = async () => {
  const response = await axiosClient.post('/auth/logout');
  localStorage.removeItem('accesstoken'); // Xóa token khỏi localStorage
  return response;
};

// Hook đăng xuất
export function useLogout() {
  const clearInfo = useStore((state) => state.clearInfo); // Lấy hàm xóa thông tin từ Zustand
  const clearCart = useStore((state) => state.clearCart); // Clear cart user

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearInfo(); // Xóa thông tin người dùng trong Zustand
      clearCart();
      toast.success('Đăng xuất thành công', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Đăng xuất thất bại', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}
