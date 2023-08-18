// vite.config.ts
import { defineConfig } from "file:///D:/pangolin/components/monorepo/node_modules/vite/dist/node/index.js";
import react from "file:///D:/pangolin/components/monorepo/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { NodeGlobalsPolyfillPlugin } from "file:///D:/pangolin/components/monorepo/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
var __vite_injected_original_dirname = "D:\\pangolin\\components\\monorepo\\apps\\example";
var vite_config_default = () => {
  return defineConfig({
    plugins: [react()],
    define: {
      "process.env": {}
    },
    resolve: {
      alias: {
        // here we are mapping "src" because in components we have absolute path that starts with "src"
        src: path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      commonjsOptions: { transformMixedEsModules: true, include: [] }
    },
    optimizeDeps: {
      // this is needed because of js-sha256 & near-api-js library
      // @see https://github.com/near/near-api-js/issues/1035
      disabled: false,
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis"
        },
        // Enable esbuild polyfill plugins
        plugins: [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true
          })
        ]
      }
    }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxwYW5nb2xpblxcXFxjb21wb25lbnRzXFxcXG1vbm9yZXBvXFxcXGFwcHNcXFxcZXhhbXBsZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxccGFuZ29saW5cXFxcY29tcG9uZW50c1xcXFxtb25vcmVwb1xcXFxhcHBzXFxcXGV4YW1wbGVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3BhbmdvbGluL2NvbXBvbmVudHMvbW9ub3JlcG8vYXBwcy9leGFtcGxlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSAnQGVzYnVpbGQtcGx1Z2lucy9ub2RlLWdsb2JhbHMtcG9seWZpbGwnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIHJldHVybiBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBkZWZpbmU6IHtcbiAgICAgICdwcm9jZXNzLmVudic6IHt9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAvLyBoZXJlIHdlIGFyZSBtYXBwaW5nIFwic3JjXCIgYmVjYXVzZSBpbiBjb21wb25lbnRzIHdlIGhhdmUgYWJzb2x1dGUgcGF0aCB0aGF0IHN0YXJ0cyB3aXRoIFwic3JjXCJcbiAgICAgICAgc3JjOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxuICAgICAgfVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIGNvbW1vbmpzT3B0aW9uczogeyB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSwgaW5jbHVkZTogW10gfVxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICAvLyB0aGlzIGlzIG5lZWRlZCBiZWNhdXNlIG9mIGpzLXNoYTI1NiAmIG5lYXItYXBpLWpzIGxpYnJhcnlcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25lYXIvbmVhci1hcGktanMvaXNzdWVzLzEwMzVcbiAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIC8vIE5vZGUuanMgZ2xvYmFsIHRvIGJyb3dzZXIgZ2xvYmFsVGhpc1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJ1xuICAgICAgICB9LFxuICAgICAgICAvLyBFbmFibGUgZXNidWlsZCBwb2x5ZmlsbCBwbHVnaW5zXG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4oe1xuICAgICAgICAgICAgYnVmZmVyOiB0cnVlLFxuICAgICAgICAgICAgcHJvY2VzczogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtVLFNBQVMsb0JBQW9CO0FBQy9WLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxpQ0FBaUM7QUFIMUMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxNQUFNO0FBQ25CLFNBQU8sYUFBYTtBQUFBLElBQ2xCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixRQUFRO0FBQUEsTUFDTixlQUFlLENBQUM7QUFBQSxJQUNsQjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBO0FBQUEsUUFFTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxpQkFBaUIsRUFBRSx5QkFBeUIsTUFBTSxTQUFTLENBQUMsRUFBRTtBQUFBLElBQ2hFO0FBQUEsSUFDQSxjQUFjO0FBQUE7QUFBQTtBQUFBLE1BR1osVUFBVTtBQUFBLE1BQ1YsZ0JBQWdCO0FBQUE7QUFBQSxRQUVkLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxRQUNWO0FBQUE7QUFBQSxRQUVBLFNBQVM7QUFBQTtBQUFBO0FBQUEsVUFHUCwwQkFBMEI7QUFBQSxZQUN4QixRQUFRO0FBQUEsWUFDUixTQUFTO0FBQUEsVUFDWCxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbXQp9Cg==
