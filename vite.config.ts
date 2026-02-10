
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  base: './',
  plugins: [react(), vanillaExtractPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5050',
      '/ws': {
        target: 'ws://localhost:5050',
        ws: true
      }
    }
  }
})
