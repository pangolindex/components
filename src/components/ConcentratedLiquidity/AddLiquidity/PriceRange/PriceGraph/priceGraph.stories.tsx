import { ComponentStory } from '@storybook/react';
import React from 'react';
import PriceGraph from '.';

export default {
  component: PriceGraph,
  title: 'DeFi Primitives/ConcentratedLiquidity/AddLiquidity/PriceRange/PriceGraph',
};

const TemplatePriceGraph: ComponentStory<typeof PriceGraph> = () => {
  return (
    <div style={{ width: 'max-content' }}>
      <PriceGraph />
    </div>
  );
};

export const Default = TemplatePriceGraph.bind({});
