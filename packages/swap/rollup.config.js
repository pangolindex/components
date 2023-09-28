import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import path from 'path';
import externals from 'rollup-plugin-node-externals';
import { terser } from 'rollup-plugin-terser';
import tscAlias from 'rollup-plugin-tsc-alias';
import pkg from './package.json';

let plugins = [
  tscAlias(),
  externals(),
  peerDepsExternal(),
  resolve(),
  url({
    include: ['**/*.svg', '**/*.png', '**/*.jp(e)?g', '**/*.gif', '**/*.webp'],
    emitFiles: true,
    fileName: '[dirname][hash][extname]',
    sourceDir: path.join(__dirname, 'src'),
  }),
  commonjs(),
  json(),
  typescript({
    check: false,
    exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
  }),
];

if (process.env.ENV === 'production') {
  plugins.push(
    cleaner({
      targets: ['./lib'],
    }),
    terser(),
  );
}

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: plugins,
  onwarn: function (message, defaultHandler) {
    if (message.code === 'THIS_IS_UNDEFINED') return;
    defaultHandler(message);
  },
};
