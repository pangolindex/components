import { ComponentStory } from '@storybook/react';
import React from 'react';
import { CheckboxGroup } from '.';

export default {
  component: CheckboxGroup,
  title: 'Components/CheckboxGroup',
};

const TemplateCheckboxGroup: ComponentStory<typeof CheckboxGroup> = (args: any) => <CheckboxGroup {...args} />;

export const Default = TemplateCheckboxGroup.bind({});
Default.args = {
  options: [
    { label: 'Cricket', value: 'cricket' },
    { label: 'Football', value: 'football' },
    { label: 'Chess', value: 'chess' },
  ],
  type: 'horizontal',
};
