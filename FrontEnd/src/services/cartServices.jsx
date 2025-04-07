import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../apis/axiosClient';

//Call API Add To Cart
const addToCart = async (data) => {
  const response = await axiosClient.post('/cart/add', data);
  return response;
};

//Hook Add To Cart
export function useAddToCart() {
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      toast.success('Add product to cart successfully !', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
    onError: (error) => {
      console.log('error when add to cart', error.response?.data);

      toast.error(error.response?.data?.message || 'Add product to cart unsuccessfully !', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}
