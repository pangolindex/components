import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import packageJson from './package.json';

let plugins = [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  json(),
  typescript({
    exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
  }),
];

if (process.env.ENV === 'production') {
  plugins.push(
    cleaner({
      targets: ['./lib'],
    }),
  );
}

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: plugins,
};
