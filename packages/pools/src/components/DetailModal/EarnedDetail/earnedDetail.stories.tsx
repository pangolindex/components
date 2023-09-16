import { Box } from '@honeycomb-finance/core';
import { ComponentStory } from '@storybook/react';
import React from 'react';
import { useGetMinichefStakingInfos } from '../../Pool/mock';
import EarnedDetail from '.';

export default {
  component: EarnedDetail,
  title: 'DeFi Primitives/Pool/EarnedDetail',
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
