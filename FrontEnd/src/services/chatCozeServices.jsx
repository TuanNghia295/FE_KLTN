import axiosClient from '../apis/axiosClient.js';

export const chatWithCoze = async (body) => {
    const response = await axiosClient.post('/chat/chatWithCoze', body)
    return response;
};
