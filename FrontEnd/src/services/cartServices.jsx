import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../apis/axiosClient';
import useStore from '../store/useStore'; //Gọi Zustand useStore (Lưu trữ thông tin gio hang)

//Call API Add To Cart
const addToCart = async (data) => {
  const response = await axiosClient.post('/cart/add', data);
  return response.items;
};

// Clear cart
const clearCart = async (userId) => {
  console.log('Clearing cart for userId:', userId);

  const response = await axiosClient.delete(`/cart/delete/${userId}`);
  return response.data; // Ensure the response data is returned
};

//Hook Add To Cart
export function useAddToCart() {
  const setCartItems = useStore((state) => state.setCartItems);
  const userId = useStore((state) => state.userInfo?._id);
  const { listCart, refetchCart } = useGetCartByUserID(userId);

  return useMutation({
    mutationFn: addToCart,
    onSuccess: async () => {
      await refetchCart();
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
  const response = await axiosClient.get(`/cart/cartInfo/${_id}`);
  return response.items;
};

//Hook Get Cart by User ID
export const useGetCartByUserID = (_id) => {
  const {
    data: listCart,
    isLoading: loadingCart,
    refetch: refetchCart,
  } = useQuery({
    queryKey: ['cart', _id],
    queryFn: getCartByUserID,
    enabled: !!_id, // chỉ gọi khi có _id
    refetchOnWindowFocus: false,
  });

  return { listCart, loadingCart, refetchCart };
};

//Call API Update Cart by User ID
const updateCartByUserID = async ({ userId, productId, size, color, quantity }) => {
  const searchParams = new URLSearchParams({
    productId,
    size,
    color,
    quantity,
  }).toString();
  const response = await axiosClient.put(`/cart/update/${userId}?${searchParams}`);
  return response.data; // Ensure the response data is returned
};

//Hook Update Cart
export function useUpdateCartByUserID() {
  return useMutation({
    mutationFn: updateCartByUserID,
    onSuccess: (updatedCart) => {
      toast.success('Cart updated successfully!', {
        position: 'top-center',
        autoClose: 3000,
      });
      console.log('Updated cart:', updatedCart); // Log the updated cart for debugging
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update cart!', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

export function useClearCart({ userId }) {
  const { mutate: clearingCartFn, isPending: isClearing } = useMutation({
    mutationFn: () => clearCart(userId),
    mutationKey: ['clearCart', userId],
    onSuccess: () => {
      console.log('Cart cleared successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to clear cart!', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });

  return { clearingCartFn, isClearing };
}
