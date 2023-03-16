import { ComponentStory } from '@storybook/react';
import React from 'react';
import { IncreasePositionProps } from './types';
import IncreasePosition from '.';

export default {
  component: IncreasePosition,
  title: 'DeFi Primitives/ConcentratedLiquidity/DetailModal/IncreasePosition',
  parameters: {
    docs: {
      description: {
        component: 'Increase Position',
      },
    },
  },
};

const TemplateIncreasePosition: ComponentStory<typeof IncreasePosition> = () => {
  return (
    <div style={{ maxWidth: 500 }}>
      <IncreasePosition />
    </div>
  );
};

export const Default = TemplateIncreasePosition.bind({});
Default.args = {} as Partial<IncreasePositionProps>;
