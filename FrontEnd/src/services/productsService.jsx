import { useQuery } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

// API: Lấy tất cả sản phẩm
const getAllProducts = async ({perPage, page, search = ''}) => {
  const params = new URLSearchParams({
    perPage: perPage.toString(),
    page: page.toString(),
    search,
  })
  const response = await axiosClient.get(`/products/getAllProducts?${params}`);
  return {
    data: response.data,
    total: Math.ceil(response.totalPage/perPage)
  }
};

// Hook: Lấy danh sách sản phẩm
export const useProducts = (perPage = 8, page = 1, search = '') => {
  const { data, isLoading: loadingProductList } = useQuery({
    queryKey: ['productList', perPage, page, search],
    queryFn: () =>  getAllProducts({perPage, page, search}),
    keepPreviousData: true,
    enabled: !!page,
  });

  return {
    productList: data?.data,
    total: data?.total,
    loadingProductList,
  };
};

// API: Lấy danh sách sản phẩm theo danh mục
const getProductsByCategoryID = async ({queryKey}) => {
  const [_key, _id, perPage, page, search] = queryKey
  const params = new URLSearchParams({
    perPage: perPage.toString(),
    page: page.toString(),
    search,
  })
  const response = await axiosClient.get(`/products/getAllProducts/${_id}?${params}`);
  return {
    data: response.data,
    total: response.pagination.totalPages
  }
}

// Hook: Lấy danh sách sản phẩm theo danh mục
export const useProductsCategory = (_id, perPage, page, search) => {
  const { data, isLoading: loadingProductCateList } = useQuery({
    queryKey: ['productList', _id, perPage, page, search],
    queryFn: getProductsByCategoryID,
    enabled: !!_id,
  });

  return {
    productCateList: data?.data,
    totalCate: data?.total,
    loadingProductCateList,
  };
};

// API: Lấy chi tiết sản phẩm
const getDetailProducts = async (_id) => {
  const response = await axiosClient.get(`/products/${_id}`);
  return response.data;
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
