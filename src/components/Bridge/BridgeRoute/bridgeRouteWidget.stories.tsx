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
