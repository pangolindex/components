import { Box } from '@pangolindex/core';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { useGetPangoChefInfos } from '../../Pool/mock';
import ClaimReward from '.';

export default {
  component: ClaimReward,
  title: 'DeFi Primitives/Pool/ClaimRewardV3',
};

const TemplateClaimReward: ComponentStory<typeof ClaimReward> = () => {
  const stakingInfo = useGetPangoChefInfos();
  return (
    <Box maxWidth="376px" position="relative">
      <ClaimReward
        stakingInfo={stakingInfo}
        onClose={() => console.log('close')}
        redirectToCompound={() => console.log('Redirect')}
      />
    </Box>
  );
};

export const Dafault = TemplateClaimReward.bind({});
