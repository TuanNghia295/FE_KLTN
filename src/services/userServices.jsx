import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../apis/axiosClient';

export const userInfo = async () => {
  const res = await axiosClient.get('/users/userInfo');
  return res.user;
};

export const updateUser = async (values) => {
  const response = await axiosClient.patch('/users/userInfo', { user: values });
  return response;
};

export function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      console.log('Cập nhật thành công', data);
      if (data?.data?.address.length === 0) {
        return;
      }
      toast.success('Cập nhật thông tin thành công', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật thông tin thất bại', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

export function useGetUserInfo() {
  const accesstoken = localStorage.getItem('accesstoken');
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: userInfo,
    enabled: !!accesstoken,
  });
}
