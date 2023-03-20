import { ComponentStory } from '@storybook/react';
import React from 'react';
import { RemoveDrawerProps } from './types';
import RemoveDrawer from '.';

export default {
  component: RemoveDrawer,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/EarnWidget/RemoveDrawer',
  parameters: {
    docs: {
      description: {
        component: 'RemoveDrawer',
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

const TemplateRemoveDrawer: ComponentStory<typeof RemoveDrawer> = (args: any) => {
  return (
    <div>
      <RemoveDrawer {...args} />
    </div>
  );
};

export const Default = TemplateRemoveDrawer.bind({});
Default.args = {
  isOpen: true,
  onClose: function (): void {},
} as Partial<RemoveDrawerProps>;
