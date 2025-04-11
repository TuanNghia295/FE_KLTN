import axios from "axios";
import { useQuery } from '@tanstack/react-query';

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
    return response.data.wards // Trả về danh sách đường theo tỉnh, quận
}

// Hook: Lấy danh sách thành phố
export const useProvinces = () => {
    const { data: listProvinces, error: errorProvinces, isLoading: loadingProvinces } = useQuery({
        queryKey: ['listProvinces'],
        queryFn: getProvinces,
    });

    const getProvinceByCode = (codeProvinces) =>
        listProvinces?.find(p => p.code === Number(codeProvinces));

    const getDistrictsByProvince = (provinceCode) =>
        getProvinceByCode(provinceCode)?.districts || [];

    const getDistrictByCode = (provinceCode, districtCode) =>
        getDistrictsByProvince(provinceCode).find(d => d.code === Number(districtCode));

    return {
        listProvinces,
        getProvinceByCode,
        getDistrictsByProvince,
        getDistrictByCode,
        errorProvinces,
        loadingProvinces
    };
};

// Hook: Lấy danh sách phường xã
export const useWards = (districtCode) => {
    const {data : listWards } = useQuery({
        queryKey: ['listWards', districtCode],
        queryFn: getWards,
        enabled: !!districtCode, // Chỉ gọi khi có quận
    })

    return {
        listWards
    }
}
