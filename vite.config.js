import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://kantin-mardira-api-production.up.railway.app',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://kantin-mardira-api-production.up.railway.app',
        changeOrigin: true,
      }
    }
  }
})