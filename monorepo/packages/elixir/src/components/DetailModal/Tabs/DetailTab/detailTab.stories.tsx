import { CHAINS, ChainId, FeeAmount, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import { BigNumber } from 'ethers';
import React from 'react';
import { PositionDetails } from 'src/state/wallet/types';
import { DetailTabProps } from './types';
import DetailTab from '.';

export default {
  component: DetailTab,
  title: 'DeFi Primitives/Elixir/DetailModal/Tabs/DetailTab/Default',
  parameters: {
    docs: {
      description: {
        component: 'DetailTab',
      },
    },
  },
  argTypes: {
    position: {
      name: 'Position',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Position',
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
  tokenId: BigNumber.from(3800),
  token0,
  token1,
  fee: FeeAmount.LOWEST,
  tickLower: 0,
  tickUpper: 0,
  liquidity: BigNumber.from(645742),
};

const TemplateDetailTab: ComponentStory<typeof DetailTab> = (args: any) => {
  return (
    <div style={{ maxWidth: '850px' }}>
      <DetailTab {...args} />
    </div>
  );
};

export const Default = TemplateDetailTab.bind({});
Default.args = {
  position: position,
} as Partial<DetailTabProps>;
