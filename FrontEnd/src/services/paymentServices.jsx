import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

// 1. Tính phí vận chuyển
const fetchShippingFee = async (toAddress) => {
  if (!toAddress) {
    return null;
  }
  try {
    const { data } = await axiosClient.post('/payment/calculate-shipping-fee', { toAddress });
    return data;
  } catch (error) {
    console.error('Error fetching shipping fee:', error.response?.data || error.message);
    throw new Error(error.response?.data?.details || error.response?.data?.error || 'Failed to calculate shipping fee');
  }
};

// 2. Tạo đơn hàng (và có thể lấy URL thanh toán PayPal từ backend)
const createOrderApi = async (orderPayload) => {
  try {
    // API endpoint này giờ sẽ xử lý cả việc tạo đơn hàng
    // và khởi tạo thanh toán PayPal nếu cần
    const response = await axiosClient.post('/payment/createOrder', orderPayload);
    // Backend sẽ trả về { message, order } hoặc { message, order, paymentUrl }
    console.log('Order creation/payment initiation response:', response);

    return response;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    // Ném lỗi chi tiết từ backend nếu có
    throw new Error(
      error.response?.data?.details?.join(', ') || error.response?.data?.error || 'Failed to create order'
    );
  }
};

// === React Query Hooks ===

// Hook để lấy phí vận chuyển
export const useShippingFee = (toAddress) => {
  return useQuery({
    queryKey: ['shippingFee', toAddress],
    queryFn: () => fetchShippingFee(toAddress),
    enabled: !!toAddress,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Hook để tạo đơn hàng (và nhận URL thanh toán nếu có)
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrderApi,
    onSuccess: (data) => {
      // data có thể là { message, order } hoặc { message, order, paymentUrl }
      console.log('Order creation/payment initiation successful:', data);
      // Không invalidate cart ở đây ngay nếu là PayPal, chờ thanh toán thành công
      // queryClient.invalidateQueries(['cart']);

      // Quan trọng: Trả về data để component sử dụng (ví dụ: lấy paymentUrl)
      return data;
    },
    onError: (error) => {
      console.error('Order creation/payment initiation failed:', error);
    },
  });
};
