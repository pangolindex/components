import { ComponentStory } from '@storybook/react';
import React from 'react';
import { EarnWidgetProps } from './types';
import EarnWidget from '.';

export default {
  component: EarnWidget,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/EarnWidget/Default',
  argTypes: {
    position: {
      name: 'Position',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Position',
    },
  },
};

const TemplateEarnWidget: ComponentStory<typeof EarnWidget> = (args: any) => {
  return (
    <div style={{ maxWidth: 450 }}>
      <EarnWidget {...args} />
    </div>
  );
};

export const Default = TemplateEarnWidget.bind({});
Default.args = {
  position: undefined, // TODO: add position later on
} as Partial<EarnWidgetProps>;
