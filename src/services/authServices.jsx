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

// API đăng nhập
export const login = async (values) => {
  const response = await axiosClient.post(`/auth/login`, values);
  console.log('RES', response);
  return response;
};

// API reset mật khẩu
export const resetPassword = async (email) => {
  const response = await axiosClient.post(`/auth/reset-password`, { email });
  console.log('response', response);

  return response;
};

// API cập nhật mật khẩu
export const updatePassword = async ({ email, newPassword }) => {
  const response = await axiosClient.post(`/auth/update-password`, {
    email,
    newPassword,
  });
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
      navigate('/login');
    },
    onError: (error) => {
      console.log('register error', error.response?.data?.error);

      toast.error('Email or Phone numbers used another account', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

// Hook đăng nhập
export function useLogin() {
  const navigate = useNavigate();
  const getInfo = useStore((state) => state.getInfo);

  return useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem('accesstoken', data.access_token);
      localStorage.setItem('refreshtoken', data.refresh_token);

      // Store user info in zustand
      getInfo(data.user);

      toast.success('Sign in successfully !', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      navigate('/');
    },
    onError: (error) => {
      console.log('error', error);
      toast.error(error.message || 'Sign in unsuccessfully !', {
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

// Hook reset mật khẩu
export function useResetPassword() {
  return useMutation({
    mutationKey: ['resetPassword'],
    mutationFn: resetPassword,
    onSuccess: () => {
      console.log('Gửi email thành công!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gửi email thất bại', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

// Hook cập nhật mật khẩu
export function useUpdatePassword() {
  return useMutation({
    mutationKey: ['updatePassword'],
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Mật khẩu đã được cập nhật thành công!', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật mật khẩu thất bại', {
        position: 'top-center',
        autoClose: 3000,
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
  const refreshToken = localStorage.getItem('refreshtoken');
  const response = await axiosClient.post('/auth/logout', {
    refresh_token: refreshToken,
  });
  localStorage.removeItem('accesstoken');
  localStorage.removeItem('refreshtoken');
  return response;
};

// Hook đăng xuất
export function useLogout() {
  const clearInfo = useStore((state) => state.clearInfo);
  const clearCart = useStore((state) => state.clearCart);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearInfo();
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
