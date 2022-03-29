import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Loader } from '.';

export default {
  component: Loader,
  title: 'Pangolin/Loader',
};

const TemplateBox: ComponentStory<typeof Loader> = (args: any) => <Loader {...args} />;

export const Default = TemplateBox.bind({});
Default.args = {
  size: 100,
  label: 'Loading',
};
