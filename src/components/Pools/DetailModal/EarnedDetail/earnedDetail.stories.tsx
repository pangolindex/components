import { ComponentStory } from '@storybook/react';
import EarnedDetail from '.';
import { Box } from '../../../Box';
import { useGetMinichefStakingInfos } from '../../mock';

export default {
  component: EarnedDetail,
  title: 'Components/Pool/EarnedDetail',
};

const TemplateEarnedDetail: ComponentStory<typeof EarnedDetail> = () => {
  const stakingInfo = useGetMinichefStakingInfos();
  return (
    <Box maxWidth="372px">
      <EarnedDetail stakingInfo={stakingInfo} version={2} />
    </Box>
  );
};

export const Dafault = TemplateEarnedDetail.bind({});
