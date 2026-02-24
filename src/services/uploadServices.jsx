import { useMutation } from '@tanstack/react-query';
import AxiosClient from '../apis/axiosClient';
import { activeStorageService } from './activeStorageService';
import useStore from '../store/useStore';

const uploadAvatar = async (file) => {
  const blobSignedId = await activeStorageService.uploadFile(file);

  const res = await AxiosClient.patch('/users/userInfo', {
    user: { avatar: blobSignedId },
  });

  return res;
};

export const useUploadAvatar = () => {
  const getInfo = useStore((state) => state.getInfo);
  const userInfo = useStore((state) => state.userInfo);
  const setIsUploadingAvatar = useStore((state) => state.setIsUploadingAvatar);

  return useMutation({
    mutationKey: ['upload-avatar'],
    mutationFn: uploadAvatar,
    onMutate: () => {
      setIsUploadingAvatar(true);
    },
    onSuccess: (data) => {
      // console.log('✅ Upload Avatar Success', data);

      // 🔥 Update Zustand → UI đổi NGAY
      getInfo({
        ...userInfo,
        avatarUrl: `${data.avatar_url}?t=${Date.now()}`,
      });
      setIsUploadingAvatar(false);
    },

    onError: (error) => {
      console.error('❌ Error when trying update avatar user', error?.response?.data || error);
      setIsUploadingAvatar(false);
    },
  });
};
