import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { HeaderProps } from './types';
import Header from '.';

export default {
  component: Header,
  title: 'DeFi Primitives/Elixir/DetailModal/Header',
  parameters: {
    docs: {
      description: {
        component: 'Header',
      },
    },
  },
  argTypes: {
    token0: {
      name: 'Token 0',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Token',
    },
    token1: {
      name: 'Token 1',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Token',
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

const token0 = new Token(ChainId.AVALANCHE, '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', 6, 'USDC', 'USD Coin');
const token1 = new Token(
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
  token0,
  token1,
  statItems: [
    {
      title: 'Fee Rate',
      stat: '0.3%',
    },
    {
      title: 'Swap Fee APR',
      stat: '24%',
    },
  ],
  onClose: () => {},
} as Partial<HeaderProps>;
