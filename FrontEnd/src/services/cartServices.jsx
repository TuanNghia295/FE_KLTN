import { useMutation, useQuery } from '@tanstack/react-query';
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

//Call API Get Cart by User ID
const getCartByUserID = async ({ queryKey }) => {
  const [_key, _id] = queryKey;
  const response = await axiosClient.get(`/cart/cartInfo/${_id}`)
  return response.items
}

//Hook Get Cart by User ID
export const useGetCartByUserID = (_id) => {
  const { data: listCart, isLoading: loadingCart } = useQuery({
    queryKey: ['cart', _id],
    queryFn: getCartByUserID,
    enabled: !!_id, // chỉ gọi khi có _id
    refetchOnWindowFocus: false,
  });

  return { listCart, loadingCart}
}