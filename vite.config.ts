import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          popup:        path.resolve(__dirname, 'index.html'),
          options:      path.resolve(__dirname, 'options.html'),
          dashboard:    path.resolve(__dirname, 'dashboard.html'),
          background:   path.resolve(__dirname, 'src/background/worker.ts'),
          main:         path.resolve(__dirname, 'src/content/main.ts'),
          'css-injector': path.resolve(__dirname, 'src/content/css-injector.ts'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background') {
              return 'background/worker.js';
            }
            if (chunkInfo.name === 'main' || chunkInfo.name === 'css-injector') {
              return `content/[name].js`;
            }
            return `assets/[name]-[hash].js`;
          },
        },
      },
    },
  };
});
