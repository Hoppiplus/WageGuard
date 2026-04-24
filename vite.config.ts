import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // Map process.env to window.process.env for runtime injection compatibility
    'process.env': 'window.process.env'
  }
});