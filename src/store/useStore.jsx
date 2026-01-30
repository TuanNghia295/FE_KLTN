import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getUserInfo } from '../services/authServices.jsx';

const useStore = create(
  persist(
    (set, get) => ({
      // Trạng thái người dùng
      userInfo: null,
      accesstoken: localStorage.getItem('accesstoken'),
      refreshtoken: localStorage.getItem('refreshtoken'),
      hydrated: false,
      loadingCart: false,
      isUploadingAvatar: false,

      // Hàm để cập nhật thông tin người dùng
      getInfo: (data) => set({ userInfo: data }),
      setTokens: (access, refresh) => set({ accesstoken: access, refreshtoken: refresh }),
      setHydrated: (value) => set({ hydrated: value }),
      setLoadingCart: (value) => set({ loadingCart: value }),
      setIsUploadingAvatar: (value) => set({ isUploadingAvatar: value }),

      // Hàm để xóa thông tin người dùng
      clearInfo: () => {
        localStorage.removeItem('accesstoken');
        localStorage.removeItem('refreshtoken');
        set({ userInfo: null, accesstoken: null, refreshtoken: null, cartSource: 'guest' });
      },

      // Hàm để lấy thông tin người dùng từ API
      fetchUserInfo: async () => {
        const state = get();
        if (state.userInfo === null && state.accesstoken) {
          try {
            const response = await getUserInfo();
            console.log('ressssssssssssssssssssss', response);

            set({ userInfo: response });
          } catch (error) {
            console.error('Failed to fetch user info:', error);
            set({ userInfo: null });
          }
        }
      },

      // Trạng thái giỏ hàng
      cartItems: [],
      guestCartItems: [],
      cartSource: 'guest', // 'guest' | 'user'

      // Hàm để get sản phẩm từ database
      setCartItems: (item) => set({ cartItems: item }),

      // Hàm để thêm sản phẩm vào giỏ hàng
      addItemToCart: (item) =>
        set((state) => ({
          cartItems: [...state.cartItems, item],
        })),

      // Update Cart Item Size
      updateItemSize: (id, newSize) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) => (item.id === id ? { ...item, size: newSize } : item)),
        }));
      },

      // Hàm để xóa sản phẩm khỏi giỏ hàng
      removeItemFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        })),

      // Hàm để xóa toàn bộ giỏ hàng
      clearCart: () => set({ cartItems: [] }),

      setCartSource: (source) => set({ cartSource: source }),

      // Guest cart actions
      setGuestCartItems: (items) => set({ guestCartItems: items }),
      addItemToGuestCart: (newItem) =>
        set((state) => {
          const existingIndex = state.guestCartItems.findIndex(
            (item) => item.product_variant_id === newItem.product_variant_id
          );

          if (existingIndex !== -1) {
            // Item exists, update quantity
            const updatedItems = [...state.guestCartItems];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
            };
            return { guestCartItems: updatedItems };
          } else {
            // Item does not exist, add it
            return { guestCartItems: [...state.guestCartItems, newItem] };
          }
        }),
      updateGuestQuantity: (id, quantity) =>
        set((state) => ({
          guestCartItems: state.guestCartItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),
      updateGuestItemSize: (id, variation) =>
        set((state) => ({
          guestCartItems: state.guestCartItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  product_variant_id: variation?.id ?? item.product_variant_id,
                  size: variation?.size ?? item.size,
                  color: variation?.color ?? item.color,
                }
              : item
          ),
        })),
      removeGuestItem: (id) =>
        set((state) => ({
          guestCartItems: state.guestCartItems.filter((item) => item.id !== id),
        })),
      clearGuestCart: () => set({ guestCartItems: [] }),

      //Trạng thái category
      categoryListZustand: [],

      setCategoryListZustand: (item) => set({ categoryListZustand: item }),

      // Hàm để mở/đóng panel giỏ hàng
      openCartPanel: false,
      setOpenCartPanel: (isOpen) => set({ openCartPanel: isOpen }),

      // Hàm để mở/đóng FilterProduct
      openFilterProduct: false,
      setOpenFilterProduct: (isOpen) => set({ openFilterProduct: isOpen }),
    }),
    {
      name: 'guest-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        guestCartItems: state.guestCartItems,
        userInfo: state.userInfo,
        accesstoken: state.accesstoken,
        refreshtoken: state.refreshtoken,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate store:', error);
        }
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

export const selectActiveCartItems = (state) => (state.cartSource === 'user' ? state.cartItems : state.guestCartItems);

export default useStore;
