import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import includePaths from 'rollup-plugin-includepaths';
// import packageJson from './package.json';
import url from '@rollup/plugin-url';
import css from 'rollup-plugin-import-css';
import path from 'path';
import externals from 'rollup-plugin-node-externals';
import { terser } from 'rollup-plugin-terser';
import dotenv from 'rollup-plugin-dotenv';

let plugins = [
  dotenv(),
  externals(),
  peerDepsExternal(),
  includePaths({
    paths: ['./'],
    extensions: ['.tsx', '.ts', '.js'],
  }),
  resolve(),
  url({
    include: ['**/*.svg', '**/*.png', '**/*.jp(e)?g', '**/*.gif', '**/*.webp'],
    emitFiles: true,
    fileName: '[dirname][hash][extname]',
    sourceDir: path.join(__dirname, 'src'),
  }),
  css(),
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
  // we are ignoring gifwrap here because we have added @gelatonetwork/limit-orders-react to dependancies. and it is throwing error "gifcodec is not constructor"
  external: ['gifwrap'],
  input: 'src/index.tsx',
  output: [
    {
      dir: 'lib/cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      dir: 'lib/esm',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: plugins,
};
