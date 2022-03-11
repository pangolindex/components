import { CAVAX, ChainId } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import CurrencyLogo from '.';

export default {
  component: CurrencyLogo,
  title: 'Pangolin/CurrencyLogo',
};

const TemplateBox: ComponentStory<typeof CurrencyLogo> = (args: any) => <CurrencyLogo {...args} />;

export const DoubleLogo = TemplateBox.bind({});
DoubleLogo.args = {
  size: 24,
  currency: CAVAX[ChainId.AVALANCHE],
};
