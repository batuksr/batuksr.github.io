import { defineConfig } from 'vite';

export default defineConfig({
  // Göreli base: GitHub Pages / Netlify / Vercel alt dizinlerinde de çalışır
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
});
