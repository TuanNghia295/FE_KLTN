import { create } from 'zustand';
import { getUserInfo } from '../services/authServices.jsx';

const useStore = create((set) => ({
  // Trạng thái người dùng
  userInfo: null,
  accesstoken: localStorage.getItem('accesstoken'),

  // Hàm để cập nhật thông tin người dùng
  getInfo: (data) => set({ userInfo: data }),

  // Hàm để xóa thông tin người dùng
  clearInfo: () => {
    localStorage.removeItem('accesstoken');
    set({ userInfo: null });
  },

  // Hàm để lấy thông tin người dùng từ API
  fetchUserInfo: async () => {
    const state = useStore.getState(); // Lấy toàn bộ state
    if (state.userInfo === null && state.accesstoken) {
      try {
        const response = await getUserInfo();
        set({ userInfo: response });
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        set({ userInfo: null });
      }
    }
  },

  // Trạng thái giỏ hàng
  cartItems: [],

  // Hàm để thêm sản phẩm vào giỏ hàng
  addItemToCart: (item) =>
    set((state) => ({
      cartItems: [...state.cartItems, item],
    })),

  // Update Cart Item Size
  updateItemSize: (id, newSize) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item._id === id ? { ...item, size: newSize } : item
      ),
    }));
  },

  // Hàm để xóa sản phẩm khỏi giỏ hàng
  removeItemFromCart: (_id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item._id !== _id),
    })),

  // Hàm để xóa toàn bộ giỏ hàng
  clearCart: () => set({ cartItems: [] }),

  // Hàm để mở/đóng panel giỏ hàng
  openCartPanel: false,
  setOpenCartPanel: (isOpen) => set({ openCartPanel: isOpen }),
}));

export default useStore;
