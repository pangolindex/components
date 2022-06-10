import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Portifolio } from '.';

export default {
  component: Portifolio,
  title: 'Components/Portifolio',
};

const TemplatePortfolio: ComponentStory<typeof Portifolio> = () => (
  <div style={{ width: 600 }}>
    <Portifolio />
  </div>
);

export const Default = TemplatePortfolio.bind({});
