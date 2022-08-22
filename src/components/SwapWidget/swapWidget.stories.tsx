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
