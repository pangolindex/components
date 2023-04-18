import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { FeeSelectorProps } from './types';
import FeeSelector from '.';

export default {
  component: FeeSelector,
  title: 'DeFi Primitives/ConcentratedLiquidity/AddLiquidity/FeeSelector',
  parameters: {
    docs: {
      description: {
        component: 'Fee Tier',
      },
    },
  },
  argTypes: {
    disabled: {
      name: 'Disable',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'The state of the Box disable',
    },
    // feeAmount: {
    //   name: 'Fee Amount',
    //   control: 'text',
    //   type: { name: 'string', required: true },
    //   description: 'Fee Tier Amount',
    // },
    handleFeePoolSelect: {
      name: 'On Select Fee Tier',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user select the fee tier',
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

const TemplateFeeTier: ComponentStory<typeof FeeSelector> = (args: any) => {
  return (
    <div style={{ width: 'max-content' }}>
      <FeeSelector {...args} />
    </div>
  );
};

export const Default = TemplateFeeTier.bind({});
Default.args = {
  feeAmount: 3000,
  handleFeePoolSelect: () => {},
  currency0,
  currency1,
} as Partial<FeeSelectorProps>;
