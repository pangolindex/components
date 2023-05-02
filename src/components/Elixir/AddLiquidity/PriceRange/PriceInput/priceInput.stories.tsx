import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { wrappedCurrency } from 'src/utils/wrappedCurrency';
import { PriceInputProps } from './types';
import PriceInput from '.';

export default {
  component: PriceInput,
  title: 'DeFi Primitives/Elixir/AddLiquidity/PriceRange/PriceInput',
  parameters: {
    docs: {
      description: {
        component: 'Price Input',
      },
    },
  },
  argTypes: {
    value: {
      name: 'Value',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Value',
    },
    tokenA: {
      name: 'Currency 0',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Currency',
    },
    tokenB: {
      name: 'Currency 1',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Currency',
    },
    onUserInput: {
      name: 'User Input',
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

const tokenA = currency0 ? wrappedCurrency(currency0, 43113) : undefined;
const tokenB = currency1 ? wrappedCurrency(currency1, 43113) : undefined;

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
  value: '102.6',
  onUserInput: (price: string) => {
    console.log(price);
  },
  tokenA: tokenA?.symbol,
  tokenB: tokenB?.symbol,
  decrement: () => {},
  increment: () => {},
  decrementDisabled: false,
  incrementDisabled: false,
  feeAmount: 3000,
  label: tokenA?.symbol,
  locked: false, // disable input
} as Partial<PriceInputProps>;
