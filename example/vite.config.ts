import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // this is specifically loading arkhia api key as we are directly using component source code instead of building it
  // for vite env we need to prefix env with VITE_
  // then add ARKHIA_API_KEY to process.env
  // const arkhiaApiKey = loadEnv(mode, process.cwd()).VITE_ARKHIA_API_KEY;
  // process.env = { ...process.env, ARKHIA_API_KEY: arkhiaApiKey };

  return defineConfig({
    plugins: [nodePolyfills(), react()],

    define: {
      // By default, Vite doesn't include shims for NodeJS/
      // necessary for segment analytics lib to work
      global: {},
      'process.env': process.env,
    },

    resolve: {
      alias: {
        '@components': path.resolve(__dirname, '../src'),
        // here we are mapping "src" because in components we have absolute path that starts with "src"
        src: path.resolve(__dirname, '../src'),
      },
    },
  });
};
