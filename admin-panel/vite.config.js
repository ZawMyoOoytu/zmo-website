import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the root directory
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false, // Disabled for production
      minify: 'esbuild',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['axios']
          }
        }
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION)
    },
    // Optimize dependencies for production
    optimizeDeps: {
      include: ['react', 'react-dom', 'axios']
    }
  }
})