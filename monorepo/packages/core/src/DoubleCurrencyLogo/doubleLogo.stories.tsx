import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { DoubleCurrencyLogo } from '.';

export default {
  component: DoubleCurrencyLogo,
  title: 'DeFi Helpers/DoubleCurrencyLogo',
};

const currency0 = new Token(ChainId.AVALANCHE, '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15', 18, 'ETH', 'Ether');
const currency1 = new Token(
  ChainId.AVALANCHE,
  CHAINS[ChainId.AVALANCHE].contracts!.png,
  18,
  CHAINS[ChainId.AVALANCHE].png_symbol!,
  'Pangolin',
);

const TemplateBox: ComponentStory<typeof DoubleCurrencyLogo> = (args: any) => <DoubleCurrencyLogo {...args} />;

export const DoubleLogo = TemplateBox.bind({});
DoubleLogo.args = {
  size: 24,
  currency0: currency0,
  currency1: currency1,
  margin: false,
};
