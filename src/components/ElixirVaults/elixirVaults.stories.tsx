import { ComponentStory } from '@storybook/react';
import React from 'react';
import ElixirVaults from '.';

export default {
  component: ElixirVaults,
  title: 'DeFi Primitives/ElixirVaults/ElixirVaults',
  parameters: {
    docs: {
      description: {
        component: 'ElixirVaults.',
      },
    },
  },
};

const TemplateElixirVaults: ComponentStory<typeof ElixirVaults> = () => (
  <div>
    <ElixirVaults />
  </div>
);

export const Default = TemplateElixirVaults.bind({});
