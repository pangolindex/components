import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '@pangolindex/core';
import Bridge from '.';

export default {
  component: Bridge,
  title: 'DeFi Primitives/Bridge/Bridge',
  parameters: {
    docs: {
      description: {
        component:
          "This is the main component of the bridge page. We employ three libraries (3rd Li.Fi, Rango, Squid) to manage the transaction process, a choice necessitated by our system's requirements. Upon clicking the 'Swap' button, the system automatically selects the corresponding BridgeProvider transaction library. Subsequently, we are integrated into the respective third-party library's stream. Any delays that may occur during this process are attributable to these third-party libraries.",
      },
    },
  },
};

const TemplateBridge: ComponentStory<typeof Bridge> = (args: any) => {
  return (
    <Box maxWidth={'1250px'}>
      <Bridge {...args} />
    </Box>
  );
};

export const Default = TemplateBridge.bind({});
Default.args = {};
