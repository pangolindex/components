import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills(), react()],

  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: {},
    'process.env': {},
  },

  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../lib'),
    },
  },
});
