import { CHAINS, ChainId } from '@pangolindex/sdk';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { ChainInputProps } from './types';
import { ChainInput } from '.';

export default {
  component: ChainInput,
  title: 'DeFi Helpers/ChainInput',
  parameters: {
    docs: {
      description: {
        component: 'This is the main component of the bridge page.',
      },
    },
  },
  argTypes: {
    chain: {
      name: 'Chain',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Chain',
    },
    buttonStyle: {
      name: 'Chain',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Button Styles',
    },
    onChainClick: {
      name: 'onChainClick',
      control: 'function',
      type: { name: 'function', required: false },
      description: 'It triggers when the chain is clicked',
    },
  },
};

const TemplateChainInput: ComponentStory<typeof ChainInput> = (args: any) => <ChainInput {...args} />;

export const Default = TemplateChainInput.bind({});
Default.args = {
  chain: CHAINS[ChainId.AVALANCHE],
  buttonStyle: {
    padding: '1rem 1.1rem',
  },
  onChainClick: () => {},
} as Partial<ChainInputProps>;
