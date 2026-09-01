import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const useGithubPagesBase =
  process.env.GITHUB_PAGES === 'true' && !process.env.VERCEL;

export default defineConfig({
  base: useGithubPagesBase ? '/meishiditu/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
