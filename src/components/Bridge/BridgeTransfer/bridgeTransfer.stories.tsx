import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { BridgeState, BridgeTransferProps } from './types';
import BridgeTransfer from '.';

export default {
  component: BridgeTransfer,
  title: 'Components/Bridge/BridgeTransfer',
  parameters: {
    docs: {
      description: {
        component: 'It includes the exist transaction information.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: [BridgeState[BridgeState.PENDING], BridgeState[BridgeState.FAILED], BridgeState[BridgeState.SUCCESS]],
    },
  },
};

const currency0 = new Token(ChainId.AVALANCHE, '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15', 18, 'ETH', 'Ether');
const currency1 = new Token(
  ChainId.AVALANCHE,
  CHAINS[ChainId.AVALANCHE].contracts!.png,
  18,
  CHAINS[ChainId.AVALANCHE].png_symbol!,
  'Pangolin',
);

const TemplateBridgeTransfer: ComponentStory<typeof BridgeTransfer> = (args: any) => {
  return <BridgeTransfer {...args} />;
};

export const Default = TemplateBridgeTransfer.bind({});
Default.args = {
  onDelete: () => {},
  onResume: () => {},
  date: '9/10/2022, 7:53:00 AM',
  from: '1.0000',
  fromChain: currency0,
  fromCoin: currency1,
  to: '22.3615',
  toChain: currency0,
  toCoin: currency1,
  via: 'PANGOLIN > DODO',
  state: BridgeState.PENDING,
} as Partial<BridgeTransferProps>;
