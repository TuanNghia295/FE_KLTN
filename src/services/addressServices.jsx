import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../apis/axiosClient';

// API lấy danh sách thành phố, tỉnh
const getProvinces = async () => {
  const response = await axios.get('https://provinces.open-api.vn/api/?depth=2');
  return response.data; // Trả về danh sách thành phố
};

// API lấy danh sách phường / xã
const getWards = async ({ queryKey }) => {
  const [_key, districtCode] = queryKey;
  if (!districtCode) return [];
  const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
  return response.data.wards; // Trả về danh sách đường theo tỉnh, quận
};

// Hook: Lấy danh sách thành phố
export const useProvinces = () => {
  const {
    data: listProvinces,
    error: errorProvinces,
    isLoading: loadingProvinces,
  } = useQuery({
    queryKey: ['listProvinces'],
    queryFn: getProvinces,
  });

  const getProvinceByCode = (codeProvinces) => listProvinces?.find((p) => p.code === Number(codeProvinces));

  const getDistrictsByProvince = (provinceCode) => getProvinceByCode(provinceCode)?.districts || [];

  const getDistrictByCode = (provinceCode, districtCode) =>
    getDistrictsByProvince(provinceCode).find((d) => d.code === Number(districtCode));

  return {
    listProvinces,
    getProvinceByCode,
    getDistrictsByProvince,
    getDistrictByCode,
    errorProvinces,
    loadingProvinces,
  };
};

// Hook: Lấy danh sách phường xã
export const useWards = (districtCode) => {
  const { data: listWards } = useQuery({
    queryKey: ['listWards', districtCode],
    queryFn: getWards,
    enabled: !!districtCode, // Chỉ gọi khi có quận
  });

  return {
    listWards,
  };
};

const createAddress = async (payload) => {
  const response = await axiosClient.post('addresses', { address: payload });
  return response;
};

const updateAddress = async ({ id, payload }) => {
  const response = await axiosClient.patch(`addresses/${id}`, { address: payload });
  return response;
};

const deleteAddress = async (id) => {
  const response = await axiosClient.delete(`addresses/${id}`);
  return response;
};

const setDefaultAddress = async (id) => {
  const response = await axiosClient.patch(`addresses/${id}/set_default`);
  return response;
};

const getAddresses = async () => {
  const response = await axiosClient.get('addresses');
  return response;
};

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      toast.success('Update Successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      toast.success('Update Successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success('Delete Successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      toast.success('Update Successfully', {
        position: 'top-center',
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error', {
        position: 'top-center',
        autoClose: 3000,
      });
    },
  });
}

export function useGetAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });
}
