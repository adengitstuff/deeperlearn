import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      '/api/chat': 'http://localhost:3001' // Point to your backend server
    }
  }
})