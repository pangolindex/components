import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '../Box';
import SwapWidget, { SwapWidgetProps } from '.';

export default {
  component: SwapWidget,
  title: 'Components/SwapWidget',
};

const TemplateSwapWidget: ComponentStory<typeof SwapWidget> = (args: any) => {
  return (
    <Box width="100%">
      <Box maxWidth="400px">
        <SwapWidget {...args} />
      </Box>
    </Box>
  );
};

export const Default = TemplateSwapWidget.bind({});
Default.args = {
  isLimitOrderVisible: false,
  showSettings: true,
  defaultInputToken: '',
  defaultOutputToken: '',
};

export const WithDefaultTokenValues = TemplateSwapWidget.bind({});
WithDefaultTokenValues.args = {
  isLimitOrderVisible: false,
  showSettings: true,
  defaultInputToken: '0x5947bb275c521040051d82396192181b413227a3',
  defaultOutputToken: '0x60781c2586d68229fde47564546784ab3faca982',
};

export const Theme = TemplateSwapWidget.bind({});
Theme.args = {
  isLimitOrderVisible: false,
  showSettings: true,
  defaultInputToken: '',
  defaultOutputToken: '',
  theme: {
    swapWidget: {
      backgroundColor: '#88a4b3',
      detailsBackground: '#5f737d',
      interactiveBgColor: '#5f737d',
      interactiveColor: '#e0f4ff',
      primary: '#fff',
      secondary: '#f0faff',
    },
    textInput: {
      labelText: '#f0faff',
    },
    drawer: {
      text: '#fff',
      backgroundColor: '#88a4b3',
    },
    numberOptions: {
      activeTextColor: '#fff',
      text: '#fff',
      activeBackgroundColor: '#5f7d68',
      borderColor: '#88b394',
      inactiveBackgroundColor: '#88b394',
    },
    button: {
      primary: {
        background: '#435557',
        color: '#fff',
      },
    },
  },
} as Partial<SwapWidgetProps>;
