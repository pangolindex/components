const path = require('path');

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

    return {
      ...updatedConfig,
      plugins,
    };
  },

  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/preset-create-react-app'],
};
