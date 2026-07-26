import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/couplegames/',
  build: {
    outDir: '../docs/couplegames',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    exclude: ['**/node_modules/**', 'e2e/**', 'playwright-report/**', 'test-results/**'],
  },
})
