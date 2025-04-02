import axiosClient from "./axiosClient";
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStoreProvider } from '../contexts/StoreProvider'

export const register = async (values) => {
  const response = await axiosClient.post(`/auth/register`, values)

  return response
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onMutate: () => {
      console.log("Đang đăng ký...");
    },
    onSuccess: () => {
      toast.success("Tạo tài khoản thành công", {
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Đăng ký thất bại", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  });
}

export const login = async (values) => {
  const response = await axiosClient.post(`/auth/login`, values, {
    withCredentials: true, // Để gửi cookie
  });
  console.log(response)

  localStorage.setItem("accesstoken", response.accessToken);
  return response;
};

export function useLogin() {
  const navigate = useNavigate();

  const { getInfo } = useStoreProvider();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      getInfo(data);
      toast.success("Đăng nhập thành công", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      navigate('/'); // Chuyển hướng sau khi đăng nhập
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "❌ Đăng nhập thất bại!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    },
  })
}

export const getUserInfo = async (accesstoken) => {
  const response = await axiosClient.get('/users/userInfo', {
    headers: {
      Authorization: `Bearer ${accesstoken}`, // Gửi token trong header
    },
  })

  return response
}

export const logout = async () => {
  const response = await axiosClient.post('/auth/logout')
  localStorage.removeItem("accesstoken", response.accessToken);

  return response
}
