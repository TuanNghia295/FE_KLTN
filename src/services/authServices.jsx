import axiosClient from '../apis/axiosClient';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useStore from '../store/useStore';
import AxiosClient from '../apis/axiosClient';

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

// API: gửi email reset password
export const forgotPassword = async ({ email }) => {
  const response = await axiosClient.post('/users/forgot_password', {
    email,
  });
  return response.data;
};

// API: verify reset token
export const verifyResetToken = async ({ token }) => {
  const response = await axiosClient.get('/auth/reset-password/verify', {
    params: { token },
  });
  return response.data;
};

// API: reset password bằng token
export const resetPasswordWithToken = async ({ token, password, password_confirmation }) => {
  const response = await axiosClient.post('/auth/reset-password', {
    token,
    password,
    password_confirmation,
  });
  return response.data;
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

// Hook forgot password
export function useForgotPassword() {
  return useMutation({
    mutationKey: ['forgotPassword'],
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gửi email thất bại', { position: 'top-center', autoClose: 3000 });
    },
  });
}

// Hook verify reset token
export function useVerifyResetToken() {
  return useMutation({
    mutationKey: ['verifyResetToken'],
    mutationFn: verifyResetToken,
  });
}

// Hook reset password
export function useResetPasswordWithToken() {
  return useMutation({
    mutationKey: ['resetPasswordWithToken'],
    mutationFn: resetPasswordWithToken,
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
