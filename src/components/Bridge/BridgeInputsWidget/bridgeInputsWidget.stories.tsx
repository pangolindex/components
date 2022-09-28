import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from 'src/components';
import { BridgeInputsWidgetProps } from './types';
import BridgeInputsWidget from '.';

export default {
  component: BridgeInputsWidget,
  title: 'Components/Bridge/BridgeInputsWidget',
  parameters: {
    docs: {
      description: {
        component: 'It includes the bridge and currency inputs.',
      },
    },
  },
  argTypes: {
    title: {
      name: 'Title',
      control: 'text',
      type: { name: 'string', required: true },
      description: 'Title of the widget',
    },
    inputDisabled: {
      name: 'Input Disabled',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'Disable the input',
    },
    isTokenDrawerOpen: {
      name: 'Token Drawer Status',
      control: 'boolean',
      type: { name: 'boolean', required: false },
      defaultValue: false,
      description: 'Token drawer Status',
    },
    onTokenDrawerOpen: {
      name: 'Token Drawer Open',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when the token button is clicked',
    },
  },
};

const TemplateBridgeInputsWidget: ComponentStory<typeof BridgeInputsWidget> = (args: any) => {
  return (
    <Box width={'400px'}>
      <BridgeInputsWidget {...args} />
    </Box>
  );
};

export const Default = TemplateBridgeInputsWidget.bind({});
Default.args = {
  title: 'to',
  inputDisabled: true,
  isTokenDrawerOpen: false,
  onTokenDrawerOpen: () => {},
} as Partial<BridgeInputsWidgetProps>;
