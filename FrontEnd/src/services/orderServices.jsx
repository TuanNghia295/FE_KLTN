import axiosClient from '../apis/axiosClient.js';
import { useMutation, useQuery } from '@tanstack/react-query';

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

export const useOrder = () => {
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
    mutationFn: (orderId) => getOrderById(orderId),
    onSuccess: (data) => {
      console.log('Order detail:', data);
    },
    onError: (error) => {
      console.error('Error fetching order detail:', error);
    },
  });

  return {
    myOrdder,
    isLoadingOrder,
    getOrderDetail,
    orderDetail,
    isLoadingDetail,
    isError,
    error,
  };
};
