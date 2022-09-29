import { ComponentStory } from '@storybook/react';
import React from 'react';
import { BridgePrioritizations } from '..';
import { BridgeRouteProps } from './types';
import BridgeRoute from '.';

export default {
  component: BridgeRoute,
  title: 'Components/Bridge/BridgeRoute',
  parameters: {
    docs: {
      description: {
        component: 'It show the route details.',
      },
    },
  },
  argTypes: {
    transactionType: {
      name: 'Transaction Type',
      type: { name: BridgePrioritizations, required: true },
      control: {
        type: 'select',
        labels: {
          0: 'Recommended',
          1: 'Fast',
          2: 'Normal',
        },
      },
      options: [BridgePrioritizations.fast, BridgePrioritizations.normal, BridgePrioritizations.recommended],
      description: 'Transaction type',
    },
    estimatedToken: {
      name: 'Estimated Token',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated token',
    },
    estimatedResult: {
      name: 'Estimated Result',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated result',
    },
    min: {
      name: 'Min',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated Transfer time',
    },
    gasCost: {
      name: 'Gas Cost',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated Gas Cost',
    },
    selected: {
      name: 'Selected',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: false,
      description: 'Selected',
    },
    steps: {
      name: 'Steps',
      control: 'array',
      type: { name: 'array', required: true },
      description: 'Transaction Steps',
    },
  },
};

const steps: any[] = [
  {
    contractType: 'LI.FI Contract',
    subSteps: ['1. Swap to 0.0538 USDT via PANGOLIN', '2. Transfer to 0.0522 USDT via PANGOLIN'],
  },
  {
    contractType: 'LI.FI Contract',
    subSteps: ['1. Swap to 0.0538 USDT via DODO'],
  },
];

const TemplateBridgeRoute: ComponentStory<typeof BridgeRoute> = (args: any) => {
  return <BridgeRoute {...args} />;
};

export const Default = TemplateBridgeRoute.bind({});
Default.args = {
  steps: steps,
  transactionType: BridgePrioritizations.recommended,
  estimatedToken: '0.0522 FRAX',
  estimatedResult: '$0.05 USD',
  min: '9:00',
  gasCost: '95.30 USD',
  selected: true,
} as Partial<BridgeRouteProps>;
