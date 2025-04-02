import axiosClient from "./axiosClient";
import Cookies from 'js-cookie'
import { useStoreProvider } from '../contexts/StoreProvider'

export const login = async ({ phone, password }) => {
  const response = await axiosClient.post(`/auth/login`, { phone, password }, {
    withCredentials: true, // Để gửi cookie
  });
  console.log(response)

  localStorage.setItem("accesstoken", response.accessToken);
  return response;
};

export const getUserInfo = async (accesstoken) => {
  const response = await axiosClient.get('/users/userInfo', {
    headers: {
      Authorization: `Bearer ${accesstoken}`, // Gửi token trong header
    },
  })

  return response
} 

export const logout = async () => {
  const response = await axiosClient.post('/auth/logout')
  localStorage.removeItem("accesstoken", response.accessToken);

  return response
}
