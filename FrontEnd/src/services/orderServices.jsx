import { toast } from 'react-toastify';
import axiosClient from '../apis/axiosClient.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// user Lấy danh sách đơn hàng của mình
const getOrder = async () => {
  const res = await axiosClient.get('/orders/user');
  return res;
};

// user xem chi tiết đơn hàng bằng orderId
const getOrderById = async (orderId) => {
  try {
    const res = await axiosClient.get(`/orders/user/${orderId}`);
    return res;
  } catch (error) {
    console.error(`Error fetching order with ID: ${orderId}`, error);
    throw error;
  }
};

// user Huy don hang
const cancelOrder = async (id) => {
  const response = await axiosClient.delete(`/orders/user/${id}`);
  return response.data;
};

export const useOrder = () => {
  const queryClient = useQueryClient();
  const { data: myOrdder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order'],
    queryFn: getOrder,
  });

  const {
    mutate: getOrderDetail,
    data: orderDetail,
    isLoading: isLoadingDetail,
    isError,
    error,
  } = useMutation({
    mutationKey: ['orderDetail'],
    mutationFn: (orderId) => getOrderById(orderId),
    onSuccess: (data) => {
      console.log('Detail order fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching order detail:', error);
    },
  });

  const { mutate: cancelOrderMutation } = useMutation({
    mutationFn: (id) => cancelOrder(id),
    onSuccess: () => {
      console.log('Order cancelled successfully');
      toast.success('Order cancelled successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      setInterval(() => {
        window.location.replace('/my-orders');
      }, 15000);
    },
    onError: (error) => {
      console.error('Error cancelling order:', error.message);
    },
  });

  return {
    myOrdder,
    isLoadingOrder,
    getOrderDetail,
    cancelOrderMutation,
    orderDetail,
    isLoadingDetail,
    isError,
    error,
  };
};
