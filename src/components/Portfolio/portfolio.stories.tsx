import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Portifolio } from '.';

export default {
  component: Portifolio,
  title: 'Components/Portifolio',
};

const TemplatePortfolio: ComponentStory<typeof Portifolio> = () => <Portifolio />;

export const Default = TemplatePortfolio.bind({});
