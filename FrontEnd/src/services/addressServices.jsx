import axios from "axios";
import { useQuery } from '@tanstack/react-query';

// API lấy danh sách thành phố
const getThanhPho = async () => {
    const response = await axios.get('https://provinces.open-api.vn/api/?depth=2');
    return response.data; // Trả về danh sách thành phố
};

// API lấy danh sách quận huyện theo id của thành phố
const getQuanHuyen = async (provinceId) => {
    if (!provinceId) return []; // Nếu không có id tỉnh thành, trả về danh sách quận huyện rỗng
    const response = await axios.get(`https://provinces.open-api.vn/api/d/${provinceId}?depth=2`);
    const districtArray = Object.values(response);
    return districtArray; // Trả về danh sách quận huyện cho tỉnh thành tương ứng
};

// Hook: Lấy danh sách thành phố
export const useAPIThanhPho = () => {
    const { data: listThanhPho, error: errorThanhPho, isLoading: loadingThanhPho } = useQuery({
        queryKey: ['listThanhPho'],
        queryFn: getThanhPho,
    });

    return {
        listThanhPho,
        errorThanhPho,
        loadingThanhPho
    };
};

// Hook: Lấy danh sách quận huyện theo thành phố (provinceId)
export const useAPIQuanHuyen = (provinceId) => {
    const { data: listQuanHuyen, error: errorQuanHuyen, isLoading: loadingQuanHuyen } = useQuery({
        queryKey: ['listQuanHuyen', provinceId],
        queryFn: () => getQuanHuyen(provinceId),
        enabled: !!provinceId, // Chỉ thực hiện gọi API khi có provinceId
    });

    return {
        listQuanHuyen,
        errorQuanHuyen,
        loadingQuanHuyen
    };
};
