import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export default defineConfig({
  base : "/test_jwellery/", // 👈 Changed from "/test_jwellery" to "/test_jwellery/"
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    exclude: ['e2e'],
  },
})
