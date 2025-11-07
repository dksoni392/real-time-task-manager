import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all API requests
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy all Socket.IO requests
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true, // This is crucial for WebSockets
      },
    },
  },
})