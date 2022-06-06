import { ComponentStory } from '@storybook/react';
import React from 'react';
import { NumberOptions } from '.';

export default {
  component: NumberOptions,
  title: 'Components/NumberOptions',
};

const TemplateNumberOptions: ComponentStory<typeof NumberOptions> = (args: any) => <NumberOptions {...args} />;

export const Default = TemplateNumberOptions.bind({});
Default.args = {
  options: [25, 50, 75, 100],
  isPercentage: true,
  currentValue: 25,
  variant: 'box',
};
