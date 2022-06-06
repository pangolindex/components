import { ComponentStory } from '@storybook/react';
import React from 'react';
import { ToggleButtons } from '.';

export default {
  component: ToggleButtons,
  title: 'Components/ToggleButtons',
};

const TemplateRadioGroup: ComponentStory<typeof ToggleButtons> = (args: any) => <ToggleButtons {...args} />;

export const Default = TemplateRadioGroup.bind({});
Default.args = {
  options: ['MARKET', 'LIMIT'],
};

export const Checked = TemplateRadioGroup.bind({});
Checked.args = {
  options: ['MARKET', 'LIMIT'],
  value: 'MARKET',
};
