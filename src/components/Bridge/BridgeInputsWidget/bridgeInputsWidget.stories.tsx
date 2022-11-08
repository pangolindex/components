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
      type: { name: 'string', required: false },
      description: 'Title of the widget',
    },
    inputDisabled: {
      name: 'Input Disabled',
      control: 'boolean',
      type: { name: 'boolean', required: true },
      description: 'Disable the input',
    },
    chain: {
      name: 'Chain',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Chain',
    },
    currency: {
      name: 'Currency',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Currency',
    },
    amount: {
      name: 'Amount',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Currency Amount',
    },
    amountNet: {
      name: 'Amount Net',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Net Amount',
    },
    maxAmountInput: {
      name: 'Max Amount',
      control: 'object',
      type: { name: 'object', required: false },
      description: 'Max Amount',
    },
    recipient: {
      name: 'Recipient',
      control: 'text',
      type: { name: 'string', required: false },
      description: 'Recipient Address',
    },
    onChangeRecipient: {
      name: 'Change Recipient',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user change the address',
    },
    handleMaxInput: {
      name: 'Handle Max Input',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user click on Max button',
    },
    onChangeAmount: {
      name: 'Change Amount',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user change the amount',
    },
    onChangeChainDrawerStatus: {
      name: 'Change Chain Drawer',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user open the ChainDrawer ',
    },
    onChangeTokenDrawerStatus: {
      name: 'Change Token Drawer',
      control: 'function',
      type: { name: 'function', required: false },
      defaultValue: () => {},
      description: 'The function to be called when user open the TokenDrawer ',
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
  chain: undefined,
  currency: undefined,
  amount: undefined,
  amountNet: undefined,
  maxAmountInput: undefined,
  recipient: undefined,
  onChangeRecipient: () => {},
  handleMaxInput: () => {},
  onChangeAmount: () => {},
  onChangeChainDrawerStatus: () => {},
  onChangeTokenDrawerStatus: () => {},
} as Partial<BridgeInputsWidgetProps>;
