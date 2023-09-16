import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Bound } from 'src/state/mint/atom';
import { PriceRangeProps } from './types';
import PriceRange from '.';

export default {
  component: PriceRange,
  title: 'DeFi Primitives/Elixir/AddLiquidity/PriceRange/Default',
  parameters: {
    docs: {
      description: {
        component: 'Price Range',
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

const TemplatePriceRange: ComponentStory<typeof PriceRange> = (args: any) => {
  return (
    <div style={{ width: 'max-content' }}>
      <PriceRange {...args} />
    </div>
  );
};

export const Default = TemplatePriceRange.bind({});
Default.args = {
  currency0: currency0,
  currency1: currency1,
  getDecrementLower: () => '',
  getIncrementLower: () => '',
  getDecrementUpper: () => '',
  getIncrementUpper: () => '',
  onLeftRangeInput: (typedValue: string) => {
    console.log(typedValue);
  },
  onRightRangeInput: (typedValue: string) => {
    console.log(typedValue);
  },
  ticksAtLimit: {
    [Bound.LOWER]: false,
    [Bound.UPPER]: false,
  },
} as Partial<PriceRangeProps>;
