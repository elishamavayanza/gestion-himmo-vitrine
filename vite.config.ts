import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./assets/react', import.meta.url)) },
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.HIMMO_API_URL ?? 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // Les DTO publics renvoient les chemins d’images servis par Symfony.
      '/uploads': {
        target: process.env.HIMMO_API_URL ?? 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
