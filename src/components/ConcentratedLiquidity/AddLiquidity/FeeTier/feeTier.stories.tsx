import { ComponentStory } from '@storybook/react';
import React from 'react';
import { FeeTierProps } from './types';
import FeeTier from '.';

export default {
  component: FeeTier,
  title: 'DeFi Primitives/ConcentratedLiquidity/AddLiquidity/FeeTier',
  parameters: {
    docs: {
      description: {
        component: 'Fee Tier',
      },
    },
  },
  argTypes: {
    feeTierName: {
      name: 'Fee Tier Name',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Fee Tier Name',
    },
    description: {
      name: 'Description',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Description',
    },
    selectedPercentage: {
      name: 'Selected Percentage',
      control: 'number',
      type: { name: 'string', required: true },
      description: 'Selected Percentage',
    },
    selected: {
      name: 'Selected',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'Mark the fee tier as selected',
    },
    onSelectFeeTier: {
      name: 'On Select Fee Tier',
      control: 'function',
      type: { name: 'function', required: true },
      defaultValue: () => {},
      description: 'The function to be called when user select the fee tier',
    },
  },
};

const TemplateFeeTier: ComponentStory<typeof FeeTier> = (args: any) => {
  return (
    <div style={{ width: 'max-content' }}>
      <FeeTier {...args} />
    </div>
  );
};

export const Default = TemplateFeeTier.bind({});
Default.args = {
  feeTierName: '0.3%',
  description: '0.3% fee on all trades',
  selectedPercentage: 0.3,
  selected: false,
  onSelectFeeTier: () => {},
} as Partial<FeeTierProps>;
