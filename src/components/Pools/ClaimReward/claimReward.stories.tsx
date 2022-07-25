import { ComponentStory } from '@storybook/react';
import ClaimReward from '.';
import { Box } from '../../Box';
import { useGetMinichefStakingInfos } from '../mock';

export default {
  component: ClaimReward,
  title: 'Components/Pool/ClaimReward',
};

const TemplateClaimReward: ComponentStory<typeof ClaimReward> = (args: any) => {
  const stakingInfo = useGetMinichefStakingInfos();
  return (
    <Box maxWidth="376px" position="relative">
      <ClaimReward stakingInfo={stakingInfo} onClose={() => {}} version={2} />
    </Box>
  );
};

export const Dafault = TemplateClaimReward.bind({});
