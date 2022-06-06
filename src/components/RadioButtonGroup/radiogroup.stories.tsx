import { ComponentStory } from '@storybook/react';
import React from 'react';
import { RadioButtonGroup } from '.';

export default {
  component: RadioButtonGroup,
  title: 'Components/RadioButtonGroup',
};

const TemplateRadioGroup: ComponentStory<typeof RadioButtonGroup> = (args: any) => <RadioButtonGroup {...args} />;

export const Default = TemplateRadioGroup.bind({});
Default.args = {
  options: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ],
  type: 'horizontal',
};

export const Checked = TemplateRadioGroup.bind({});
Checked.args = {
  options: [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ],
  type: 'horizontal',
  value: 'female',
};
