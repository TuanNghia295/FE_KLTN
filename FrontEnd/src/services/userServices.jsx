import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../apis/axiosClient';

export const updateUser = async (values) => {
  const accesstoken = localStorage.getItem('accesstoken');
  console.log(accesstoken);
  const response = await axiosClient.patch('/users/updateUser', values, {
    headers: {
      Authorization: `Bearer ${accesstoken}`, // Gửi token trong header
    },
  });

  return response;
};

export function useUpdateUser() {
  return useMutation({
    mutationFn: updateUser,
    onMutate: () => {
      console.log('Đang cập nhật...');
    },
    onSuccess: () => {
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
