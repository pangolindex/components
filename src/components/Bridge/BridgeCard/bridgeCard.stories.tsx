import { ComponentStory } from '@storybook/react';
import React from 'react';
import { BridgeCardProps } from './types';
import BridgeCard from '.';

export default {
  component: BridgeCard,
  title: 'Components/Bridge/BridgeCard',
  parameters: {
    docs: {
      description: {
        component: 'It includes the BridgeInputsWidgets, and settings of the transactions and routes.',
      },
    },
  },
  argTypes: {
    slippageTolerance: {
      name: 'Slippage Tolerance',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Slippage Tolerance',
    },
    account: {
      name: 'Account',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Account Address',
    },
    fromChain: {
      name: 'From Chain',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'From Chain',
    },
    toChain: {
      name: 'To Chain',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'To Chain',
    },
    inputCurrency: {
      name: 'Input Currency',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Input Currency',
    },
    outputCurrency: {
      name: 'Output Currency',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Output Currency',
    },
    recipient: {
      name: 'Recipient',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Recipient Address',
    },
    setSlippageTolerance: {
      name: 'Set Slippage Tolerance',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'Set Slippage Tolerance',
    },
    getRoutes: {
      name: 'Get Routes',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'Get Routes',
    },
  },
};

const TemplateBridgeCard: ComponentStory<typeof BridgeCard> = (args: any) => {
  return <BridgeCard {...args} />;
};

export const Default = TemplateBridgeCard.bind({});
Default.args = {
  slippageTolerance: '0.1',
  account: null,
  fromChain: undefined,
  inputCurrency: undefined,
  outputCurrency: undefined,
  recipient: undefined,
  toChain: undefined,
  setSlippageTolerance: () => {},
  getRoutes: () => {},
} as Partial<BridgeCardProps>;
