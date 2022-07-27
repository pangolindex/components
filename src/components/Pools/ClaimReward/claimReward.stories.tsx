import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '../../Box';
import { useGetMinichefStakingInfos } from '../mock';
import ClaimReward from '.';

export default {
  component: ClaimReward,
  title: 'Components/Pool/ClaimReward',
};

const TemplateClaimReward: ComponentStory<typeof ClaimReward> = () => {
  const stakingInfo = useGetMinichefStakingInfos();
  return (
    <Box maxWidth="376px" position="relative">
      <ClaimReward
        stakingInfo={stakingInfo}
        onClose={() => {
          console.log('close');
        }}
        version={2}
      />
    </Box>
  );
};

export const Dafault = TemplateClaimReward.bind({});
