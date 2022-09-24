import { ComponentStory } from '@storybook/react';
import React from 'react';
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
};

const TemplateBridgeInputsWidget: ComponentStory<typeof BridgeInputsWidget> = (args: any) => {
  return <BridgeInputsWidget {...args} />;
};

export const Default = TemplateBridgeInputsWidget.bind({});
Default.args = {
  title: 'to',
  inputDisabled: false,
  isTokenDrawerOpen: false,
  onTokenDrawerOpen: () => {},
} as Partial<BridgeInputsWidgetProps>;
