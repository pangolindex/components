import { ComponentStory } from '@storybook/react';
import React from 'react';
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
};

const TemplateDetailTab: ComponentStory<typeof DetailTab> = () => {
  return (
    <div style={{ maxWidth: '850px' }}>
      <DetailTab />
    </div>
  );
};

export const Default = TemplateDetailTab.bind({});
