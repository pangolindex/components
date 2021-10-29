import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '.';

export default {
  component: Box,
  title: 'Pangoline/Box',
};

const TemplateBox: ComponentStory<typeof Box> = (args: any) => (
  <Box {...args} width={200} height={200}>
    Sample Text
  </Box>
);

export const Default = TemplateBox.bind({});
Default.args = {
  color: 'text1',
  bgColor: 'primary1',
};
