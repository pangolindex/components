import { ComponentStory } from '@storybook/react';
import React from 'react';
import { DoubleLogo } from '.';

export default {
  component: DoubleLogo,
  title: 'Components/DoubleLogo',
};

const TemplateBox: ComponentStory<typeof DoubleLogo> = (args: any) => <DoubleLogo {...args} />;

export const DoubleLogoComponent = TemplateBox.bind({});
DoubleLogoComponent.args = {
  size: 24,
  logo0:
    'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7/logo_24.png',
  logo1:
    'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7/logo_24.png',
  margin: false,
};
