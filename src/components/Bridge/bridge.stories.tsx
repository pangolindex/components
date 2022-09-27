import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '../';
import Bridge from '.';

export default {
  component: Bridge,
  title: 'Components/Bridge/Bridge',
  parameters: {
    docs: {
      description: {
        component: 'This is the main component of the bridge page.',
      },
    },
  },
};

const TemplateBridge: ComponentStory<typeof Bridge> = (args: any) => {
  return (
    <Box maxWidth={'1000px'}>
      <Bridge {...args} />
    </Box>
  );
};

export const Default = TemplateBridge.bind({});
Default.args = {};
