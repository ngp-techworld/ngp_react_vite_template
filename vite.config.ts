/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The Laravel starter (`php artisan serve`). Proxying keeps the API on the app's origin in dev,
// so Sanctum's session and XSRF cookies behave like production.
const apiTarget = 'http://127.0.0.1:8000';
const apiProxy = { '/api': apiTarget, '/sanctum': apiTarget, '/storage': apiTarget };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: apiProxy },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true, proxy: apiProxy },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
