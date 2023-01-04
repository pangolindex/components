import { ComponentStory } from '@storybook/react';
import React from 'react';
import { WatchList } from '.';

export default {
  component: WatchList,
  title: 'DeFi Primitives/WatchList',
};

const TemplateWatchList: ComponentStory<typeof WatchList> = (args: any) => (
  <div style={{ width: '800px' }}>
    <WatchList {...args} />
  </div>
);

export const Default = TemplateWatchList.bind({});
Default.args = {
  coinChartVisible: false,
  visibleTradeButton: true,
};
