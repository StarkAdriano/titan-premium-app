
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Define a base path como absoluta para garantir carregamento correto em subpastas e iframes
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
