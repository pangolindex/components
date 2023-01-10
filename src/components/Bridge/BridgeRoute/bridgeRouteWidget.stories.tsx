import { LIFI } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { BridgePrioritizations, Step } from 'src/state/pbridge/types';
import { BridgeRouteProps } from './types';
import BridgeRoute from '.';

export default {
  component: BridgeRoute,
  title: 'DeFi Primitives/Bridge/BridgeRoute',
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
      options: [
        BridgePrioritizations.FASTEST,
        BridgePrioritizations.NORMAL,
        BridgePrioritizations.RECOMMENDED,
        BridgePrioritizations.CHEAPEST,
        BridgePrioritizations.SAFEST,
      ],
      description: 'Transaction type',
    },
    toToken: {
      name: 'To Token',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated token',
    },
    toAmount: {
      name: 'To Amount',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated Amount',
    },
    toAmountUSD: {
      name: 'To Amount USD',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated Amount USD',
    },
    waitingTime: {
      name: 'Waiting Time',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Estimated Transfer time',
    },
    gasCostUSD: {
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

const steps: Step[] = [
  {
    bridge: LIFI,
    type: 'lifi',
    includedSteps: [
      {
        type: 'swap',
        integrator: 'paraswap',
        action: {
          toToken: 'USDT.e',
        },
        estimate: {
          toAmount: '366.4005',
        },
      },
      {
        type: 'cross',
        integrator: 'multichain',
        action: {
          toToken: 'USDT',
        },
        estimate: {
          toAmount: '365.9000',
        },
      },
    ],
    action: {
      toToken: 'USDT',
    },
    estimate: {
      toAmount: '365.9000',
    },
  },
];

const TemplateBridgeRoute: ComponentStory<typeof BridgeRoute> = (args: any) => {
  return <BridgeRoute {...args} />;
};

export const Default = TemplateBridgeRoute.bind({});
Default.args = {
  steps: steps,
  transactionType: BridgePrioritizations.RECOMMENDED,
  selected: true,
  toAmount: '365.9000',
  toAmountUSD: '365.90 USD',
  waitingTime: '00:30 min',
  gasCostUSD: '0.36',
  toToken: 'USDT',
} as Partial<BridgeRouteProps>;
