import { ComponentStory } from '@storybook/react';
import React from 'react';
import { WatchList } from '.';

export default {
  component: WatchList,
  title: 'Pangolin/WatchList',
};

const TemplateWatchList: ComponentStory<typeof WatchList> = (args: any) => <WatchList {...args} />;

export const Default = TemplateWatchList.bind({});
Default.args = {
  isLimitOrders: false,
};
