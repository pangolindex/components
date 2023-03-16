import { ComponentStory } from '@storybook/react';
import React from 'react';
import EarnWidget from '.';

export default {
  component: EarnWidget,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/EarnWidget/Default',
};

const TemplateEarnWidget: ComponentStory<typeof EarnWidget> = () => {
  return (
    <div style={{ maxWidth: 450 }}>
      <EarnWidget />
    </div>
  );
};

export const Default = TemplateEarnWidget.bind({});
