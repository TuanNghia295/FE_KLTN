import axiosClient from '../apis/axiosClient';
import { useQuery } from '@tanstack/react-query';

// Get banner list from API
const getBanners = async () => {
  try {
    const res = await axiosClient.get('/banners');
    // Backend trả về { data: [...] }
    return res.data;
  } catch (error) {
    // console.log('Error fetching banners:', error);
    return [];
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
