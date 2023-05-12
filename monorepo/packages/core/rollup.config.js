import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import cleaner from 'rollup-plugin-cleaner';
import resolve from '@rollup/plugin-node-resolve';
import includePaths from 'rollup-plugin-includepaths';
import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import path from 'path';
import externals from 'rollup-plugin-node-externals';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

let plugins = [
  externals({
    // we dont want to put below packages in rollup->externals
    // meaning, we want to include them in the final build
    exclude: ['@pangolindex/theme', '@pangolindex/locales'],
  }),
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
};
