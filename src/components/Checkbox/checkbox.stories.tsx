import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Checkbox } from '.';

export default {
  component: Checkbox,
  title: 'Components/Checkbox',
};

const TemplateCheckbox: ComponentStory<typeof Checkbox> = (args: any) => <Checkbox {...args} />;

export const Default = TemplateCheckbox.bind({});
Default.args = {
  label: 'Is Popular',
  labelColor: 'text1',
};
