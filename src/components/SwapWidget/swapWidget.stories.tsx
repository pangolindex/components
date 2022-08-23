import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '../Box';
import SwapWidget from '.';

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
