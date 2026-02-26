import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../apis/axiosClient';

const getBankAccountInfos = async () => {
  const response = await axiosClient.get('bank_account_infos');
  return response;
};

const createBankAccountInfo = async (payload) => {
  const response = await axiosClient.post('bank_account_infos', {
    bank_account_info: payload,
  });
  return response;
};

const updateBankAccountInfo = async ({ id, payload }) => {
  const response = await axiosClient.patch(`bank_account_infos/${id}`, {
    bank_account_info: payload,
  });
  return response;
};

export function useGetBankAccountInfos() {
  return useQuery({
    queryKey: ['bankAccountInfos'],
    queryFn: getBankAccountInfos,
  });
}

export function useCreateBankAccountInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBankAccountInfo,
    onSuccess: () => {
      toast.success('Update Successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['bankAccountInfos'] });
    },
    onError: (error) => {
      toast.error(error?.errors?.[0] || 'Error', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

export function useUpdateBankAccountInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBankAccountInfo,
    onSuccess: () => {
      toast.success('Update Successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['bankAccountInfos'] });
    },
    onError: (error) => {
      toast.error(error?.errors?.[0] || 'Error', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}
