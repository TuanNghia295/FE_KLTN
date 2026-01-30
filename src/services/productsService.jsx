import { useQuery } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

// API: Lấy tất cả sản phẩm
const getAllProducts = async ({
  perPage,
  page,
  search = '',
  sortBy = '',
  sortDir = '',
  minPrice = '',
  maxPrice = '',
  categoryIds = [], // THAY ĐỔI: từ categoryId thành categoryIds (array)
}) => {
  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString(),
  });

  if (search) params.append('q', search);
  if (sortBy) params.append('sort_by', sortBy);
  if (sortDir) params.append('sort_dir', sortDir);
  if (minPrice) params.append('min_price', minPrice);
  if (maxPrice) params.append('max_price', maxPrice);

  // Gửi categoryIds dưới dạng comma-separated string
  if (categoryIds && categoryIds.length > 0) {
    params.append('category_id', categoryIds.join(','));
  }

  const response = await axiosClient.get(`/products?${params}`);
  return {
    data: response.data,
    total: response.meta?.total_pages || Math.ceil(response.totalPage / perPage),
  };
};

// Hook: Lấy danh sách sản phẩm
export const useProducts = (
  perPage = 8,
  page = 1,
  search = '',
  sortBy = '',
  sortDir = '',
  minPrice = '',
  maxPrice = '',
  categoryIds = [] // THAY ĐỔI: từ categoryId thành categoryIds (array)
) => {
  const { data, isLoading: loadingProductList } = useQuery({
    queryKey: ['productList', perPage, page, search, sortBy, sortDir, minPrice, maxPrice, categoryIds],
    queryFn: () => getAllProducts({ perPage, page, search, sortBy, sortDir, minPrice, maxPrice, categoryIds }),
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
const getProductsByCategoryID = async ({ queryKey }) => {
  const [_id, perPage, page, search, sortBy, sortDir, minPrice, maxPrice] = queryKey;
  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString(),
  });

  if (search) params.append('q', search);
  if (sortBy) params.append('sort_by', sortBy);
  if (sortDir) params.append('sort_dir', sortDir);
  if (minPrice) params.append('min_price', minPrice);
  if (maxPrice) params.append('max_price', maxPrice);

  const response = await axiosClient.get(`/products?category_id=${_id}&${params}`);
  return {
    data: response.data,
    total: response.meta?.total_pages || response.pagination?.totalPages,
  };
};

// Hook: Lấy danh sách sản phẩm theo danh mục
export const useProductsCategory = (
  _id,
  perPage,
  page,
  search,
  sortBy = '',
  sortDir = '',
  minPrice = '',
  maxPrice = ''
) => {
  const { data, isLoading: loadingProductCateList } = useQuery({
    queryKey: ['productListCategory', _id, perPage, page, search, sortBy, sortDir, minPrice, maxPrice],
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
  return response;
};

// Hook: Lấy chi tiết sản phẩm
export const useProductDetail = (_id) => {
  console.log('_id', _id);

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
