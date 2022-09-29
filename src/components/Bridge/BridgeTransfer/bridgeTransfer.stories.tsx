import { CHAINS, ChainId, Token } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { BridgeState, BridgeTransferProps } from './types';
import BridgeTransfer from '.';

const currency0 = new Token(ChainId.AVALANCHE, '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15', 18, 'ETH', 'Ether');
const currency1 = new Token(
  ChainId.AVALANCHE,
  CHAINS[ChainId.AVALANCHE].contracts!.png,
  18,
  CHAINS[ChainId.AVALANCHE].png_symbol!,
  'Pangolin',
);

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
      name: 'State',
      control: 'select',
      options: [BridgeState[BridgeState.PENDING], BridgeState[BridgeState.FAILED], BridgeState[BridgeState.SUCCESS]],
      type: { name: BridgeState, required: true },
      description: 'State of the transaction',
    },
    from: {
      name: 'From',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'The amount of the token to be transferred',
    },
    to: {
      name: 'To',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'The amount of the token to be arrived',
    },
    date: {
      name: 'Date',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'The date of the transaction',
    },
    fromChain: {
      name: 'From Chain',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'The chain of the token to be transferred',
    },
    toChain: {
      name: 'To Chain',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'The chain of the token to be arrived',
    },
    fromCoin: {
      name: 'From Coin',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'The coin to be transferred',
    },
    toCoin: {
      name: 'To Coin',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'The coin to be arrived',
    },
    via: {
      name: 'Via',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'The platforms used to transfer the token',
    },
    onDelete: {
      name: 'OnDelete',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when the delete button is clicked',
    },
    onResume: {
      name: 'OnResume',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when the resume button is clicked',
    },
  },
};

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
