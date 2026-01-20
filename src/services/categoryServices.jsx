import { useQuery } from '@tanstack/react-query';
import axiosClient from '../apis/axiosClient';

const getListCategory = async () => {
  const response = await axiosClient.get('/categories');
  console.log('response', response);

  return response;
};

//Hook Use GetListCategory
export const useGetCategory = () => {
  const { data: categoryList, isLoading: loadingCategoryList } = useQuery({
    queryKey: ['categoryList'],
    queryFn: getListCategory,
  });
  return {
    categoryList,
    loadingCategoryList,
  };
};
