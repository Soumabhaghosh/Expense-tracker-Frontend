import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host:true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://expense-tracker-backend-v0gy.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
