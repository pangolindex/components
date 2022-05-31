import { ComponentStory } from '@storybook/react';
import React from 'react';
import { WatchList } from '.';

export default {
  component: WatchList,
  title: 'Components/WatchList',
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
