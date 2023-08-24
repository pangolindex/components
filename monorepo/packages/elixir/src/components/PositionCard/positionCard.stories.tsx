import { Box } from '@pangolindex/core';
import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { PositionCardProps } from './types';
import PositionCard from '.';

export default {
  component: PositionCard,
  title: 'DeFi Primitives/Elixir/PositionCard',
  parameters: {
    docs: {
      description: {
        component: 'Position Card',
      },
    },
  },
  argTypes: {
    currency0: {
      name: 'Currency0',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'First Currency',
    },
    currency1: {
      name: 'Currency1',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Second Currency',
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

const TemplatePositionCard: ComponentStory<typeof PositionCard> = (args: any) => (
  <Box>
    <PositionCard {...args} />
  </Box>
);

export const Default = TemplatePositionCard.bind({});

Default.args = {
  currency0,
  currency1,
} as Partial<PositionCardProps>;
