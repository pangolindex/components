import { ComponentStory } from '@storybook/react';
import React from 'react';
import SlippageInput, { SlippageInputProps } from '.';

export default {
  component: SlippageInput,
  title: 'Components/SlippageInput',
};

const TemplateSlippageInput: ComponentStory<typeof SlippageInput> = (args: any) => <SlippageInput {...args} />;

export const Default = TemplateSlippageInput.bind({});
Default.args = {
  expertMode: false,
  slippageTolerance: '1',
  showTitle: true,
  setSlippageTolerance: () => {},
} as Partial<SlippageInputProps>;
