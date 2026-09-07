import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/fire-cream/',
  plugins: [react()],
  server: {
    port: 3000
  }
})
