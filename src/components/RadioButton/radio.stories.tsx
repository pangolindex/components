import { ComponentStory } from '@storybook/react';
import React from 'react';
import { RadioButton } from '.';

export default {
  component: RadioButton,
  title: 'Components/RadioButton',
};

const TemplateRadio: ComponentStory<typeof RadioButton> = (args: any) => <RadioButton {...args} />;

export const Default = TemplateRadio.bind({});
Default.args = {
  label: 'Male',
};
