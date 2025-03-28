import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  // Ensure public directory is handled consistently
  publicDir: 'public',
  build: {
    // Ensure assets are copied to the correct location
    assetsDir: 'assets'
  }
})
