import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Elixir } from '.';

export default {
  component: Elixir,
  title: 'DeFi Primitives/Elixir/Elixir',
  parameters: {
    docs: {
      description: {
        component: 'Elixir.',
      },
    },
  },
};

const TemplateElixir: ComponentStory<typeof Elixir> = () => (
  <div>
    <Elixir />
  </div>
);

export const Default = TemplateElixir.bind({});
