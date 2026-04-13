import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      // Kong gateway routes (GoTrue, PostgREST, Storage, Realtime, Microservices)
      '/auth/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/rest/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/storage/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/realtime/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
      },
      '/newsletter/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/gdpr/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/mongo/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
