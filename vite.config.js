import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/webhook': 'http://localhost:3001',
    }
  },
  build: {
    rollupOptions: {
      output: {
        // هذا الجزء يقوم بفصل مكتبات مثل Recharts و React في ملف منفصل (vendor)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
