import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'b1ff-2405-4802-a317-1080-9111-ff14-9c40-5d0b.ngrok-free.app', // Thêm tên miền ngrok của bạn
    ],
    watch:{
      usePolling: true,
    },
    host: true, // Hỗ trợ expose ra LAN nếu cần
    strictPort: true,
    port: 5173,
  },
});
