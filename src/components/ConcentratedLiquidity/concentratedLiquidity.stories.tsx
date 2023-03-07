import { ComponentStory } from '@storybook/react';
import React from 'react';
import ConcentratedLiquidity from '.';

export default {
  component: ConcentratedLiquidity,
  title: 'DeFi Primitives/ConcentratedLiquidity/ConcentratedLiquidity',
  parameters: {
    docs: {
      description: {
        component: 'ConcentratedLiquidity.',
      },
    },
  },
};

const TemplateConcentratedLiquidity: ComponentStory<typeof ConcentratedLiquidity> = () => (
  <div>
    <ConcentratedLiquidity />
  </div>
);

export const Default = TemplateConcentratedLiquidity.bind({});
