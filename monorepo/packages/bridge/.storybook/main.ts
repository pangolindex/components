import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    let updatedConfig = { ...config };

    if (updatedConfig.resolve) {
      // allow absolute import
      updatedConfig.resolve.modules = [...(updatedConfig.resolve.modules || []), path.resolve(__dirname, '../')];

      // make sure webpack find turborepo packages from root node_modules
      updatedConfig.resolve.alias = {
        ...updatedConfig.resolve.alias,
        '@honeycomb/shared': path.join(process.cwd(), '../../node_modules/@honeycomb/shared'),
      };
    }

    return updatedConfig;
  },
};
export default config;
