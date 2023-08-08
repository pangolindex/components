import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '..';
import Ortege from '.';

export default {
  component: Ortege,
  title: 'DeFi Primitives/Ortege/Ortege',
  parameters: {
    docs: {
      description: {
        component:
          "This is the main component of the ortege page. We employ three libraries (3rd Li.Fi, Rango, Squid) to manage the transaction process, a choice necessitated by our system's requirements. Upon clicking the 'Swap' button, the system automatically selects the corresponding BridgeProvider transaction library. Subsequently, we are integrated into the respective third-party library's stream. Any delays that may occur during this process are attributable to these third-party libraries.",
      },
    },
  },
};

const TemplateOrtege: ComponentStory<typeof Ortege> = (args: any) => {
  return (
    <Box maxWidth={'1250px'}>
      <Ortege {...args} />
    </Box>
  );
};

export const Default = TemplateOrtege.bind({});
Default.args = {};
