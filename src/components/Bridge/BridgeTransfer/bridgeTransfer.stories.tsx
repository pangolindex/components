import { ComponentStory } from '@storybook/react';
import React from 'react';
import { BridgeTransferStatus } from 'src/state/pbridge/types';
import { BridgeTransferProps } from './types';
import BridgeTransfer from '.';

export default {
  component: BridgeTransfer,
  title: 'DeFi Primitives/Bridge/BridgeTransfer',
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
      options: [
        BridgeTransferStatus[BridgeTransferStatus.PENDING],
        BridgeTransferStatus[BridgeTransferStatus.FAILED],
        BridgeTransferStatus[BridgeTransferStatus.SUCCESS],
      ],
      type: { name: BridgeTransferStatus, required: true },
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
    fromCurrency: {
      name: 'From Currency',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'The currency to be transferred',
    },
    toCurrency: {
      name: 'To Currency',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'The currency to be arrived',
    },
    via: {
      name: 'Via',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'The bridge used to transfer the token',
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
  to: '22.3615',
  via: 'Hedera',
  state: BridgeTransferStatus.PENDING,
} as Partial<BridgeTransferProps>;
