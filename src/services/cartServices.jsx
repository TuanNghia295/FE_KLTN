import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../apis/axiosClient';
import useStore from '../store/useStore'; //Gọi Zustand useStore (Lưu trữ thông tin gio hang)

//Call API Add To Cart
const addToCart = async (data) => {
  const payload = {
    product_variant_id: data.product_variant_id,
    quantity: data.quantity,
  };
  const response = await axiosClient.post('/cart/items', { cart_item: payload });
  console.log('response', response.items);

  return response.items;
};

// Get cart
const getCart = async () => {
  try {
    const response = await axiosClient.get('/cart');
    return response;
  } catch (error) {
    // Nếu chưa login / token lỗi → trả cart rỗng
    if (error.response?.status === 401) {
      return { items: [] };
    }
    throw error;
  }
};

// Merge cart
export const mergeCart = async (items) => {
  const normalizedItems = (items || [])
    .map((item) => ({
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
    }))
    .filter((item) => item.product_variant_id && item.quantity);
  const response = await axiosClient.post('/cart/merge', { items: normalizedItems });

  return response;
};

// Clear cart
const clearCart = async (userId) => {
  console.log('Clearing cart for userId:', userId);

  const response = await axiosClient.delete(`/cart/items/${userId}`);
  return response.data; // Ensure the response data is returned
};

//Hook Add To Cart
export function useAddToCart() {
  const queryClient = useQueryClient();
  const userId = useStore((state) => state.userInfo?.id);

  return useMutation({
    mutationFn: async (data) => {
      console.log('[useAddToCart] userId', userId, 'userInfo', useStore.getState().userInfo);
      if (!userId) return { guest: true, data };
      return await addToCart(data);
    },
    onSuccess: async (result, variables) => {
      if (result?.guest) {
        const { addItemToGuestCart } = useStore.getState();
        const product = variables.product;
        const cartItem = {
          id: `${variables.productId}-${variables.product_variant_id}`,
          productId: variables.productId,
          product_variant_id: variables.product_variant_id,
          size: variables.size,
          color: variables.color,
          quantity: variables.quantity,
          product,
        };
        addItemToGuestCart(cartItem);
        toast.success('Add product to cart successfully !', {
          position: 'top-center',
          autoClose: 3000,
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['cart'] });
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

//Hook Get Cart
export const useGetCart = (enabled) => {
  const {
    data: cart,
    isLoading: loadingCart,
    refetch: refetchCart,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: !!enabled,
    initialData: { items: [] },
    refetchOnWindowFocus: false,
  });

  return { cart, loadingCart, refetchCart };
};

//Hook Merge Cart
export const useMergeCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mergeCart,
    onSuccess: () => {
      const { clearGuestCart } = useStore.getState();
      clearGuestCart();
      localStorage.removeItem('guest-cart'); // Remove persisted guest cart from localStorage
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

//Call API Update Cart by User ID
const updateCartItem = async ({ cartItemId, product_variant_id, quantity }) => {
  const response = await axiosClient.patch(`/cart/items/${cartItemId}`, {
    cart_item: { product_variant_id, quantity },
  });
  return response;
};

//Hook Update Cart
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCartItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      if (previousCart?.items) {
        const updatedItems = previousCart.items
          .map((item) => {
            if (item.id !== variables.cartItemId) {
              return item;
            }
            if (variables.quantity === 0) {
              return null;
            }
            return {
              ...item,
              product_variant_id: variables.product_variant_id ?? item.product_variant_id,
              quantity: variables.quantity,
            };
          })
          .filter(Boolean);
        queryClient.setQueryData(['cart'], { ...previousCart, items: updatedItems });
      }
      return { previousCart };
    },
    onError: (error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
      toast.error(error.response?.data?.message || 'Failed to update cart!', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
    onSuccess: () => {
      toast.success('Cart updated successfully!', {
        position: 'top-center',
        autoClose: 1000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
      // toast.error(error.response?.data?.message || 'Failed to clear cart!', {
      //   position: 'top-center',
      //   autoClose: 3000,
      // });
    },
  });

  return { clearingCartFn, isClearing };
}
