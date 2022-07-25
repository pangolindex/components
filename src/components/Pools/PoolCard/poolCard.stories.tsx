import { ComponentStory } from '@storybook/react';
import PoolCardV2 from './PoolCardV2';
import { Box } from '../../Box';
import { useGetMinichefStakingInfos } from '../mock';

export default {
  component: PoolCardV2,
  title: 'Components/Pool/PoolCard',
};

const TemplatePoolCardV2: ComponentStory<typeof PoolCardV2> = (args: any) => {
  const stakingInfo = useGetMinichefStakingInfos();
  return (
    <Box maxWidth="380px">
      <PoolCardV2 key={stakingInfo?.pid} stakingInfo={stakingInfo} onClickViewDetail={() => {}} version={2} />
    </Box>
  );
};

export const Dafault = TemplatePoolCardV2.bind({});
