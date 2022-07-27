import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Box } from '../../Box';
import { useGetMinichefStakingInfos } from '../mock';
import PoolCardV2 from './PoolCardV2';

export default {
  component: PoolCardV2,
  title: 'Components/Pool/PoolCard',
};

const TemplatePoolCardV2: ComponentStory<typeof PoolCardV2> = () => {
  const stakingInfo = useGetMinichefStakingInfos();
  return (
    <Box maxWidth="380px">
      <PoolCardV2
        key={stakingInfo?.pid}
        stakingInfo={stakingInfo}
        onClickViewDetail={() => {
          console.log('click View Detail');
        }}
        version={2}
      />
    </Box>
  );
};

export const Dafault = TemplatePoolCardV2.bind({});
