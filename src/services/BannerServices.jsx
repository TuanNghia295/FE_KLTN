import axiosClient from '../apis/axiosClient';
import { useQuery } from '@tanstack/react-query';
// get banner list
const getBanners = async () => {
  try {
    // const res = await axiosClient.get('/banners/getAll');
    const res = {
      data: null,
    };
    return res.data;
  } catch (error) {
    console.log('Error fetching banners:', error);
  }
};

export const useBanner = () => {
  const { data: listBanner, isLoading: loadingBanner } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    refetchOnWindowFocus: false,
  });

  return { listBanner, loadingBanner };
};
