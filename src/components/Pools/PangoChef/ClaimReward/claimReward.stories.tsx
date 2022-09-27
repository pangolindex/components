import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from 'src/components/Box';
import { useGetPangoChefInfos } from '../../mock';
import ClaimReward from '.';

export default {
  component: ClaimReward,
  title: 'Components/Pool/ClaimRewardV3',
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
