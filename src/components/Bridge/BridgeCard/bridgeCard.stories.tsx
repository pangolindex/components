import { ComponentStory } from '@storybook/react';
import React from 'react';
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
};

const TemplateBridgeCard: ComponentStory<typeof BridgeCard> = (args: any) => {
  return <BridgeCard {...args} />;
};

export const Default = TemplateBridgeCard.bind({});
Default.args = {};
