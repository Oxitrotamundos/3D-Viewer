import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/3D-Viewer/' : '/',
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    target: 'esnext',
    minify: 'terser',
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true
  },
  
  publicDir: 'public'
});
