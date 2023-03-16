import { ComponentStory } from '@storybook/react';
import React from 'react';
import { RemoveProps } from './types';
import Remove from '.';

export default {
  component: Remove,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/EarnWidget/Remove',
  parameters: {
    docs: {
      description: {
        component: 'Header',
      },
    },
  },
  argTypes: {
    statItems: {
      name: 'Is Open',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'The state of the modal',
    },
    onClose: {
      name: 'On Close',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user close the remove drawer',
    },
  },
};

const TemplateRemove: ComponentStory<typeof Remove> = (args: any) => {
  return (
    <div>
      <Remove {...args} />
    </div>
  );
};

export const Default = TemplateRemove.bind({});
Default.args = {
  isOpen: true,
  onClose: function (): void {},
} as Partial<RemoveProps>;
