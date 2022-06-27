import { ComponentStory } from '@storybook/react';
import React from 'react';
import { MyPortfolio } from '.';

export default {
  component: MyPortfolio,
  title: 'Components/MyPortfolio',
};

const TemplateMyPortfolio: ComponentStory<typeof MyPortfolio> = (args: any) => (
  <div style={{ width: 600 }}>
    <MyPortfolio {...args} />
  </div>
);

export const Default = TemplateMyPortfolio.bind({});
