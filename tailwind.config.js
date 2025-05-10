/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff5252',
        textPrimary: 'rgba(0, 0, 0, 0.8)',
      },
      backgroundColor: {
        primary: '#ff5252',
        grayf5: '#f5f5f5',
        gray1: '#474c51',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
};
