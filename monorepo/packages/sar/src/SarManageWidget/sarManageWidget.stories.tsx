import { ComponentStory } from '@storybook/react';
import React from 'react';
import SarManageWidget from '.';

export default {
  component: SarManageWidget,
  title: 'DeFi Primitives/SAR Staking/SarManageWidget',
};

const TemplateSarManageWidget: ComponentStory<typeof SarManageWidget> = () => (
  <div style={{ width: '500px' }}>
    <SarManageWidget
      selectedPosition={null}
      onSelectPosition={(position) => {
        console.log(position);
      }}
    />
  </div>
);

export const Default = TemplateSarManageWidget.bind({});
