import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AxiosClient from '../apis/axiosClient';

export const useUserStore = create()(
  persist(
    (set, get) => ({
      userInfo: null,
      accessToken: null,
      refreshToken: null,

      setUserInfo: (info) => set({ userInfo: info }),

      setTokens: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
        }),

      checkToken: async () => {
        const token = get().accessToken;
        if (!token) return false;

        try {
          const decoded = jwtDecode(token);
          const now = Date.now() / 1000;

          if (decoded.exp < now) {
            console.log('Access token expired → refresh');
            return await get().refreshAccessToken();
          }

          return true;
        } catch (err) {
          console.log('❌ Decode token failed', err);
          await get().logout();
          return false;
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;

        try {
          const res = await AxiosClient.post('admin/auth/refresh', { refresh_token: refreshToken });

          set({ accessToken: res.data.access_token });
          console.log('Refresh token success');
          return true;
        } catch (err) {
          console.log('Refresh token failed', err);
          await get().logout();
          return false;
        }
      },

      logout: async () => {
        const refreshToken = get().refreshToken;

        try {
          if (refreshToken) {
            await AxiosClient.post('admin/auth/logout', {
              refresh_token: refreshToken,
            });
          }
        } catch (error) {
          console.log('Something wrong', error);
        }

        set({
          accessToken: null,
          refreshToken: null,
          userInfo: null,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
