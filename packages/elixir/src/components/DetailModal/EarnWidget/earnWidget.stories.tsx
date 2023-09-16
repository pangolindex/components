import { CHAINS, ChainId, FeeAmount, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import { BigNumber } from 'ethers';
import React from 'react';
import { PositionDetails } from 'src/state/wallet/types';
import { EarnWidgetProps } from './types';
import EarnWidget from '.';

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

export default {
  component: EarnWidget,
  title: 'DeFi Primitives/Elixir/DetailModal/EarnWidget/Default',
  argTypes: {
    position: {
      name: 'Position',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Position',
    },
  },
};

const TemplateEarnWidget: ComponentStory<typeof EarnWidget> = (args: any) => {
  return (
    <div style={{ maxWidth: 450 }}>
      <EarnWidget {...args} />
    </div>
  );
};

export const Default = TemplateEarnWidget.bind({});
Default.args = {
  position: position,
} as Partial<EarnWidgetProps>;
