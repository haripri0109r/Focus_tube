import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, 'index.html'),
          options: path.resolve(__dirname, 'options.html'),
          background: path.resolve(__dirname, 'src/background/worker.ts'),
          main: path.resolve(__dirname, 'src/content/main.ts'),
          'css-injector': path.resolve(__dirname, 'src/content/css-injector.ts')
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
          }
        }
      }
    }
  };
});
