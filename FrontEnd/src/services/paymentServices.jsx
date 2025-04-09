import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

// === API Functions ===

// 1. Tính phí vận chuyển
const fetchShippingFee = async (toAddress) => {
  if (!toAddress) {
    // Không có địa chỉ thì không cần gọi API
    return null; // Hoặc throw error tùy logic mong muốn
  }
  try {
    const { data } = await axiosClient.post('/payment/calculate-shipping-fee', { toAddress });
    // Trả về đúng cấu trúc { totalFee, distance } từ backend
    return data;
  } catch (error) {
    console.error('Error fetching shipping fee:', error.response?.data || error.message);
    // Ném lỗi để React Query xử lý isError và error object
    throw new Error(error.response?.data?.details || error.response?.data?.error || 'Failed to calculate shipping fee');
  }
};

// 2. Tạo đơn hàng
const createOrderApi = async (orderPayload) => {
  try {
    const { data } = await axiosClient.post('/payment/createOrder', orderPayload);
    // Backend trả về { message, order }
    return data;
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
    queryKey: ['shippingFee', toAddress], // Key phụ thuộc vào địa chỉ
    queryFn: () => fetchShippingFee(toAddress),
    enabled: !!toAddress, // Chỉ kích hoạt query khi có địa chỉ
    staleTime: 5 * 60 * 1000, // Cache trong 5 phút
    refetchOnWindowFocus: false, // Tùy chọn: không fetch lại khi focus cửa sổ
    retry: 1, // Thử lại 1 lần nếu lỗi
  });
};

// Hook để tạo đơn hàng (Mutation)
export const useCreateOrder = () => {
  const queryClient = useQueryClient(); // Để vô hiệu hóa cache nếu cần sau khi đặt hàng thành công

  return useMutation({
    mutationFn: createOrderApi, // Hàm gọi API
    onSuccess: (data) => {
      console.log('Order created successfully:', data);
      // Xử lý thành công:
      // - Hiển thị thông báo thành công
      // - Chuyển hướng đến trang cảm ơn/chi tiết đơn hàng
      // - Vô hiệu hóa cache giỏ hàng (nếu có)
      // queryClient.invalidateQueries(['cart']); // Ví dụ vô hiệu hóa cache giỏ hàng
    },
    onError: (error) => {
      console.error('Order creation failed:', error);
      // Xử lý lỗi:
      // - Hiển thị thông báo lỗi chi tiết cho người dùng
    },
  });
};
