import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from 'src/components';
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
  <Box maxWidth={'1250px'}>
    <ConcentratedLiquidity />
  </Box>
);

export const Default = TemplateConcentratedLiquidity.bind({});
