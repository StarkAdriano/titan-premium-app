
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // CORREÇÃO: Define a base path como relativa para suportar deploys em qualquer subpasta
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
