import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log('🔧 Vite mode:', mode);
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build', // Updated to match vercel.json
      sourcemap: mode === 'development',
      minify: mode === 'production',
    },
    // Environment variables
    define: {
      'process.env': process.env,
    },
  };
});