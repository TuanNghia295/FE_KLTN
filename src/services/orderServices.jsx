import { toast } from 'react-toastify';
import axiosClient from '../apis/axiosClient.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const mapOrderStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const normalizeOrder = (order) => ({
  ...order,
  status: mapOrderStatus(order?.status),
});

export const parseCancelOrderError = (error) => {
  const payload = error?.response?.data || error;
  const code = payload?.error || payload?.code || null;
  const message = payload?.message || error?.message || 'Failed to cancel order';

  return {
    code,
    message,
    raw: payload,
  };
};

// user Lấy danh sách đơn hàng của mình
const getOrder = async ({ status, page = 1, perPage = 10 } = {}) => {
  const res = await axiosClient.get('/orders', {
    params: {
      status,
      page,
      per_page: perPage,
    },
  });
  const rawOrders = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
  const orders = rawOrders.map(normalizeOrder);
  const rawMeta = res?.meta || res?.data?.meta;
  const perPageValue = rawMeta?.per_page ?? perPage;
  const totalPages =
    rawMeta?.total_pages ?? (rawMeta?.total_count ? Math.ceil(rawMeta.total_count / perPageValue) : undefined);

  return {
    orders,
    meta: rawMeta ? { ...rawMeta, total_pages: totalPages } : rawMeta,
  };
};

// user xem chi tiết đơn hàng bằng orderId
const getOrderById = async (orderId) => {
  try {
    const res = await axiosClient.get(`/orders/${orderId}`);
    const payload = res?.data ?? res;
    return normalizeOrder(payload);
  } catch (error) {
    console.error(`Error fetching order with ID: ${orderId}`, error);
    throw error;
  }
};

const getCancellationReasons = async () => {
  const res = await axiosClient.get('/cancellation_reasons');
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
};

// user gửi yêu cầu hủy đơn hàng
const cancelOrder = async ({ id, payload }) => {
  const response = await axiosClient.post(`/orders/${id}/cancel`, payload);
  return response?.data ?? response;
};

export const useCancellationReasons = () => {
  return useQuery({
    queryKey: ['cancellation-reasons'],
    queryFn: getCancellationReasons,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrder = ({ status, page = 1, perPage = 10 } = {}) => {
  const queryClient = useQueryClient();
  const { data: myOrdder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', status, page, perPage],
    queryFn: () => getOrder({ status, page, perPage }),
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
      // console.log('Detail order fetched successfully:', data);
    },
    onError: (error) => {
      // console.error('Error fetching order detail:', error);
    },
  });

  const { mutate: cancelOrderMutation, mutateAsync: cancelOrderMutationAsync, isPending: isCancellingOrder } = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderDetail'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      toast.success('Request cancel order successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      setInterval(() => {
        window.location.replace('/my-orders');
      }, 1000);
    },
    onError: (error) => {
      const parsedError = parseCancelOrderError(error);
      console.error('Error cancelling order:', parsedError.message);
    },
  });

  return {
    myOrdder,
    isLoadingOrder,
    getOrderDetail,
    cancelOrderMutation,
    cancelOrderMutationAsync,
    isCancellingOrder,
    orderDetail,
    isLoadingDetail,
    isError,
    error,
  };
};
