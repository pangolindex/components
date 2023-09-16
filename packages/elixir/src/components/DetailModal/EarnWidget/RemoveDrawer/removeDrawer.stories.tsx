import { CHAINS, ChainId, FeeAmount, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import { BigNumber } from 'ethers';
import React from 'react';
import { PositionDetails } from 'src/state/wallet/types';
import { RemoveDrawerProps } from './types';
import RemoveDrawer from '.';

export default {
  component: RemoveDrawer,
  title: 'DeFi Primitives/Elixir/DetailModal/EarnWidget/RemoveDrawer',
  parameters: {
    docs: {
      description: {
        component: 'RemoveDrawer',
      },
    },
  },
  argTypes: {
    statItems: {
      name: 'Is Open',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'The state of the modal',
    },
    position: {
      name: 'Position',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Position',
    },
    onClose: {
      name: 'On Close',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user close the remove drawer',
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

const position: PositionDetails = {
  tokenId: BigNumber.from(100),
  token0,
  token1,
  fee: FeeAmount.LOWEST,
  tickLower: 0,
  tickUpper: 0,
  liquidity: BigNumber.from(100),
};

const TemplateRemoveDrawer: ComponentStory<typeof RemoveDrawer> = (args: any) => {
  return (
    <div>
      <RemoveDrawer {...args} />
    </div>
  );
};

export const Default = TemplateRemoveDrawer.bind({});
Default.args = {
  isOpen: true,
  position,
  onClose: function (): void {},
} as Partial<RemoveDrawerProps>;
