import { ComponentStory } from '@storybook/react';
import React from 'react';
import { NewsWidget } from '.';

export default {
  component: NewsWidget,
  title: 'Pangolin/NewsWidget',
};

const TemplateNewsWidget: ComponentStory<typeof NewsWidget> = () => <NewsWidget />;

export const Default = TemplateNewsWidget.bind({});
Default.args = {

};
