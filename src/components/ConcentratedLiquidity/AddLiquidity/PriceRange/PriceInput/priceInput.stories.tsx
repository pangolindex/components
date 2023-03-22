import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { PriceInputProps } from './types';
import PriceInput from '.';

export default {
  component: PriceInput,
  title: 'DeFi Primitives/ConcentratedLiquidity/AddLiquidity/PriceRange/PriceInput',
  parameters: {
    docs: {
      description: {
        component: 'Price Input',
      },
    },
  },
  argTypes: {
    price: {
      name: 'Price',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Price',
    },
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
    setPrice: {
      name: 'Set Price',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user change the price',
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

const TemplatePriceInput: ComponentStory<typeof PriceInput> = (args: any) => {
  return (
    <div style={{ width: 'max-content' }}>
      <PriceInput {...args} />
    </div>
  );
};

export const Default = TemplatePriceInput.bind({});
Default.args = {
  title: 'Min Price',
  price: '102.6',
  setPrice: (price: string) => {
    console.log(price);
  },
  currency0,
  currency1,
} as Partial<PriceInputProps>;
