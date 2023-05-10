import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Switch } from '.';

export default {
  component: Switch,
  title: 'Building Blocks/Switch',
};

const TemplateSwitch: ComponentStory<typeof Switch> = (args: any) => <Switch {...args} />;

export const Default = TemplateSwitch.bind({});
Default.args = {
  checked: false,
  disabled: false,
  offColor: '',
  offHandleColor: '',
  onHandleColor: '',
  onColor: '',
  width: 56,
  height: 28,
};
