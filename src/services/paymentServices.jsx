import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

// 1. Tính phí vận chuyển
const fetchShippingFee = async ({ lat, lng, total_item_qty }) => {
  if (lat == null || lng == null || total_item_qty == null) {
    return null;
  }
  try {
    const data = await axiosClient.post('/orders/shipping_fee', null, { params: { lat, lng, total_item_qty } });
    return data?.data ?? data;
  } catch (error) {
    console.error('Error fetching shipping fee:', error.response?.data || error.message);
    throw new Error(error.response?.data?.details || error.response?.data?.error || 'Failed to calculate shipping fee');
  }
};

// 2. Tạo đơn hàng
const createOrderApi = async (orderPayload) => {
  try {
    console.log('Payload being sent to backend:', orderPayload);
    const response = await axiosClient.post('/orders', orderPayload);
    console.log('Order creation response:', response);

    return response;
  } catch (error) {
    const errorPayload = error?.error ? error : error?.response?.data;
    console.error('Error creating order:', errorPayload || error.message);

    if (errorPayload?.error === 'inventory_locked') {
      throw new Error(errorPayload.message || 'Inventory is being processed. Please retry.');
    }

    throw new Error(
      errorPayload?.details?.join(', ') || errorPayload?.message || errorPayload?.error || 'Failed to create order'
    );
  }
};

// === React Query Hooks ===

// Hook để lấy phí vận chuyển
export const useShippingFee = ({ lat, lng, total_item_qty }) => {
  return useQuery({
    queryKey: ['shippingFee', lat, lng, total_item_qty],
    queryFn: () => fetchShippingFee({ lat, lng, total_item_qty }),
    enabled: lat != null && lng != null && total_item_qty != null,
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
