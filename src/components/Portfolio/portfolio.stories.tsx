import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Portfolio } from '.';

export default {
  component: Portfolio,
  title: 'Components/Portfolio',
};

const TemplatePortfolio: ComponentStory<typeof Portfolio> = () => (
  <div style={{ width: 600 }}>
    <Portfolio />
  </div>
);

export const Default = TemplatePortfolio.bind({});
