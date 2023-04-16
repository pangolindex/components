import { ComponentStory } from '@storybook/react';
import React from 'react';
import { DetailTabProps } from './types';
import DetailTab from '.';

export default {
  component: DetailTab,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/Tabs/DetailTab/Default',
  parameters: {
    docs: {
      description: {
        component: 'DetailTab',
      },
    },
  },
  argTypes: {
    position: {
      name: 'Position',
      control: 'object',
      type: { name: 'object', required: true },
      description: 'Position',
    },
  },
};

const TemplateDetailTab: ComponentStory<typeof DetailTab> = (args: any) => {
  return (
    <div style={{ maxWidth: '850px' }}>
      <DetailTab {...args} />
    </div>
  );
};

export const Default = TemplateDetailTab.bind({});
Default.args = {
  position: undefined, // TODO: add position later on
} as Partial<DetailTabProps>;
