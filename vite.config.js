import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host:true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://34.205.168.211:5000/',
        changeOrigin: true,
      },
    },
  },
});
