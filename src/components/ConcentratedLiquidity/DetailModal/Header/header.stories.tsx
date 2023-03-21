import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { HeaderProps } from './types';
import Header from '.';

export default {
  component: Header,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/Header',
  parameters: {
    docs: {
      description: {
        component: 'Header',
      },
    },
  },
  argTypes: {
    currency0: {
      name: 'Currency 0',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Currency',
    },
    currency1: {
      name: 'Currency 1',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Currency',
    },
    statItems: {
      name: 'Stat Items',
      control: 'array',
      type: { name: 'array', required: true },
      description: 'Stat Items',
    },
    onClose: {
      name: 'On Close',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user close the modal',
    },
  },
};

const currency0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
const currency1 = new Token(
  ChainId.AVALANCHE,
  CHAINS[ChainId.AVALANCHE].contracts!.png,
  18,
  CHAINS[ChainId.AVALANCHE].png_symbol!,
  'Pangolin',
);

const TemplateHeader: ComponentStory<typeof Header> = (args: any) => {
  return (
    <div style={{ maxWidth: 1050 }}>
      <Header {...args} />
    </div>
  );
};

export const Default = TemplateHeader.bind({});
Default.args = {
  currency0,
  currency1,
  statItems: [
    {
      title: 'Fee Rate',
      stat: '0.3%',
    },
    {
      title: 'Min Price',
      stat: `1,023.42 ${currency0?.symbol}/${currency1?.symbol}`,
    },
    {
      title: 'Max Price',
      stat: `1,023.42 ${currency0?.symbol}/${currency1?.symbol}`,
    },
    {
      title: 'Swap Fee APR',
      stat: '24%',
    },
  ],
  onClose: () => {},
} as Partial<HeaderProps>;
