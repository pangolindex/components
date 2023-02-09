const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpackFinal: async (config) => {
    let updatedConfig = { ...config };

    // below we are removing fork-ts-checker-webpack-plugin to ignore typescript error while building storybook

    // find fork-ts-checker-webpack-plugin
    const tsCheckerIndex = config.plugins.findIndex((item) => {
      return 'tslint' in item && 'typescript' in item;
    });
    const plugins = [...updatedConfig.plugins];
    plugins.splice(tsCheckerIndex, 1);

    // allow absolute import
    updatedConfig.resolve.modules = [...(updatedConfig.resolve.modules || []), path.resolve(__dirname, '../../')];
    updatedConfig.resolve.alias = {
      ...updatedConfig.resolve.alias,
      '@emotion/core': path.join(process.cwd(), 'node_modules/@emotion/react'),
    };
    return {
      ...updatedConfig,
      // we are using NodePolyfillPlugin to support node polyfill in webpack 5
      plugins: [...plugins, new NodePolyfillPlugin()],
    };
  },

  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  features: {
    babelModeV7: true,
  },
  core: {
    builder: 'webpack5',
  },
};
