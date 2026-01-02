
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve 'cwd' property error in TypeScript environments without Node types
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    // base: './' ensures the app works when hosted at username.github.io/repo-name/
    base: './',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
