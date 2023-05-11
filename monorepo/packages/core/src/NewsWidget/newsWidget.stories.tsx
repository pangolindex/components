import { ComponentStory } from '@storybook/react';
import React from 'react';
import { NewsWidget } from '.';

export default {
  component: NewsWidget,
  title: 'DeFi Primitives/NewsWidget',
};

const TemplateNewsWidget: ComponentStory<typeof NewsWidget> = (args: any) => <NewsWidget {...args} />;

export const Default = TemplateNewsWidget.bind({});
Default.args = {
  boxHeight: '400px',
};
