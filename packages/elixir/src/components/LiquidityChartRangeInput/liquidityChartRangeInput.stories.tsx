import { Box } from '@honeycomb-finance/core';
import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { FeeAmount, LiquidityChartRangeInputProps } from './types';
import LiquidityChartRangeInput from '.';

export default {
  component: LiquidityChartRangeInput,
  title: 'Building Blocks/LiquidityChartRangeInput',
  parameters: {
    docs: {
      description: {
        component:
          'LiquidityChartRangeInput. Uses [uniswap-liquidityChartRangeInput](https://github.com/Uniswap/interface/tree/main/src/components/LiquidityChartRangeInput) under the hood.',
      },
    },
  },
  argTypes: {
    currency0: {
      name: 'Currency0',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Currency',
    },
    currency1: {
      name: 'Currency1',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Currency',
    },
    feeAmount: {
      name: 'Fee Amount',
      control: 'select',
      options: Object.keys(FeeAmount),
      type: { name: 'array', required: false },
      description: 'Fee Amount',
    },
    ticksAtLimit: {
      name: 'Ticks At Limit',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Ticks At Limit',
    },
    price: {
      name: 'Price',
      control: 'number',
      type: { name: 'number', required: true },
      description: 'Price',
    },
    priceLower: {
      name: 'Price Lower',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Price Lower',
    },
    priceUpper: {
      name: 'Price Upper',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Price Upper',
    },
    onLeftRangeInput: {
      name: 'On Left Range Input',
      control: 'function',
      type: { name: 'function', required: true },
      description: 'The function to be called when user change the left `Handle`',
    },
    onRightRangeInput: {
      name: 'On Right Range Input',
      control: 'function',
      type: { name: 'function', required: true },
      description: 'The function to be called when user change the right `Handle`',
    },
    interactive: {
      name: 'Interactive',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'Interactive',
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

const TemplateLiquidityChartRangeInput: ComponentStory<typeof LiquidityChartRangeInput> = (args) => {
  return (
    <Box width="100%">
      <Box maxWidth="350px" mt={'50px'}>
        <LiquidityChartRangeInput {...args} />
      </Box>
    </Box>
  );
};

export const Default = TemplateLiquidityChartRangeInput.bind({});
Default.args = {
  currency0: currency0,
  currency1: currency1,
  feeAmount: FeeAmount.HIGH,
  ticksAtLimit: {
    LOWER: false,
    UPPER: false,
  },
  priceLower: undefined,
  priceUpper: undefined,
  price: 12.34,
  onLeftRangeInput: function (typedValue): void {
    console.log(typedValue);
  },
  onRightRangeInput: function (typedValue): void {
    console.log(typedValue);
  },
  interactive: true,
} as Partial<LiquidityChartRangeInputProps>;
