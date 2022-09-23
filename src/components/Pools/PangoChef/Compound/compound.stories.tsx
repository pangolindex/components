import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from 'src/components/Box';
import { useGetPangoChefInfos } from '../../mock';
import CompoundV3 from '.';

export default {
  component: CompoundV3,
  title: 'Components/Pool/CompoundV3',
};

const TemplateClaimReward: ComponentStory<typeof CompoundV3> = () => {
  const stakingInfo = useGetPangoChefInfos();

  return (
    <Box maxWidth="376px" position="relative" bgColor="color2">
      <CompoundV3 stakingInfo={stakingInfo} onClose={() => console.log('close')} />
    </Box>
  );
};

export const Dafault = TemplateClaimReward.bind({});
