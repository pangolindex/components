import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '.';

export default {
  component: Box,
  title: 'Components/Box',
};

const TemplateBox: ComponentStory<typeof Box> = (args: any) => <Box {...args} width={200} height={200} />;

export const Default = TemplateBox.bind({});
Default.args = {
  color: 'text1',
  bgColor: 'primary1',
};
