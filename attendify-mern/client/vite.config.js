import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
