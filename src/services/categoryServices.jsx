import { useQuery } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

// q, status, parent_id, category_ids, page, per_page
const getListCategory = async (params) => {
  const response = await axiosClient.get('/categories', { params });

  return response;
};

export const useGetCategory = (params = {}) => {
  const { data: categoryList, isLoading: loadingCategoryList } = useQuery({
    queryKey: ['categoryList', params], // cache theo params
    queryFn: () => getListCategory(params),
  });

  return {
    categoryList,
    loadingCategoryList,
  };
};
