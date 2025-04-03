import { useQuery } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

// API: Lấy tất cả sản phẩm
const getAllProducts = async () => {
  const response = await axiosClient.get('/products/getAllProducts');
  return response.data;
};

// API: Lấy chi tiết sản phẩm
const getDetailProducts = async (_id) => {
  const response = await axiosClient.get(`/products/${_id}`);
  return response.data;
};

// Hook: Lấy danh sách sản phẩm
export const useProducts = () => {
  const { data: productList, isLoading: loadingProductList } = useQuery({
    queryKey: ['productList'],
    queryFn: getAllProducts,
  });

  return {
    productList,
    loadingProductList,
  };
};

// Hook: Lấy chi tiết sản phẩm
export const useProductDetail = (_id) => {
  const { data: productDetail, isLoading: loadingProductDetail } = useQuery({
    queryKey: ['productDetail', _id], // Truyền `_id` vào queryKey để cache theo từng sản phẩm
    queryFn: () => getDetailProducts(_id), // Truyền `_id` vào hàm API
    enabled: !!_id, // Chỉ chạy query nếu `_id` tồn tại
  });

  return {
    productDetail,
    loadingProductDetail,
  };
};
