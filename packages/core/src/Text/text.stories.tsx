import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Text } from '.';

export default {
  component: Text,
  title: 'Building Blocks/Text',
};

const TemplateText: ComponentStory<typeof Text> = (args: any) => <Text {...args}>Sample Text</Text>;

export const Default = TemplateText.bind({});
Default.args = {
  color: 'text1',
};
