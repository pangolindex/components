import { ComponentStory } from '@storybook/react';
import React from 'react';
import { OutofRangeWarningProps } from './types';
import OutofRangeWarning from '.';

export default {
  component: OutofRangeWarning,
  title: 'DeFi Primitives/Elixir/AddLiquidity/OutofRangeWarning',
  parameters: {
    docs: {
      description: {
        component: 'Out of Range Warning',
      },
    },
  },
  argTypes: {
    label: {
      name: 'Label',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Label',
    },
    message: {
      name: 'Message',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Message',
    },
  },
};

const TemplatePriceInput: ComponentStory<typeof OutofRangeWarning> = (args: any) => {
  return (
    <div style={{ width: 'max-content' }}>
      <OutofRangeWarning {...args} />
    </div>
  );
};

export const Default = TemplatePriceInput.bind({});
Default.args = {
  label: 'From',
  message: 'Invalid range selected. The min price must be lower than the max price.',
} as Partial<OutofRangeWarningProps>;
